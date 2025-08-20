import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const kitId = params.kitId
    const supabase = await createClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Verify kit template exists
    const { data: kitTemplate, error: kitError } = await supabase
      .from('kit_templates')
      .select('id, name')
      .eq('id', kitId)
      .single()

    if (kitError || !kitTemplate) {
      return NextResponse.json({ error: 'Kit template not found' }, { status: 404 })
    }

    // Create assignment record
    const assignmentData = {
      template_id: kitId,
      company_name: companyId,
      name: `Kit for Company`,
      description: `Onboarding kit assignment`,
      created_by: user.id
    }
    
    const { data: companyKit, error: assignError } = await supabase
      .from('company_kits')
      .insert(assignmentData)
      .select()
      .single()

    if (assignError) {
      return NextResponse.json({ 
        error: 'Failed to assign kit', 
        details: assignError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: companyKit,
      message: 'Kit assigned successfully'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}