/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { handleStripeWebhook } from '@/lib/stripe/billing'
import type { StripeWebhookEvent, WebhookProcessingResult } from '@/types'

/**
 * Process different Stripe webhook events
 */
async function processWebhookEvent(event: StripeWebhookEvent): Promise<WebhookProcessingResult> {
  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any

        // Update user subscription status
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('Error updating user subscription:', error)
          return { success: false, processed: false, error: error.message }
        }

        console.log(`Processed subscription ${event.type} for customer ${subscription.customer}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any

        // Update user subscription status to active if payment succeeded
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', invoice.customer)

        if (error) {
          console.error('Error updating user after payment success:', error)
          return { success: false, processed: false, error: error.message }
        }

        console.log(`Processed payment success for customer ${invoice.customer}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any

        // Update user subscription status to past_due if payment failed
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', invoice.customer)

        if (error) {
          console.error('Error updating user after payment failure:', error)
          return { success: false, processed: false, error: error.message }
        }

        console.log(`Processed payment failure for customer ${invoice.customer}`)
        break
      }

      case 'customer.created':
      case 'customer.updated': {
        const customer = event.data.object as any

        // Update user information from Stripe customer data
        const { error } = await supabase
          .from('users')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customer.id)

        if (error) {
          console.error('Error updating user from customer data:', error)
          return { success: false, processed: false, error: error.message }
        }

        console.log(`Processed customer ${event.type} for ${customer.id}`)
        break
      }

      case 'setup_intent.succeeded': {
        const setupIntent = event.data.object as any
        console.log(`Setup intent succeeded for customer ${setupIntent.customer}`)
        // This event indicates a payment method was successfully set up
        // No database updates needed as this is handled by the update-payment-method endpoint
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
        return { success: true, processed: false }
    }

    // Log the webhook event
    const { error: logError } = await supabase
      .from('webhook_events')
      .insert({
        source: 'stripe',
        event_type: event.type,
        event_data: event.data,
        processed: true,
        processed_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Error logging webhook event:', logError)
    }

    return { success: true, processed: true }
  } catch (error) {
    console.error('Error processing webhook event:', error)

    // Log the failed webhook event
    const { error: insertError } = await supabase
      .from('webhook_events')
      .insert({
        source: 'stripe',
        event_type: event.type,
        event_data: event.data,
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
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify and construct the webhook event
    const webhookResult = await handleStripeWebhook(body, signature)

    if (!webhookResult.success) {
      return NextResponse.json(
        { success: false, error: webhookResult.error },
        { status: 400 }
      )
    }

    const event = webhookResult.data as StripeWebhookEvent

    // Process the webhook event
    const processingResult = await processWebhookEvent(event)

    if (!processingResult.success) {
      return NextResponse.json(
        { success: false, error: processingResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      processed: processingResult.processed,
      eventType: event.type,
    })
  } catch (error) {
    console.error('Error in Stripe webhook handler:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}