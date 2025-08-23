import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { CreateCompanyKitRequest } from '@/types/onboarding-kits'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_name')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: kits, error } = await supabase
      .from('company_kits')
      .select(`
        *,
        company_kit_steps (*),
        kit_templates (*)
      `)
      .eq('company_name', profile.company_name)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ kits })
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

    const body: CreateCompanyKitRequest = await request.json()

    // Create the company kit
    const { data: kit, error: kitError } = await supabase
      .from('company_kits')
      .insert({
        company_name: profile.company_name,
        template_id: body.template_id,
        name: body.name,
        description: body.description,
        customizations: body.customizations || {},
        created_by: profile.id
      })
      .select()
      .single()

    if (kitError) {
      return NextResponse.json({ error: kitError.message }, { status: 500 })
    }

    // If creating from template, copy template steps
    if (body.template_id) {
      const { data: templateSteps } = await supabase
        .from('kit_template_steps')
        .select('*')
        .eq('template_id', body.template_id)
        .order('step_order')

      if (templateSteps && templateSteps.length > 0) {
        const stepsToInsert = templateSteps.map(step => ({
          kit_id: kit.id,
          template_step_id: step.id,
          name: step.name,
          description: step.description,
          step_order: step.step_order,
          step_type: step.step_type,
          responsibility: step.responsibility,
          is_required: step.is_required,
          estimated_duration_hours: step.estimated_duration_hours,
          config: step.config
        }))

        await supabase.from('company_kit_steps').insert(stepsToInsert)
      }
    }

    // If custom steps provided, create them
    if (body.steps && body.steps.length > 0) {
      const stepsToInsert = body.steps.map(step => ({
        ...step,
        kit_id: kit.id
      }))

      await supabase.from('company_kit_steps').insert(stepsToInsert)
    }

    return NextResponse.json({ kit }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}