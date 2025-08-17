import { createClient } from '@/lib/supabase/client'
import crypto from 'crypto'

export interface WebhookEvent {
  type: string
  data: any
  timestamp: string
  user_id: string
}

export interface WebhookEndpoint {
  id: string
  user_id: string
  name: string
  url: string
  secret: string
  events: string[]
  is_active: boolean
  retry_count: number
  timeout_seconds: number
}

export interface WebhookDelivery {
  id: string
  webhook_endpoint_id: string
  event_type: string
  payload: any
  status: 'pending' | 'success' | 'failed' | 'retrying'
  http_status_code?: number
  response_body?: string
  error_message?: string
  attempt_count: number
  next_retry_at?: string
  delivered_at?: string
}

export class WebhookManager {
  private static instance: WebhookManager
  private deliveryQueue: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): WebhookManager {
    if (!WebhookManager.instance) {
      WebhookManager.instance = new WebhookManager()
    }
    return WebhookManager.instance
  }

  /**
   * Emit a webhook event to all subscribed endpoints
   */
  async emit(event: WebhookEvent): Promise<void> {
    const supabase = createClient()

    // Get all active webhook endpoints for this user that subscribe to this event type
    const { data: endpoints, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('user_id', event.user_id)
      .eq('is_active', true)
      .contains('events', [event.type])

    if (error) {
      console.error('Error fetching webhook endpoints:', error)
      return
    }

    if (!endpoints || endpoints.length === 0) {
      return
    }

    // Create delivery records for each endpoint
    const deliveries = endpoints.map(endpoint => ({
      webhook_endpoint_id: endpoint.id,
      event_type: event.type,
      payload: {
        id: crypto.randomUUID(),
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
        user_id: event.user_id
      },
      status: 'pending' as const,
      attempt_count: 0,
      next_retry_at: new Date().toISOString()
    }))

    const { data: createdDeliveries, error: deliveryError } = await supabase
      .from('webhook_deliveries')
      .insert(deliveries)
      .select()

    if (deliveryError) {
      console.error('Error creating webhook deliveries:', deliveryError)
      return
    }

    // Schedule immediate delivery for each webhook
    for (const delivery of createdDeliveries) {
      this.scheduleDelivery(delivery.id)
    }
  }

  /**
   * Schedule webhook delivery (with retry logic)
   */
  private scheduleDelivery(deliveryId: string, delayMs: number = 0): void {
    const timeout = setTimeout(async () => {
      await this.attemptDelivery(deliveryId)
      this.deliveryQueue.delete(deliveryId)
    }, delayMs)

    this.deliveryQueue.set(deliveryId, timeout)
  }

  /**
   * Attempt to deliver a webhook
   */
  private async attemptDelivery(deliveryId: string): Promise<void> {
    const supabase = createClient()

    // Get delivery details with endpoint info
    const { data: delivery, error } = await supabase
      .from('webhook_deliveries')
      .select(`
        *,
        webhook_endpoints (
          url,
          secret,
          timeout_seconds,
          retry_count
        )
      `)
      .eq('id', deliveryId)
      .single()

    if (error || !delivery) {
      console.error('Error fetching webhook delivery:', error)
      return
    }

    const endpoint = delivery.webhook_endpoints as any
    const attemptCount = delivery.attempt_count + 1

    try {
      // Create webhook signature
      const signature = this.createSignature(
        JSON.stringify(delivery.payload),
        endpoint.secret
      )

      // Make HTTP request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout_seconds * 1000)

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Delivery': deliveryId,
          'User-Agent': 'Onboard Hero-Webhooks/1.0'
        },
        body: JSON.stringify(delivery.payload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseBody = await response.text()

      if (response.ok) {
        // Success
        await supabase
          .from('webhook_deliveries')
          .update({
            status: 'success',
            http_status_code: response.status,
            response_body: responseBody.slice(0, 1000), // Limit response body size
            attempt_count: attemptCount,
            delivered_at: new Date().toISOString()
          })
          .eq('id', deliveryId)

        // Update endpoint success timestamp
        await supabase
          .from('webhook_endpoints')
          .update({
            last_success_at: new Date().toISOString(),
            failure_count: 0
          })
          .eq('id', delivery.webhook_endpoint_id)

      } else {
        // HTTP error
        await this.handleDeliveryFailure(
          deliveryId,
          delivery.webhook_endpoint_id,
          attemptCount,
          endpoint.retry_count,
          `HTTP ${response.status}: ${responseBody.slice(0, 500)}`,
          response.status
        )
      }

    } catch (error: any) {
      // Network or other error
      await this.handleDeliveryFailure(
        deliveryId,
        delivery.webhook_endpoint_id,
        attemptCount,
        endpoint.retry_count,
        error.message || 'Network error'
      )
    }
  }

  /**
   * Handle webhook delivery failure with retry logic
   */
  private async handleDeliveryFailure(
    deliveryId: string,
    endpointId: string,
    attemptCount: number,
    maxRetries: number,
    errorMessage: string,
    httpStatusCode?: number
  ): Promise<void> {
    const supabase = createClient()

    if (attemptCount < maxRetries) {
      // Schedule retry with exponential backoff
      const retryDelayMs = Math.min(1000 * Math.pow(2, attemptCount - 1), 300000) // Max 5 minutes
      const nextRetryAt = new Date(Date.now() + retryDelayMs).toISOString()

      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'retrying',
          http_status_code: httpStatusCode,
          error_message: errorMessage,
          attempt_count: attemptCount,
          next_retry_at: nextRetryAt
        })
        .eq('id', deliveryId)

      // Schedule retry
      this.scheduleDelivery(deliveryId, retryDelayMs)

    } else {
      // Max retries reached, mark as failed
      await supabase
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          http_status_code: httpStatusCode,
          error_message: errorMessage,
          attempt_count: attemptCount
        })
        .eq('id', deliveryId)

      // Update endpoint failure count
      await supabase
        .from('webhook_endpoints')
        .update({
          last_failure_at: new Date().toISOString(),
          failure_count: supabase.rpc('increment', { x: 1 })
        })
        .eq('id', endpointId)
    }
  }

  /**
   * Create HMAC signature for webhook verification
   */
  private createSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    return `sha256=${hmac.digest('hex')}`
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    const receivedSignature = signature.replace('sha256=', '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )
  }

  /**
   * Process pending webhook deliveries (for background job)
   */
  async processPendingDeliveries(): Promise<void> {
    const supabase = createClient()

    const { data: pendingDeliveries, error } = await supabase
      .from('webhook_deliveries')
      .select('id')
      .in('status', ['pending', 'retrying'])
      .lte('next_retry_at', new Date().toISOString())
      .limit(100)

    if (error || !pendingDeliveries) {
      console.error('Error fetching pending deliveries:', error)
      return
    }

    for (const delivery of pendingDeliveries) {
      this.scheduleDelivery(delivery.id)
    }
  }

  /**
   * Clean up old webhook deliveries
   */
  async cleanupOldDeliveries(daysToKeep: number = 30): Promise<number> {
    const supabase = createClient()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { error, count } = await supabase
      .from('webhook_deliveries')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      console.error('Error cleaning up webhook deliveries:', error)
      return 0
    }

    return count || 0
  }
}

// Webhook event types
export const WEBHOOK_EVENTS = {
  // Kit events
  KIT_CREATED: 'kit.created',
  KIT_UPDATED: 'kit.updated',
  KIT_DELETED: 'kit.deleted',
  KIT_PUBLISHED: 'kit.published',
  KIT_ARCHIVED: 'kit.archived',

  // Client progress events
  CLIENT_STARTED: 'client.started',
  CLIENT_STEP_COMPLETED: 'client.step_completed',
  CLIENT_COMPLETED: 'client.completed',
  CLIENT_ABANDONED: 'client.abandoned',

  // Integration events
  INTEGRATION_CONNECTED: 'integration.connected',
  INTEGRATION_DISCONNECTED: 'integration.disconnected',
  INTEGRATION_ERROR: 'integration.error',

  // Payment events
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',

  // File events
  FILE_UPLOADED: 'file.uploaded',
  FILE_DELETED: 'file.deleted',

  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted'
} as const

export type WebhookEventType = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS]

// Helper function to emit webhook events
export async function emitWebhookEvent(
  type: WebhookEventType,
  data: any,
  userId: string
): Promise<void> {
  const webhookManager = WebhookManager.getInstance()
  
  await webhookManager.emit({
    type,
    data,
    timestamp: new Date().toISOString(),
    user_id: userId
  })
}