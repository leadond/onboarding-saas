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

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile (handle table not existing)
    let profile = null
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.log('Profile table may not exist, using auth data only')
      } else {
        profile = profileData
      }
    } catch (error) {
      console.log('User profiles table not found, using auth data only')
    }

    // Check if profile needs setup (Google OAuth users without complete profile)
    const needsSetup = !profile?.full_name || !profile?.company_name

    // Determine role - global admin for specific email, otherwise user by default
    const defaultRole = user.email === 'leadond@gmail.com' ? 'global_admin' : 'user'
    const actualRole = profile?.role || defaultRole
    
    // Force global admin role for leadond@gmail.com
    const finalRole = user.email === 'leadond@gmail.com' ? 'global_admin' : actualRole

    console.log('User app_metadata:', user.app_metadata)
    console.log('User provider from auth:', user.app_metadata?.provider)
    
    const userProfile = {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name,
      company_name: profile?.company_name,
      role: finalRole,
      status: profile?.status || 'active',
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
      provider: user.email === 'leadond@gmail.com' ? 'google' : (user.app_metadata?.provider || profile?.provider || 'email'),
      needs_setup: needsSetup
    }

    return NextResponse.json({
      success: true,
      data: { user: userProfile }
    })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}