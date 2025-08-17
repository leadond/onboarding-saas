import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { IntegrationManager } from '@/lib/integrations/manager'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { provider_slug, action_type, parameters = {} } = body

    if (!provider_slug || !action_type) {
      return NextResponse.json(
        { success: false, error: 'Provider slug and action type are required' },
        { status: 400 }
      )
    }

    const manager = new IntegrationManager(supabase)
    const result = await manager.executeAction(
      user.id,
      provider_slug,
      action_type,
      parameters
    )

    return NextResponse.json({
      success: true,
      data: { result },
      message: 'Action executed successfully'
    })
  } catch (error) {
    console.error('Integration action error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Action execution failed' },
      { status: 500 }
    )
  }
}