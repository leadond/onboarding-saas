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
import { getSupabaseClient } from '@/lib/supabase'
import { IntegrationManager } from '@/lib/integrations/manager'
import { CalendlyService } from '@/lib/integrations/providers/calendly'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=${encodeURIComponent(error)}`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=no_code`
      )
    }

    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?redirect=/dashboard/integrations`
      )
    }

    // Exchange code for access token
    const tokenResponse = await CalendlyService.exchangeCodeForToken(
      process.env.CALENDLY_CLIENT_ID!,
      process.env.CALENDLY_CLIENT_SECRET!,
      code,
      process.env.CALENDLY_REDIRECT_URI!
    )

    // Get user info and event types
    const calendlyService = new CalendlyService(tokenResponse.access_token)
    const userInfo = await calendlyService.getCurrentUser()
    const eventTypes = await calendlyService.getEventTypes(userInfo.resource.uri)

    // Store integration
    const manager = new IntegrationManager(supabase)
    await manager.connectIntegration(
      user.id,
      'calendly',
      {
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope,
        expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
      },
      {
        // Default settings
        default_event_type: eventTypes.collection?.[0]?.uri || null,
        buffer_time: 15, // minutes
        working_hours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        }
      },
      {
        user_name: userInfo.resource.name,
        user_uri: userInfo.resource.uri,
        organization: userInfo.resource.current_organization,
        timezone: userInfo.resource.timezone,
        event_types_count: eventTypes.collection?.length || 0
      }
    )

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=calendly_connected`
    )
  } catch (error) {
    console.error('Calendly OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=connection_failed`
    )
  }
}