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
import { createClient } from '@/lib/supabase/server'
import { IntegrationManager } from '@/lib/integrations/manager'
import { DocuSignService } from '@/lib/integrations/providers/docusign'

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

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signin?redirect=/dashboard/integrations`
      )
    }

    // Exchange code for access token
    const tokenResponse = await DocuSignService.exchangeCodeForToken(
      process.env.DOCUSIGN_CLIENT_ID!,
      process.env.DOCUSIGN_CLIENT_SECRET!,
      code,
      process.env.DOCUSIGN_BASE_URL?.replace('/restapi', '') || 'https://account-d.docusign.com'
    )

    // Get user info to determine base URL and account ID
    const userInfo = await DocuSignService.getUserInfo(
      tokenResponse.access_token,
      process.env.DOCUSIGN_BASE_URL?.replace('/restapi', '') || 'https://account-d.docusign.com'
    )

    const account = userInfo.accounts[0] // Use first account
    const baseUrl = account.base_uri + '/restapi'

    // Get account details
    const docuSignService = new DocuSignService(tokenResponse.access_token, baseUrl, account.account_id)
    const accountInfo = await docuSignService.getAccountInfo()

    // Store integration
    const manager = new IntegrationManager(supabase)
    await manager.connectIntegration(
      user.id,
      'docusign',
      {
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        expires_at: new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString(),
        account_id: account.account_id,
        base_url: baseUrl
      },
      {
        // Default settings
        default_email_subject: 'Please review and sign this document',
        auto_remind: true,
        reminder_delay: 3, // days
        expire_after: 30 // days
      },
      {
        account_name: accountInfo.accountName,
        account_id: account.account_id,
        base_uri: account.base_uri,
        organization: account.organization,
        plan_name: accountInfo.planName,
        user_name: userInfo.name,
        user_email: userInfo.email
      }
    )

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=docusign_connected`
    )
  } catch (error) {
    console.error('DocuSign OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=connection_failed`
    )
  }
}