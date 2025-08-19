import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try to fetch kits from the database
    try {
      console.log('🔍 Fetching kits for user:', user.id)
      
      // First get basic kits data
      const { data: kits, error: kitsError } = await supabase
        .from('kits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      console.log('📦 Kits found:', kits?.length || 0)
      console.log('❌ Kits error:', kitsError)

      if (kitsError) {
        console.error('Database error:', kitsError)
        return NextResponse.json({
          success: true,
          data: []
        })
      }

      // Get user profile for creator name
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      // Enhanced kits with all features
      const enhancedKits = await Promise.all(
        (kits || []).map(async (kit) => {
          // Get accurate steps count from kit configuration
          let stepsCount = 0
          try {
            // First try kit_steps table
            const { count: kitStepsCount } = await supabase
              .from('kit_steps')
              .select('*', { count: 'exact', head: true })
              .eq('kit_id', kit.id)
            
            if (kitStepsCount !== null) {
              stepsCount = kitStepsCount
            } else {
              // Fallback: check if kit has steps in JSON format
              if (kit.steps && Array.isArray(kit.steps)) {
                stepsCount = kit.steps.length
              } else if (kit.configuration?.steps) {
                stepsCount = Array.isArray(kit.configuration.steps) ? kit.configuration.steps.length : 0
              }
            }
          } catch (error) {
            // Fallback: parse steps from kit data structure
            if (kit.steps && Array.isArray(kit.steps)) {
              stepsCount = kit.steps.length
            } else if (kit.configuration?.steps) {
              stepsCount = Array.isArray(kit.configuration.steps) ? kit.configuration.steps.length : 0
            }
            console.log(`Using fallback step count for kit ${kit.id}:`, stepsCount)
          }

          // Get clients count (handle table not existing)
          let clientsCount = 0
          try {
            const { count } = await supabase
              .from('kit_assignments')
              .select('*', { count: 'exact', head: true })
              .eq('kit_id', kit.id)
            clientsCount = count || 0
          } catch (error) {
            console.log('Kit assignments table not found, using 0')
          }

          return {
            ...kit,
            creator_name: userProfile?.full_name || user.email?.split('@')[0] || 'Admin',
            steps_count: stepsCount,
            clients_count: clientsCount
          }
        })
      )

      console.log('✨ Enhanced kits prepared:', enhancedKits.length)

      return NextResponse.json({
        success: true,
        data: enhancedKits
      })
    } catch (error) {
      console.log('Kits table not found, returning empty array')
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('Kits API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, description } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    try {
      const { data: kit, error: createError } = await supabase
        .from('kits')
        .insert({
          user_id: user.id,
          title,
          description: description || null,
          is_published: false,
        })
        .select()
        .single()

      if (createError) {
        console.error('Database error:', createError)
        return NextResponse.json(
          { error: 'Failed to create kit' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: kit
      })
    } catch (error) {
      console.error('Kit creation error:', error)
      return NextResponse.json(
        { error: 'Database not configured. Please set up your database first.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Kits POST API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}