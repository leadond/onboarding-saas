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
import { nylasClient } from '@/lib/integrations/nylas-client'
import { protectedRoute } from '@/lib/auth/protected-route'

// GET /api/integrations/nylas/calendar - Get calendars and events
export async function GET(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url)
      const accountId = searchParams.get('account_id') || 'acc-1'
      const action = searchParams.get('action') || 'calendars'

      if (action === 'calendars') {
        const calendars = await nylasClient.getCalendars(accountId)
        return NextResponse.json({
          success: true,
          data: { calendars },
        })
      }

      if (action === 'events') {
        const startTime = searchParams.get('start_time')
        const endTime = searchParams.get('end_time')
        const calendarId = searchParams.get('calendar_id')

        const events = await nylasClient.getEvents(accountId, {
          calendar_id: calendarId,
          starts_after: startTime ? parseInt(startTime) : undefined,
          ends_before: endTime ? parseInt(endTime) : undefined,
        })

        return NextResponse.json({
          success: true,
          data: { events },
        })
      }

      if (action === 'free-busy') {
        const emails = searchParams.get('emails')?.split(',') || []
        const startTime = parseInt(searchParams.get('start_time') || '0')
        const endTime = parseInt(searchParams.get('end_time') || '0')

        const freeBusy = await nylasClient.getFreeBusy(emails, startTime, endTime)

        return NextResponse.json({
          success: true,
          data: { free_busy: freeBusy },
        })
      }

      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    } catch (error) {
      console.error('Nylas calendar error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch calendar data' },
        { status: 500 }
      )
    }
  })
}

// POST /api/integrations/nylas/calendar - Create event
export async function POST(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const body = await request.json()
      const { account_id, calendar_id, title, description, location, when, participants } = body

      const event = await nylasClient.createEvent(account_id, calendar_id, {
        title,
        description,
        location,
        when,
        participants,
      })

      return NextResponse.json({
        success: true,
        data: { event },
      })
    } catch (error) {
      console.error('Nylas create event error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create event' },
        { status: 500 }
      )
    }
  })
}