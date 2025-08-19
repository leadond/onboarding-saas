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
import { createHash, createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

// POST /api/webhooks/nylas - Handle Nylas webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headersList = headers()
    const signature = headersList.get('x-nylas-signature')

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && process.env.NYLAS_WEBHOOK_SECRET) {
      const isValid = verifyNylasSignature(JSON.stringify(body), signature || '', process.env.NYLAS_WEBHOOK_SECRET)
      if (!isValid) {
        console.error('Invalid Nylas webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    console.log('Nylas webhook received:', body)

    // Handle different webhook events
    const { type, data } = body

    switch (type) {
      case 'account.connected':
        await handleAccountConnected(data)
        break
      
      case 'account.running':
        await handleAccountRunning(data)
        break
      
      case 'account.stopped':
        await handleAccountStopped(data)
        break
      
      case 'message.created':
        await handleMessageCreated(data)
        break
      
      case 'message.updated':
        await handleMessageUpdated(data)
        break
      
      case 'thread.replied':
        await handleThreadReplied(data)
        break
      
      case 'event.created':
        await handleEventCreated(data)
        break
      
      case 'event.updated':
        await handleEventUpdated(data)
        break
      
      case 'event.deleted':
        await handleEventDeleted(data)
        break
      
      case 'contact.created':
        await handleContactCreated(data)
        break
      
      case 'contact.updated':
        await handleContactUpdated(data)
        break
      
      default:
        console.log(`Unhandled webhook type: ${type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Nylas webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Verify Nylas webhook signature
function verifyNylasSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false
  
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')
    
    return signature === expectedSignature
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

async function handleAccountConnected(data: any) {
  console.log('Account connected:', data)
  
  try {
    const supabase = await createClient()
    
    // Store account connection event in webhook_events
    await supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'account.connected',
        event_data: {
          account_id: data.account_id,
          email: data.email,
          provider: data.provider,
          status: 'connected'
        },
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    
    console.log('✅ Account connection saved to database')
    
    // TODO: Trigger welcome email sequence
    // TODO: Initialize sync processes
    
  } catch (error) {
    console.error('Error handling account connected:', error)
  }
}

async function handleAccountRunning(data: any) {
  console.log('Account running:', data)
  
  try {
    const supabase = await createClient()
    
    // Store sync running event
    await supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'account.running',
        event_data: {
          account_id: data.account_id,
          sync_state: 'running'
        },
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    
    console.log('✅ Account sync status updated to running')
    
    // TODO: Resume automated workflows
    
  } catch (error) {
    console.error('Error handling account running:', error)
  }
}

async function handleAccountStopped(data: any) {
  console.log('Account stopped:', data)
  
  try {
    const supabase = await createClient()
    
    // Store sync stopped event
    await supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'account.stopped',
        event_data: {
          account_id: data.account_id,
          sync_state: 'stopped',
          error: data.error || 'Account sync stopped'
        },
        processed: true,
        processed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
    
    console.log('✅ Account sync status updated to stopped')
    
    // TODO: Pause automated workflows
    // TODO: Send notification to user
    
  } catch (error) {
    console.error('Error handling account stopped:', error)
  }
}

async function handleMessageCreated(data: any) {
  console.log('Message created:', data)
  
  try {
    const supabase = await createClient()
    
    // Store message creation event
    await supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'message.created',
        event_data: {
          account_id: data.account_id,
          object_id: data.object.id,
          message_subject: data.object.subject,
          thread_id: data.object.thread_id
        },
        processed: false,
        created_at: new Date().toISOString()
      })
    
    // Check if it's a reply to onboarding email
    const threadId = data.object.thread_id
    if (threadId) {
      // TODO: Check if this is related to an onboarding kit
      // TODO: Update client progress if relevant
      // TODO: Trigger follow-up actions
    }
    
    console.log('✅ Message creation event processed')
    
  } catch (error) {
    console.error('Error handling message created:', error)
  }
}

async function handleMessageUpdated(data: any) {
  console.log('Message updated:', data)
  
  try {
    const supabase = await createClient()
    
    // Store message update event
    await supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'message.updated',
        event_data: {
          account_id: data.account_id,
          object_id: data.object.id,
          unread: data.object.unread
        },
        processed: false,
        created_at: new Date().toISOString()
      })
    
    // Handle read receipts and tracking data
    if (data.object.unread === false) {
      // TODO: Update email tracking data (message read)
    }
    
    console.log('✅ Message update event processed')
    
  } catch (error) {
    console.error('Error handling message updated:', error)
  }
}

async function handleThreadReplied(data: any) {
  console.log('Thread replied:', data)
  
  try {
    const supabase = await createClient()
    
    // Store thread reply event
    await supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'thread.replied',
        event_data: {
          account_id: data.account_id,
          object_id: data.object.id,
          thread_id: data.object.thread_id
        },
        processed: false,
        created_at: new Date().toISOString()
      })
    
    // Process client responses - this is crucial for onboarding
    const threadId = data.object.thread_id
    if (threadId) {
      // TODO: Identify which onboarding kit this relates to
      // TODO: Update client progress based on reply
      // TODO: Trigger next steps in workflow automation
      console.log('📧 Client replied to onboarding email thread:', threadId)
    }
    
    console.log('✅ Thread reply event processed')
    
  } catch (error) {
    console.error('Error handling thread replied:', error)
  }
}

async function handleEventCreated(data: any) {
  console.log('Event created:', data)
  
  try {
    const supabase = await createClient()
    
    // Store calendar event creation
    await supabase
      .from('webhook_events')
      .insert({
        source: 'nylas',
        event_type: 'event.created',
        event_data: {
          account_id: data.account_id,
          object_id: data.object.id,
          event_title: data.object.title,
          event_when: data.object.when
        },
        processed: false,
        created_at: new Date().toISOString()
      })
    
    const event = data.object
    
    // Check if this is an onboarding meeting
    if (event.title?.toLowerCase().includes('onboarding') ||
        event.description?.toLowerCase().includes('onboarding')) {
      // TODO: Update onboarding timeline
      // TODO: Send confirmation emails
      // TODO: Prepare meeting materials
      console.log('📅 Onboarding meeting scheduled:', event.title)
    }
    
    console.log('✅ Calendar event creation processed')
    
  } catch (error) {
    console.error('Error handling event created:', error)
  }
}

async function handleEventUpdated(data: any) {
  console.log('Event updated:', data)
  // Update meeting details
  // Send update notifications
}

async function handleEventDeleted(data: any) {
  console.log('Event deleted:', data)
  // Handle cancellations
  // Reschedule if needed
  // Send cancellation notifications
}

async function handleContactCreated(data: any) {
  console.log('Contact created:', data)
  // Sync contact to CRM
  // Update client database
}

async function handleContactUpdated(data: any) {
  console.log('Contact updated:', data)
  // Sync updates to CRM
  // Update client information
}