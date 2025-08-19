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
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    console.log('Supabase client created for admin operation')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin's profile to determine company
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('role, company_name')
      .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
      .single()

    if (!adminProfile) {
      return NextResponse.json({ success: false, error: 'Admin profile not found' }, { status: 403 })
    }

    const requestBody = await request.json()
    const { email, full_name, role = 'user' } = requestBody
    
    // Auto-assign company based on admin role
    let company_name
    if (adminProfile.role === 'global_admin') {
      // Global admin can specify company
      company_name = requestBody.company_name
      if (!company_name) {
        return NextResponse.json({ success: false, error: 'Company name required for global admin' }, { status: 400 })
      }
    } else {
      // Regular admins use their own company
      company_name = adminProfile.company_name
    }
    
    console.log('Admin role:', adminProfile.role, 'Using company:', company_name)
    console.log('Request body received:', JSON.stringify(requestBody, null, 2))
    console.log('Creating user with role:', role)

    if (!email || !full_name) {
      return NextResponse.json({ success: false, error: 'Email and full name required' }, { status: 400 })
    }

    const tempPassword = 'TempPass123!'
    
    // Create auth user first to get valid ID
    console.log('Creating auth user for:', email)
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        force_password_change: true
      }
    })

    if (createError) {
      console.error('Auth user creation failed:', createError)
      return NextResponse.json({ success: false, error: `Auth creation failed: ${createError.message}` }, { status: 400 })
    }

    console.log('Auth user created:', authData.user.id)
    
    // Create user profile with auth user ID
    const profileData = {
      id: authData.user.id,
      auth_user_id: authData.user.id,
      email,
      full_name,
      company_name,
      role,
      status: 'active',
      provider: 'email',
      force_password_change: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('=== CREATING USER PROFILE ===')
    console.log('Profile data being inserted:', JSON.stringify(profileData, null, 2))
    
    // Use admin client to bypass RLS for user creation
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single()
      
    console.log('Profile created with role:', profile?.role)

    if (profileError) {
      console.error('Profile creation failed:', profileError)
      return NextResponse.json({ success: false, error: `Profile creation failed: ${profileError.message}` }, { status: 400 })
    }

    console.log('=== USER PROFILE CREATED ===')
    console.log('Saved profile:', JSON.stringify(profile, null, 2))
    console.log('Role in saved profile:', profile.role)

    // Auth user already created above

    if (profileError) {
      return NextResponse.json({ success: false, error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { 
        user: profile, 
        tempPassword,
        message: `User created. Login with email: ${email} and password: ${tempPassword}. Must change password on first login.` 
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}