import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// import { generateIndustryKit, AVAILABLE_INDUSTRIES } from '@/lib/ai/kit-generator'
const AVAILABLE_INDUSTRIES = ['healthcare', 'finance', 'retail']
const generateIndustryKit = async (industry: string, companyType: string) => ({ name: 'Generated Kit', description: 'AI generated', industry, category: 'general', steps: [] })

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is global admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || profile.role !== 'global_admin') {
      return NextResponse.json({ error: 'Only global admins can generate kit templates' }, { status: 403 })
    }

    const { industry, companyType, autoSave } = await request.json()

    if (!industry || !AVAILABLE_INDUSTRIES.includes(industry)) {
      return NextResponse.json({ 
        error: 'Invalid industry. Available industries: ' + AVAILABLE_INDUSTRIES.join(', ') 
      }, { status: 400 })
    }

    // Generate the kit using AI
    const generatedKit = await generateIndustryKit(industry, companyType)

    // If autoSave is true, save to database
    if (autoSave) {
      const { data: template, error: templateError } = await supabase
        .from('kit_templates')
        .insert({
          name: generatedKit.name,
          description: generatedKit.description,
          industry: generatedKit.industry,
          category: generatedKit.category,
          is_premium: false,
          price: 0,
          created_by: profile.id,
          metadata: { generated_by_ai: true, company_type: companyType }
        })
        .select()
        .single()

      if (templateError) {
        return NextResponse.json({ error: templateError.message }, { status: 500 })
      }

      // Save the steps
      if (generatedKit.steps && generatedKit.steps.length > 0) {
        const stepsToInsert = generatedKit.steps.map(step => ({
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

      return NextResponse.json({ 
        kit: generatedKit, 
        template_id: template.id,
        saved: true 
      })
    }

    return NextResponse.json({ kit: generatedKit, saved: false })
  } catch (error) {
    console.error('Error generating kit:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate kit' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    available_industries: AVAILABLE_INDUSTRIES,
    description: 'Use POST to generate a kit for a specific industry'
  })
}