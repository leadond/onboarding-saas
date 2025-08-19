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

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)

    // DocuSign webhook payload structure
    if (payload.event && payload.data) {
      const manager = await IntegrationManager.create()
      await manager.handleWebhook('docusign', payload)
      
      // Process specific DocuSign events
      switch (payload.event) {
        case 'envelope-sent':
          console.log('DocuSign envelope sent:', payload.data.envelopeId)
          // Trigger client notification about document to sign
          break
        case 'envelope-delivered':
          console.log('DocuSign envelope delivered:', payload.data.envelopeId)
          break
        case 'envelope-completed':
          console.log('DocuSign envelope completed:', payload.data.envelopeId)
          // Trigger next step in onboarding process
          break
        case 'envelope-declined':
          console.log('DocuSign envelope declined:', payload.data.envelopeId)
          // Notify team and potentially retry
          break
        case 'envelope-voided':
          console.log('DocuSign envelope voided:', payload.data.envelopeId)
          break
        case 'recipient-completed':
          console.log('DocuSign recipient completed:', payload.data)
          break
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DocuSign webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}