import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createProtectedRoute } from '@/lib/api/gateway'

// Validation schemas
const analyticsQuerySchema = z.object({
  kit_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  metric: z.string().optional(),
})

const behaviorEventSchema = z.object({
  kit_id: z.string(),
  event_type: z.string(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/v1/analytics - Get analytics data
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    const { user } = context
    const supabase = createClient()

    try {
      const searchParams = request.nextUrl.searchParams
      const queryParams = {
        kit_id: searchParams.get('kit_id'),
        start_date: searchParams.get('start_date'),
        end_date: searchParams.get('end_date'),
        metric: searchParams.get('metric'),
      }

      const validatedParams = analyticsQuerySchema.parse(queryParams)

      // Verify kit ownership if kit_id provided
      if (validatedParams.kit_id) {
        const { data: kit, error: kitError } = await supabase
          .from('kits')
          .select('id')
          .eq('id', validatedParams.kit_id)
          .eq('user_id', user.id)
          .single()

        if (kitError || !kit) {
          return NextResponse.json(
            { error: 'Kit not found or access denied' },
            { status: 404 }
          )
        }
      }

      // Get analytics data
      const { data: analytics, error } = await supabase
        .from('kit_analytics')
        .select('*')
        .eq('kit_id', validatedParams.kit_id || '')
        .order('date', { ascending: false })
        .limit(100)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        data: analytics || [],
      })
    } catch (error) {
      console.error('Analytics GET error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/analytics - Track behavior event
export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    const { user } = context
    const supabase = createClient()

    try {
      const body = await request.json()
      const validatedData = behaviorEventSchema.parse(body)

      // Verify kit ownership
      const { data: kit, error: kitError } = await supabase
        .from('kits')
        .select('id')
        .eq('id', validatedData.kit_id)
        .eq('user_id', user.id)
        .single()

      if (kitError || !kit) {
        return NextResponse.json(
          { error: 'Kit not found or access denied' },
          { status: 404 }
        )
      }

      // Track the event
      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          resource_type: 'kit',
          resource_id: validatedData.kit_id,
          action: validatedData.event_type,
          metadata: validatedData.metadata || {},
        })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: 'Event tracked successfully',
      })
    } catch (error) {
      console.error('Analytics POST error:', error)
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      )
    }
  }
)
