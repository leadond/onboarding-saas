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
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createProtectedRoute } from '@/lib/api/gateway'

// Validation schemas
const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().optional(),
})

// GET /api/v1/webhooks - List webhooks
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    const { user } = context
    const supabase = await createClient()

    try {
      const { data: webhooks, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: webhooks || [],
      })
    } catch (error) {
      console.error('Webhooks GET error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch webhooks' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/webhooks - Create webhook
export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    const { user } = context
    const supabase = await createClient()

    try {
      const body = await request.json()
      const validatedData = webhookSchema.parse(body)

      // Create webhook event
      const { data: webhook, error } = await supabase
        .from('webhook_events')
        .insert({
          event_type: 'webhook_created',
          payload: validatedData,
          processed: false,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: webhook,
      }, { status: 201 })
    } catch (error) {
      console.error('Webhooks POST error:', error)
      return NextResponse.json(
        { error: 'Failed to create webhook' },
        { status: 500 }
      )
    }
  }
)
