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
            overview: {
              totalKits: 0,
              totalClients: 0,
              activeOnboardings: 0,
              completedThisMonth: 0,
              averageCompletionTime: 0,
              completionRate: 0
            },
            recentActivity: []
          }
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Fetch total kits
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
            overview: {
              totalKits: 0,
              totalClients: 0,
              activeOnboardings: 0,
              completedThisMonth: 0,
              averageCompletionTime: 0,
              completionRate: 0
            },
            recentActivity: []
          }
        },
        { status: 500 }
      )
    }

    // Fetch total clients (if table exists)
    let totalClients = 0
    const { count: clientsCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
    totalClients = clientsCount || 0

    // For now, return basic analytics based on available data
    // In a real implementation, you'd calculate these from actual assignment and progress data
    const overview = {
      totalKits: totalKits || 0,
      totalClients,
      activeOnboardings: 0, // Would need client_kit_assignments table
      completedThisMonth: 0, // Would need completion data
      averageCompletionTime: 0, // Would need timing data
      completionRate: 0 // Would need completion data
    }

    // Recent activity would come from activity_logs table
    const recentActivity: any[] = []

    return NextResponse.json({
      success: true,
      data: {
        overview,
        recentActivity
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch analytics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {
          overview: {
            totalKits: 0,
            totalClients: 0,
            activeOnboardings: 0,
            completedThisMonth: 0,
            averageCompletionTime: 0,
            completionRate: 0
          },
          recentActivity: []
        }
      },
      { status: 500 }
    )
  }
}