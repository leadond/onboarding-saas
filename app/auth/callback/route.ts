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

      const needsSetup = !existingProfile?.full_name || !existingProfile?.company_name

      if (!existingProfile) {
        // Create new user profile for email confirmation users
        await supabase
          .from('user_profiles')
          .insert({
            id: crypto.randomUUID(),
            auth_user_id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || '',
            provider: 'email',
            role: data.user.email === 'leadond@gmail.com' ? 'global_admin' : 'user',
            status: 'active',
            last_sign_in: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      } else {
        // Update existing user profile
        await supabase
          .from('user_profiles')
          .update({
            last_sign_in: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id)
      }

      // Redirect based on profile completeness
      const redirectUrl = needsSetup || !existingProfile?.company_name
        ? '/dashboard/settings' 
        : '/dashboard'

      const response = NextResponse.redirect(`${origin}${redirectUrl}`)
      return response
    }
    
    console.error('Email confirmation callback error:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
}