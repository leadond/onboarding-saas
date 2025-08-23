import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Check if user is admin or global_admin
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['admin', 'global_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Fetch all users
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, company_name, role, status, force_password_change')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }

  return NextResponse.json({ users })
}

export async function PATCH(request: NextRequest) {
  const supabase = await getSupabaseClient()
  const body = await request.json()
  const { userId, role, status, forcePasswordChange } = body

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Check if user is admin or global_admin
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || !['admin', 'global_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Update user profile
  const updates: any = {}
  if (role) updates.role = role
  if (status) updates.status = status
  if (typeof forcePasswordChange === 'boolean') updates.force_password_change = forcePasswordChange
  updates.updated_at = new Date().toISOString()

  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'User updated successfully' })
}