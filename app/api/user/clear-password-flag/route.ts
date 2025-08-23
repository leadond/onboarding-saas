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

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const adminSupabase = createAdminClient()

    // Get the current user
    const { data: { user }, error: userError } = await adminSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Clear the force_password_change flag
    const { error: updateError } = await adminSupabase
      .from('user_profiles')
      .update({ 
        force_password_change: false,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', user.id)

    if (updateError) {
      console.error('Error clearing password change flag:', updateError)
      return NextResponse.json(
        { error: 'Failed to clear password change flag' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear password flag API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}