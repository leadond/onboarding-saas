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

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if user needs profile setup
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const isNewUser = !existingProfile
      const needsSetup = !existingProfile?.full_name || !existingProfile?.company_name

      // Only allow OAuth if user already exists in system
      if (!existingProfile && data.user.app_metadata?.provider === 'google') {
        // Google OAuth user without existing profile - reject
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=account_not_found`)
      }

      // Check if user profile exists by email (for linking existing accounts)
      const { data: profileByEmail } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', data.user.email)
        .single()

      if (profileByEmail && !profileByEmail.auth_user_id) {
        // Link Google auth to existing profile
        await supabase
          .from('user_profiles')
          .update({
            auth_user_id: data.user.id,
            google_id: data.user.user_metadata?.sub || data.user.id,
            provider: 'google',
            avatar_url: data.user.user_metadata?.avatar_url || profileByEmail.avatar_url,
            last_sign_in: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', profileByEmail.id)
      } else {
        // Create or update user profile with default role
        await supabase
          .from('user_profiles')
          .upsert({
            id: existingProfile?.id || crypto.randomUUID(),
            auth_user_id: data.user.id,
            email: data.user.email,
            full_name: existingProfile?.full_name || data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            avatar_url: data.user.user_metadata?.avatar_url,
            provider: data.user.app_metadata?.provider,
            company_name: existingProfile?.company_name,
            role: existingProfile?.role || (data.user.email === 'leadond@gmail.com' ? 'global_admin' : 'user'),
            status: existingProfile?.status || 'active',
            last_sign_in: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'auth_user_id'
          })
      }

      // Redirect new Google users to settings for profile completion
      const redirectUrl = (isNewUser || needsSetup) && data.user.app_metadata?.provider === 'google' 
        ? '/dashboard/settings' 
        : '/dashboard'

      const response = NextResponse.redirect(`${origin}${redirectUrl}`)
      return response
    }
    
    console.error('OAuth callback error:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
}