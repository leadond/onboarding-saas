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

import { NextRequest, NextResponse } from 'next/server'
import { IntegrationManager } from '@/lib/integrations/manager'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-slack-signature')
    const timestamp = request.headers.get('x-slack-request-timestamp')

    // Verify Slack webhook signature
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature or timestamp' }, { status: 400 })
    }

    // Check timestamp to prevent replay attacks (optional but recommended)
    const currentTime = Math.floor(Date.now() / 1000)
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) { // 5 minutes
      return NextResponse.json({ error: 'Request too old' }, { status: 400 })
    }

    // Verify signature
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!
    const basestring = `v0:${timestamp}:${body}`
    const expectedSignature = `v0=${crypto
      .createHmac('sha256', slackSigningSecret)
      .update(basestring)
      .digest('hex')}`

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge })
    }

    // Handle event callbacks
    if (payload.type === 'event_callback') {
      const manager = await IntegrationManager.create()
      await manager.handleWebhook('slack', payload, signature)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Slack webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}