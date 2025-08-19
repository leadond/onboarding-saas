import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.email !== 'leadond@gmail.com') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Force create/update global admin profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Derrick Leadon',
        company_name: 'Dev App Hero',
        role: 'global_admin',
        status: 'active',
        provider: user.app_metadata?.provider || 'google',
        avatar_url: user.user_metadata?.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile setup error:', profileError)
      return NextResponse.json({ success: false, error: 'Failed to setup profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Global admin profile setup complete'
    })
  } catch (error) {
    console.error('Setup admin error:', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}