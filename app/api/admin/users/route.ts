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
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  console.log('=== ADMIN USERS API CALLED ===')
  console.log('Timestamp:', new Date().toISOString())
  
  try {
    const supabase = await createClient()
    console.log('Supabase client created')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth user:', user?.email, 'Auth error:', authError)
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user profile and role
    let currentUserProfile = null
    
    // First try to find profile by auth_user_id
    const { data: profileByAuthId } = await supabase
      .from('user_profiles')
      .select('role, company_name')
      .eq('auth_user_id', user.id)
      .single()
    
    // Then try by email
    const { data: profileByEmail } = await supabase
      .from('user_profiles')
      .select('role, company_name')
      .eq('email', user.email)
      .single()
    
    // Use database profile (since roles are now correct in database)
    currentUserProfile = profileByAuthId || profileByEmail
    
    // Only fallback for global admin if no profile exists
    if (!currentUserProfile && user.email === 'leadond@gmail.com') {
      console.log('Setting global admin access for:', user.email)
      currentUserProfile = { role: 'global_admin', company_name: null }
    }
    
    // Final fallback
    if (!currentUserProfile) {
      console.log('Profile not found for user:', user.email)
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }
    
    console.log('Found profile:', currentUserProfile)

    console.log('Current user profile:', currentUserProfile)
    
    // Check permissions
    const hasAdminAccess = ['global_admin', 'admin', 'super_admin'].includes(currentUserProfile.role)
    console.log('Has admin access:', hasAdminAccess, 'Role:', currentUserProfile.role)
    
    if (!hasAdminAccess) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get users based on role
    let companyUsers = []
    if (currentUserProfile.role === 'global_admin') {
      // Global admin sees all users across all tenants
      const { data: allUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!usersError) {
        companyUsers = allUsers || []
      }
    } else {
      // Company admin/super_admin sees only their company users (excluding global admins)
      console.log('Querying users for company:', currentUserProfile.company_name)
      
      // Debug: Check all users first
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('email, company_name, role')
        .order('created_at', { ascending: false })
      console.log('ALL USERS IN DATABASE:', allUsers)
      
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('company_name', currentUserProfile.company_name)
        .neq('role', 'global_admin')
        .order('created_at', { ascending: false })
      
      console.log('Company users query result:', users?.length || 0, 'users found')
      console.log('Users found:', users?.map(u => ({ email: u.email, role: u.role })))
      
      if (!usersError) {
        companyUsers = users || []
      } else {
        console.error('Users query error:', usersError)
      }
    }



    console.log('=== RETURNING USERS ===')
    console.log('Total users being returned:', companyUsers?.length || 0)
    
    return NextResponse.json({
      success: true,
      data: { users: companyUsers || [] }
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}