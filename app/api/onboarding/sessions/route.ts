import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { StartOnboardingSessionRequest } from '@/types/onboarding-kits'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_name, role')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assigned_to_me = searchParams.get('assigned_to_me') === 'true'

    let query = supabase
      .from('onboarding_sessions')
      .select(`
        *,
        company_kits (
          name,
          description,
          kit_templates (name, industry)
        ),
        user_profiles!assigned_user_id (
          full_name,
          email
        ),
        step_instances (
          id,
          status,
          company_kit_steps (
            name,
            step_type,
            responsibility
          )
        )
      `)
      .order('created_at', { ascending: false })

    // Filter by company
    query = query.in('company_kits.company_name', [profile.company_name])

    if (status) {
      query = query.eq('status', status)
    }

    if (assigned_to_me) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      
      if (userProfile) {
        query = query.eq('assigned_user_id', userProfile.id)
      }
    }

    const { data: sessions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sessions })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, company_name')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body: StartOnboardingSessionRequest = await request.json()

    // Verify the kit belongs to the user's company
    const { data: kit } = await supabase
      .from('company_kits')
      .select('*')
      .eq('id', body.kit_id)
      .eq('company_name', profile.company_name)
      .single()

    if (!kit) {
      return NextResponse.json({ error: 'Kit not found or access denied' }, { status: 404 })
    }

    // Create the onboarding session
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .insert({
        kit_id: body.kit_id,
        client_name: body.client_name,
        client_email: body.client_email,
        client_phone: body.client_phone,
        assigned_user_id: body.assigned_user_id || profile.id,
        due_date: body.due_date,
        metadata: body.metadata || {}
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 })
    }

    // Create step instances from kit steps
    const { data: kitSteps } = await supabase
      .from('company_kit_steps')
      .select('*')
      .eq('kit_id', body.kit_id)
      .eq('is_active', true)
      .order('step_order')

    if (kitSteps && kitSteps.length > 0) {
      const stepInstances = kitSteps.map(step => ({
        session_id: session.id,
        step_id: step.id,
        assigned_to: step.responsibility,
        due_date: step.estimated_duration_hours ? 
          new Date(Date.now() + step.estimated_duration_hours * 60 * 60 * 1000).toISOString() : 
          null
      }))

      const { error: stepsError } = await supabase
        .from('step_instances')
        .insert(stepInstances)

      if (stepsError) {
        console.error('Error creating step instances:', stepsError)
        // Don't fail the session creation, but log the error
      }
    }

    // Send welcome notification (implement later)
    // await sendWelcomeNotification(session)

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}