import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { CreateKitTemplateRequest, KitTemplate } from '@/types/onboarding-kits'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const category = searchParams.get('category')

    let query = supabase
      .from('kit_templates')
      .select(`
        *,
        kit_template_steps (*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (industry) {
      query = query.eq('industry', industry)
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data: templates, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ templates })
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

    // Check if user is global admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || profile.role !== 'global_admin') {
      return NextResponse.json({ error: 'Only global admins can create kit templates' }, { status: 403 })
    }

    const body: CreateKitTemplateRequest = await request.json()

    // Create the template
    const { data: template, error: templateError } = await supabase
      .from('kit_templates')
      .insert({
        name: body.name,
        description: body.description,
        industry: body.industry,
        category: body.category,
        is_premium: body.is_premium || false,
        price: body.price || 0,
        created_by: user.id
      })
      .select()
      .single()

    if (templateError) {
      return NextResponse.json({ error: templateError.message }, { status: 500 })
    }

    // Create the steps
    if (body.steps && body.steps.length > 0) {
      const stepsToInsert = body.steps.map(step => ({
        ...step,
        template_id: template.id
      }))

      const { error: stepsError } = await supabase
        .from('kit_template_steps')
        .insert(stepsToInsert)

      if (stepsError) {
        // Rollback template creation
        await supabase.from('kit_templates').delete().eq('id', template.id)
        return NextResponse.json({ error: stepsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}