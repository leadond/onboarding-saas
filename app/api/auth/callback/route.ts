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
import { enterpriseSecurity } from '@/lib/auth/enterprise-security'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        // Get client info for security logging
        const ip = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        // Check for anomalous activity
        const isAnomalous = await enterpriseSecurity.detectAnomalousActivity(
          data.user.id,
          ip,
          userAgent
        )

        // Log OAuth login
        await enterpriseSecurity.logSecurityEvent('OAUTH_LOGIN', {
          userId: data.user.id,
          email: data.user.email,
          provider: data.user.app_metadata?.provider,
          ip,
          userAgent,
          anomalous: isAnomalous
        })

        // Create or update user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            provider: data.user.app_metadata?.provider,
            last_sign_in: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile upsert error:', profileError)
        }

        // Set activity tracking cookie
        const response = NextResponse.redirect(`${origin}${next}`)
        response.cookies.set('last_activity', Date.now().toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 // 1 day
        })

        return response
      }
    } catch (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${origin}/login?error=oauth_error`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}