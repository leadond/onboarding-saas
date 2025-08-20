import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { credential, userInfo } = await request.json()
    
    if (!credential || !userInfo) {
      return NextResponse.json({ error: 'Missing credential or user info' }, { status: 400 })
    }

    const supabase = await getSupabaseClient()
    
    // Create or update user profile
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', userInfo.email)
      .single()

    if (!existingProfile) {
      // Create new user profile
      await supabase
        .from('user_profiles')
        .insert({
          id: crypto.randomUUID(),
          email: userInfo.email,
          full_name: userInfo.name,
          avatar_url: userInfo.picture,
          provider: 'google',
          google_id: userInfo.sub,
          role: userInfo.email === 'leadond@gmail.com' ? 'global_admin' : 'user',
          status: 'active',
          last_sign_in: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    } else {
      // Update existing profile
      await supabase
        .from('user_profiles')
        .update({
          google_id: userInfo.sub,
          avatar_url: userInfo.picture,
          last_sign_in: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
    }

    return NextResponse.json({ 
      success: true, 
      user: userInfo,
      redirectTo: '/dashboard'
    })

  } catch (error) {
    console.error('Google native auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    )
  }
}