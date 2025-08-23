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
import { IntegrationManager } from '@/lib/integrations/manager'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('calendly-webhook-signature')

    // Verify Calendly webhook signature (if configured)
    if (signature && process.env.CALENDLY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.CALENDLY_WEBHOOK_SECRET)
        .update(body)
        .digest('base64')

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)

    // Handle different Calendly events
    if (payload.event) {
      const manager = await IntegrationManager.create()
      await manager.handleWebhook('calendly', payload, signature || undefined)
      
      // Process specific events
      switch (payload.event) {
        case 'invitee.created':
          // Meeting booked
          console.log('Calendly meeting booked:', payload.payload)
          break
        case 'invitee.canceled':
          // Meeting canceled
          console.log('Calendly meeting canceled:', payload.payload)
          break
        case 'invitee_no_show.created':
          // No-show recorded
          console.log('Calendly no-show:', payload.payload)
          break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Calendly webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}