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

    const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/slack/callback`

    if (!SLACK_CLIENT_ID) {
      return NextResponse.json({ 
        error: 'Slack integration not configured',
        message: 'Please set SLACK_CLIENT_ID in your environment variables'
      }, { status: 500 })
    }

    // Build Slack OAuth URL
    const scopes = [
      'chat:write',
      'channels:read',
      'groups:read',
      'im:read',
      'mpim:read',
      'users:read',
      'team:read'
    ].join(',')

    const state = Buffer.from(JSON.stringify({
      provider: 'slack',
      timestamp: Date.now()
    })).toString('base64')

    const authUrl = new URL('https://slack.com/oauth/v2/authorize')
    authUrl.searchParams.set('client_id', SLACK_CLIENT_ID)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.set('state', state)

    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('Slack auth error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize Slack authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}