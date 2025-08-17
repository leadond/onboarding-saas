import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/client'
import { boldSignClient } from '@/lib/integrations/boldsign-client'
import crypto from 'crypto'

/**
 * Verify BoldSign webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    // BoldSign sends signature in format: sha256=<hash>
    const receivedSignature = signature.replace('sha256=', '')
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Process BoldSign webhook events
 */
async function processBoldSignWebhook(event: any) {
  const supabase = await createClient()

  try {
    const { eventType, eventData } = event
    const documentId = eventData?.documentId

    if (!documentId) {
      console.error('No document ID found in webhook event')
      return { success: false, error: 'Missing document ID' }
    }

    // Process the webhook event using the BoldSign client
    await boldSignClient.processWebhookEvent({
      documentId,
      eventType,
      eventData,
    })

    // Log the webhook event
    const { error: logError } = await supabase
      .from('webhook_events')
      .insert({
        source: 'boldsign',
        event_type: eventType,
        event_id: documentId,
        event_data: eventData,
        processed: true,
        processed_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Error logging webhook event:', logError)
    }

    console.log(`Processed BoldSign webhook: ${eventType} for document ${documentId}`)
    return { success: true, processed: true }
  } catch (error) {
    console.error('Error processing BoldSign webhook:', error)

    // Log the failed webhook event
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        source: 'boldsign',
        event_type: event.eventType || 'unknown',
        event_id: event.eventData?.documentId || 'unknown',
        event_data: event.eventData || {},
        processed: false,
      })

    if (insertError) {
      console.error('Error logging failed webhook event:', insertError)
    }

    return {
      success: false,
      processed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('x-boldsign-signature')

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing x-boldsign-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const webhookSecret = process.env.BOLDSIGN_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('BOLDSIGN_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const isValidSignature = verifyWebhookSignature(body, signature, webhookSecret)
    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Parse the webhook payload
    const event = JSON.parse(body)

    // Process the webhook event
    const processingResult = await processBoldSignWebhook(event)

    if (!processingResult.success) {
      return NextResponse.json(
        { success: false, error: processingResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      processed: processingResult.processed,
      eventType: event.eventType,
    })
  } catch (error) {
    console.error('Error in BoldSign webhook handler:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}