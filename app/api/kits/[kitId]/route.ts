import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params
    const supabase = await getSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch kit details
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('*')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: kit
    })

  } catch (error) {
    console.error('Kit detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}