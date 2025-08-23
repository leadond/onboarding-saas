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

    const DOCUSIGN_CLIENT_ID = process.env.DOCUSIGN_CLIENT_ID
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/docusign/callback`

    if (!DOCUSIGN_CLIENT_ID) {
      return NextResponse.json({ 
        error: 'DocuSign integration not configured',
        message: 'Please set DOCUSIGN_CLIENT_ID in your environment variables'
      }, { status: 500 })
    }

    // Build DocuSign OAuth URL
    const scopes = [
      'signature',
      'impersonation'
    ].join(' ')

    const state = Buffer.from(JSON.stringify({
      provider: 'docusign',
      timestamp: Date.now()
    })).toString('base64')

    // Use sandbox for development, production for live
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://account.docusign.com' 
      : 'https://account-d.docusign.com'

    const authUrl = new URL(`${baseUrl}/oauth/auth`)
    authUrl.searchParams.set('client_id', DOCUSIGN_CLIENT_ID)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('state', state)

    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('DocuSign auth error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize DocuSign authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}