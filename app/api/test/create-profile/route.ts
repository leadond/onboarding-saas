/*
 * Test endpoint to create user profile manually
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
      return NextResponse.json(
        { error: 'Failed to fetch auth users' },
        { status: 500 }
      )
    }

    const authUser = authUsers.users.find((u: any) => u.email === email)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Auth user not found' },
        { status: 404 }
      )
    }

    // Create user profile
    const profileData = {
      id: authUser.id,
      auth_user_id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || 'Test User',
      company_name: authUser.user_metadata?.company_name || 'Test Company',
      role: 'user',
      status: 'active',
      provider: 'email',
      force_password_change: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData)
      .select()

    if (error) {
      console.error('Error creating user profile:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User profile created for ${email}`,
      data
    })

  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}