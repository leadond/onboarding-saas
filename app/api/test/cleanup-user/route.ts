/*
 * Test endpoint to cleanup test users
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
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get auth user first
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      return NextResponse.json(
        { error: 'Failed to fetch auth users' },
        { status: 500 }
      )
    }

    const authUser = authUsers.users.find((u: any) => u.email === email)
    
    if (authUser) {
      // Delete user profile first
      await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('email', email)

      // Delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} cleaned up successfully`
    })

  } catch (error) {
    console.error('Cleanup user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}