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
import { SlackService } from '@/lib/integrations/providers/slack'

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
    const tokenResponse = await SlackService.exchangeCodeForToken(
      process.env.SLACK_CLIENT_ID!,
      process.env.SLACK_CLIENT_SECRET!,
      code,
      process.env.SLACK_REDIRECT_URI!
    )

    // Get additional team/user info
    const slackService = new SlackService(tokenResponse.access_token)
    const teamInfo = await slackService.getTeamInfo()

    // Store integration
    const manager = new IntegrationManager(supabase)
    await manager.connectIntegration(
      user.id,
      'slack',
      {
        access_token: tokenResponse.access_token,
        scope: tokenResponse.scope,
        token_type: tokenResponse.token_type,
        bot_user_id: tokenResponse.bot_user_id,
        app_id: tokenResponse.app_id
      },
      {
        // Default settings
        default_channel: '#general',
        notification_types: ['client.completed_onboarding', 'client.invited'],
        mention_users: false
      },
      {
        team_name: teamInfo.team.name,
        team_id: teamInfo.team.id,
        team_domain: teamInfo.team.domain,
        bot_user_id: tokenResponse.bot_user_id
      }
    )

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=slack_connected`
    )
  } catch (error) {
    console.error('Slack OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=connection_failed`
    )
  }
}