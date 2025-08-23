/*
 * Test endpoint to set force_password_change flag
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  // Only allow in development/test environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, force_password_change = true } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Update user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        force_password_change,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('Error updating user flag:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Password change flag set to ${force_password_change} for ${email}`,
      data
    })

  } catch (error) {
    console.error('Set password flag error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}