/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

import { createClient } from '@/lib/supabase/server'
import { 
  IntegrationProvider, 
  UserIntegration, 
  IntegrationEvent,
  IntegrationActionType,
  IntegrationTriggerType
} from './types'

export class IntegrationManager {
  private supabase: any
  
  constructor(supabase?: any) {
    this.supabase = supabase
  }

  static async create() {
    const supabase = await createClient()
    return new IntegrationManager(supabase)
  }

  // Get all available integration providers
  async getProviders(category?: string): Promise<IntegrationProvider[]> {
    try {
      let query = this.supabase
        .from('integration_providers')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        // If table doesn't exist, return empty array (fallback for UI mock data)
        if (error.code === '42P01') {
          console.warn('integration_providers table not found - using mock data in UI')
          return []
        }
        throw error
      }
      return data || []
    } catch (error) {
      console.error('Error fetching providers:', error)
      return []
    }
  }

  // Get user's connected integrations
  async getUserIntegrations(userId: string): Promise<UserIntegration[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_integrations')
        .select(`
          *,
          provider:integration_providers(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          console.warn('user_integrations table not found - database not set up yet')
          return []
        }
        throw error
      }
      return data || []
    } catch (error) {
      console.error('Error fetching user integrations:', error)
      return []
    }
  }

  // Get specific integration by slug
  async getUserIntegration(userId: string, providerSlug: string): Promise<UserIntegration | null> {
    const { data, error } = await this.supabase
      .from('user_integrations')
      .select(`
        *,
        provider:integration_providers(*)
      `)
      .eq('user_id', userId)
      .eq('provider_slug', providerSlug)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Connect a new integration
  async connectIntegration(
    userId: string, 
    providerSlug: string, 
    authData: Record<string, any>,
    settings: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<UserIntegration> {
    // Get provider info
    const { data: provider, error: providerError } = await this.supabase
      .from('integration_providers')
      .select('*')
      .eq('slug', providerSlug)
      .single()

    if (providerError) throw providerError

    // Upsert user integration
    const { data, error } = await this.supabase
      .from('user_integrations')
      .upsert({
        user_id: userId,
        provider_id: provider.id,
        provider_slug: providerSlug,
        auth_data: authData,
        settings,
        metadata,
        sync_status: 'connected',
        is_active: true
      }, {
        onConflict: 'user_id,provider_slug'
      })
      .select()
      .single()

    if (error) throw error

    // Log connection event
    await this.logEvent(userId, data.id, 'sync', { action: 'connected' })

    return data
  }

  // Disconnect integration
  async disconnectIntegration(userId: string, providerSlug: string): Promise<void> {
    const integration = await this.getUserIntegration(userId, providerSlug)
    if (!integration) return

    const { error } = await this.supabase
      .from('user_integrations')
      .update({
        is_active: false,
        sync_status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider_slug', providerSlug)

    if (error) throw error

    // Log disconnection event
    await this.logEvent(userId, integration.id, 'sync', { action: 'disconnected' })
  }

  // Update integration settings
  async updateIntegrationSettings(
    userId: string, 
    providerSlug: string, 
    settings: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('user_integrations')
      .update({
        settings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider_slug', providerSlug)

    if (error) throw error
  }

  // Execute an action on an integration
  async executeAction(
    userId: string, 
    providerSlug: string, 
    actionType: IntegrationActionType,
    parameters: Record<string, any> = {}
  ): Promise<any> {
    const integration = await this.getUserIntegration(userId, providerSlug)
    if (!integration) {
      throw new Error(`Integration ${providerSlug} not found or not connected`)
    }

    try {
      let result: any

      switch (providerSlug) {
        case 'slack':
          result = await this.executeSlackAction(integration, actionType, parameters)
          break
        case 'zapier':
          result = await this.executeZapierAction(integration, actionType, parameters)
          break
        case 'calendly':
          result = await this.executeCalendlyAction(integration, actionType, parameters)
          break
        default:
          throw new Error(`Action execution not implemented for ${providerSlug}`)
      }

      // Log successful action
      await this.logEvent(userId, integration.id, 'action', {
        action_type: actionType,
        parameters,
        result,
        status: 'success'
      })

      return result
    } catch (error) {
      // Log failed action
      await this.logEvent(userId, integration.id, 'error', {
        action_type: actionType,
        parameters,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      })
      
      throw error
    }
  }

  // Handle webhook from integration
  async handleWebhook(
    providerSlug: string, 
    webhookData: any,
    signature?: string
  ): Promise<void> {
    // Verify webhook signature if required
    if (signature && !await this.verifyWebhookSignature(providerSlug, webhookData, signature)) {
      throw new Error('Invalid webhook signature')
    }

    // Find all integrations for this provider
    const { data: integrations, error } = await this.supabase
      .from('user_integrations')
      .select('*')
      .eq('provider_slug', providerSlug)
      .eq('is_active', true)

    if (error) throw error

    // Process webhook for each integration
    for (const integration of integrations) {
      try {
        await this.processWebhookForIntegration(integration, webhookData)
      } catch (error) {
        console.error(`Webhook processing failed for integration ${integration.id}:`, error)
        
        // Log error
        await this.logEvent(integration.user_id, integration.id, 'error', {
          webhook_data: webhookData,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  // Trigger event across all connected integrations
  async triggerEvent(
    userId: string, 
    triggerType: IntegrationTriggerType, 
    eventData: Record<string, any>
  ): Promise<void> {
    const integrations = await this.getUserIntegrations(userId)

    for (const integration of integrations) {
      try {
        await this.processTriggerForIntegration(integration, triggerType, eventData)
      } catch (error) {
        console.error(`Trigger processing failed for ${integration.provider_slug}:`, error)
        
        await this.logEvent(userId, integration.id, 'error', {
          trigger_type: triggerType,
          event_data: eventData,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
  }

  // Log integration event
  async logEvent(
    userId: string,
    integrationId: string,
    eventType: 'sync' | 'webhook' | 'action' | 'error',
    eventData: Record<string, any>,
    status: 'success' | 'error' | 'pending' = 'success'
  ): Promise<void> {
    const { error } = await this.supabase
      .from('integration_events')
      .insert({
        user_id: userId,
        integration_id: integrationId,
        event_type: eventType,
        event_data: eventData,
        status,
        error_message: status === 'error' ? eventData.error : null
      })

    if (error) {
      console.error('Failed to log integration event:', error)
    }
  }

  // Private methods for specific integrations
  private async executeSlackAction(
    integration: UserIntegration, 
    actionType: IntegrationActionType, 
    parameters: Record<string, any>
  ): Promise<any> {
    const { SlackService } = await import('./providers/slack')
    const slack = new SlackService(integration.auth_data.access_token)
    
    switch (actionType) {
      case 'slack.send_message':
        return await slack.sendMessage(parameters.channel, parameters.text, parameters.blocks)
      case 'slack.create_channel':
        return await slack.createChannel(parameters.name, parameters.is_private)
      case 'slack.invite_user':
        return await slack.inviteUserToChannel(parameters.channel, parameters.user)
      default:
        throw new Error(`Slack action ${actionType} not implemented`)
    }
  }

  private async executeZapierAction(
    integration: UserIntegration, 
    actionType: IntegrationActionType, 
    parameters: Record<string, any>
  ): Promise<any> {
    // Zapier webhook trigger
    if (integration.settings.webhook_url) {
      const response = await fetch(integration.settings.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parameters)
      })
      
      if (!response.ok) {
        throw new Error(`Zapier webhook failed: ${response.statusText}`)
      }
      
      return await response.json()
    }
    
    throw new Error('Zapier webhook URL not configured')
  }

  private async executeCalendlyAction(
    integration: UserIntegration, 
    actionType: IntegrationActionType, 
    parameters: Record<string, any>
  ): Promise<any> {
    const { CalendlyService } = await import('./providers/calendly')
    const calendly = new CalendlyService(integration.auth_data.access_token)
    
    switch (actionType) {
      case 'calendar.create_event':
        return await calendly.createEvent(parameters)
      case 'calendar.book_meeting':
        return await calendly.bookMeeting(parameters)
      default:
        throw new Error(`Calendly action ${actionType} not implemented`)
    }
  }

  private async verifyWebhookSignature(
    providerSlug: string, 
    data: any, 
    signature: string
  ): Promise<boolean> {
    // Implement signature verification for each provider
    // This is a security measure to ensure webhooks are legitimate
    return true // Placeholder
  }

  private async processWebhookForIntegration(
    integration: UserIntegration, 
    webhookData: any
  ): Promise<void> {
    // Process webhook data based on provider and event type
    await this.logEvent(integration.user_id, integration.id, 'webhook', {
      webhook_data: webhookData,
      processed_at: new Date().toISOString()
    })
  }

  private async processTriggerForIntegration(
    integration: UserIntegration, 
    triggerType: IntegrationTriggerType, 
    eventData: Record<string, any>
  ): Promise<void> {
    // Process trigger based on integration settings and trigger type
    const providerSlug = integration.provider_slug

    // Example: Send Slack notification when client completes onboarding
    if (triggerType === 'client.completed_onboarding' && providerSlug === 'slack') {
      await this.executeAction(
        integration.user_id,
        'slack',
        'slack.send_message',
        {
          channel: integration.settings.default_channel || '#general',
          text: `🎉 Client ${eventData.client_name} just completed their onboarding!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Client Onboarding Complete!*\n\n*Client:* ${eventData.client_name}\n*Email:* ${eventData.client_email}\n*Completion Time:* ${new Date().toLocaleString()}`
              }
            }
          ]
        }
      )
    }

    // Example: Create Zapier webhook trigger
    if (providerSlug === 'zapier' && integration.settings.trigger_events?.includes(triggerType)) {
      await this.executeAction(
        integration.user_id,
        'zapier',
        'zapier.trigger',
        {
          trigger_type: triggerType,
          event_data: eventData
        }
      )
    }
  }
}