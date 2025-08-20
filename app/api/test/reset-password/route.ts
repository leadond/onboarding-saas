/*
 * Test endpoint to reset user password
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
    const { email, password = 'TempPass123!' } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get auth user first
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json(
        { error: 'Failed to fetch auth users' },
        { status: 500 }
      )
    }

    const authUser = authUsers.users.find(u => u.email === email)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Auth user not found' },
        { status: 404 }
      )
    }

    // Update user password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
      password: password,
      email_confirm: true
    })

    if (error) {
      console.error('Error updating password:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Password reset for ${email}`,
      data: { id: data.user.id, email: data.user.email }
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}