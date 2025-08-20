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

// GET /api/integrations/nylas/scheduling - Get scheduling pages
export async function GET(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url)
      const accountId = searchParams.get('account_id') || 'acc-1'
      const pages = await nylasClient.getSchedulingPages(accountId)

      return NextResponse.json({
        success: true,
        data: { pages },
      })
    } catch (error) {
      console.error('Nylas scheduling error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch scheduling pages' },
        { status: 500 }
      )
    }
  })
}

// POST /api/integrations/nylas/scheduling - Create scheduling page
export async function POST(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const body = await request.json()
      const { name, duration, description, available_days, available_times, appearance } = body

      const page = await nylasClient.createSchedulingPage({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        config: {
          event: {
            title: name,
            duration,
            description,
          },
          availability: {
            duration_minutes: duration,
            interval_minutes: 15,
            minimum_booking_notice: 60,
            maximum_booking_notice: 10080,
            available_days,
            available_times,
          },
          booking: {
            confirmation_method: 'automatic',
          },
        },
        appearance: {
          color: appearance?.color || '#1a73e8',
          show_nylas_branding: false,
          submit_text: appearance?.submit_text || 'Book Meeting',
          thank_you_text: appearance?.thank_you_text || 'Your meeting has been booked!',
        },
      })

      return NextResponse.json({
        success: true,
        data: { page },
      })
    } catch (error) {
      console.error('Nylas create scheduling page error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create scheduling page' },
        { status: 500 }
      )
    }
  })
}