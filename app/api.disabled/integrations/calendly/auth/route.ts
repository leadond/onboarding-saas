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

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get user from session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/calendly/callback`

    if (!CALENDLY_CLIENT_ID) {
      return NextResponse.json({ 
        error: 'Calendly integration not configured',
        message: 'Please set CALENDLY_CLIENT_ID in your environment variables'
      }, { status: 500 })
    }

    // Build Calendly OAuth URL
    const scopes = [
      'read:user',
      'read:event_types',
      'read:scheduled_events',
      'write:scheduled_events'
    ].join(' ')

    const state = Buffer.from(JSON.stringify({
      provider: 'calendly',
      timestamp: Date.now()
    })).toString('base64')

    const authUrl = new URL('https://auth.calendly.com/oauth/authorize')
    authUrl.searchParams.set('client_id', CALENDLY_CLIENT_ID)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('state', state)

    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('Calendly auth error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize Calendly authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}