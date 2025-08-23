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
import { nylasClient } from '@/lib/integrations/nylas-client'
import { protectedRoute } from '@/lib/auth/protected-route'

// GET /api/integrations/nylas/messages - Get messages
export async function GET(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url)
      const accountId = searchParams.get('account_id') || 'acc-1'
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')
      const unread = searchParams.get('unread') === 'true'

      const messages = await nylasClient.getMessages(accountId, {
        limit,
        offset,
        unread,
      })

      return NextResponse.json({
        success: true,
        data: {
          messages,
          total: messages.length,
          has_more: messages.length === limit,
        },
      })
    } catch (error) {
      console.error('Nylas messages error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }
  })
}

// POST /api/integrations/nylas/messages - Send message
export async function POST(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const body = await request.json()
      const { account_id, to, subject, body: messageBody, tracking } = body

      const message = await nylasClient.sendMessage(account_id, {
        account_id,
        to: Array.isArray(to) ? to : [{ email: to }],
        subject,
        body: messageBody,
        tracking: tracking ? {
          opens: true,
          links: true,
          thread_replies: true,
        } : undefined,
      })

      return NextResponse.json({
        success: true,
        data: { message },
      })
    } catch (error) {
      console.error('Nylas send message error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      )
    }
  })
}