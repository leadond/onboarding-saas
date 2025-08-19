import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, company_name, role } = body

    // Simple permission check - global admin can do anything
    const isGlobalAdmin = user.email === 'leadond@gmail.com'
    const isOwnProfile = userId === user.id

    if (!isGlobalAdmin && !isOwnProfile) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    console.log('Updating profile for user:', userId, 'with data:', { full_name, company_name, role })
    console.log('User auth data:', { email: user.email, provider: user.app_metadata?.provider })
    
    // Get existing profile first to preserve data
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    console.log('Existing profile:', existingProfile)
    
    // Update profile with better error handling
    try {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          email: user.email,
          full_name: full_name || existingProfile?.full_name,
          company_name: company_name || existingProfile?.company_name, // Only update if provided
          role: isGlobalAdmin ? 'global_admin' : (role || existingProfile?.role || 'user'),
          status: 'active',
          provider: user.email === 'leadond@gmail.com' ? 'google' : (user.app_metadata?.provider || existingProfile?.provider || 'email'),
          avatar_url: existingProfile?.avatar_url,
          created_at: existingProfile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select()
        .single()
      
      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json({ success: false, error: `Database error: ${updateError.message}` }, { status: 500 })
      }
      
      console.log('Profile updated successfully:', updatedProfile)
      
      return NextResponse.json({
        success: true,
        data: updatedProfile
      })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ success: false, error: 'Database table may not exist' }, { status: 500 })
    }
  } catch (error) {
    console.error('Profile update API error:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}