import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database configuration missing. Please configure Supabase environment variables.',
          data: {
            stats: {
              totalKits: 0,
              activeClients: 0,
              completionRate: 0,
              thisMonthCompletions: 0
            },
            recentActivity: []
          }
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch kits count
    const { count: totalKits, error: kitsError } = await supabase
      .from('kits')
      .select('*', { count: 'exact', head: true })
    
    if (kitsError) {
      console.error('Supabase kits error:', kitsError)
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${kitsError.message}`,
          data: {
            stats: { totalKits: 0, activeClients: 0, completionRate: 0, thisMonthCompletions: 0 },
            recentActivity: []
          }
        },
        { status: 500 }
      )
    }

    // Fetch clients count from client_progress table
    const { count: activeClients, error: clientsError } = await supabase
      .from('client_progress')
      .select('client_identifier', { count: 'exact', head: true })
      .not('status', 'eq', 'completed')
    
    // Fetch recent activity (if you have an activity log table)
    // For now, we'll return empty array since this would be a more complex implementation
    const recentActivity: any[] = []

    // Calculate completion rate (would need actual completion data)
    const completionRate = 0 // Placeholder
    
    // This month completions (would need date filtering)
    const thisMonthCompletions = 0 // Placeholder
    
    const stats = {
      totalKits: totalKits || 0,
      activeClients: activeClients || 0,
      completionRate,
      thisMonthCompletions
    }
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivity
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {
          stats: { totalKits: 0, activeClients: 0, completionRate: 0, thisMonthCompletions: 0 },
          recentActivity: []
        }
      },
      { status: 500 }
    )
  }
}