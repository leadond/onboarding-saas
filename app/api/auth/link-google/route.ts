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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    // Find existing user profile by email
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError || !existingProfile) {
      return NextResponse.json({ success: false, error: 'No existing account found with this email' }, { status: 404 })
    }

    // Link Google auth to existing profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        auth_user_id: user.id,
        google_id: user.user_metadata?.sub || user.id,
        provider: 'google',
        avatar_url: user.user_metadata?.avatar_url || existingProfile.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProfile.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Failed to link Google account' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Google account linked successfully'
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}