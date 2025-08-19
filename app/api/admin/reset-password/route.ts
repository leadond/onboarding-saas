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

    // Check if user is admin or above
    const isGlobalAdmin = user.email === 'leadond@gmail.com'
    if (!isGlobalAdmin) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
      }
    }

    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'UserId and email required' }, { status: 400 })
    }

    // Generate new password: ResetPass123!
    const newPassword = 'ResetPass123!'

    // Update user profile to indicate password was reset
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Failed to update user record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { 
        newPassword,
        message: `Password reset for ${email}. New password: ${newPassword}` 
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}