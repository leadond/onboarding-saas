import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { kitAnalyticsQuerySchema } from '@/lib/validations/kit'

// GET /api/kits/[kitId]/analytics - Get kit analytics and metrics
export async function GET(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      kit_id: kitId,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      metrics: searchParams.get('metrics')?.split(',') || undefined,
    }

    const validatedParams = kitAnalyticsQuerySchema.parse(queryParams)

    // Verify kit ownership
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('id, name, analytics_enabled')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    if (!kit.analytics_enabled) {
      return NextResponse.json(
        {
          error: 'Analytics not enabled for this kit',
        },
        { status: 403 }
      )
    }

    // Set default date range if not provided (last 30 days)
    const endDate = validatedParams.end_date || new Date().toISOString()
    const startDate =
      validatedParams.start_date ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Use the built-in analytics function
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      'get_kit_metrics',
      {
        p_kit_id: kitId,
        p_start_date: startDate,
        p_end_date: endDate,
      }
    )

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError)
      // Return zero state instead of error for better UX
      return NextResponse.json({
        success: true,
        data: {
          kit_id: kitId,
          kit_name: kit.name,
          date_range: {
            start_date: startDate,
            end_date: endDate,
          },
          metrics: {
            overview: {
              total_views: 0,
              total_starts: 0,
              total_completions: 0,
              completion_rate: 0,
              avg_completion_time_seconds: 0,
              unique_clients: 0,
            },
            timeline: [],
            step_performance: [],
            client_segments: {
              total: 0,
              completed: 0,
              in_progress: 0,
              not_started: 0,
              completion_rate: 0,
              avg_completion_time: 0,
            },
            conversion_funnel: [],
          },
        },
        zero_state: true,
        message: 'No analytics data available yet. Data will appear once clients start using your kit.',
      })
    }

    // Safely extract analytics data with proper type handling
    const analyticsResults = analyticsData as any || {}
    
    // Get unique clients count from client progress data
    const { data: uniqueClientsData } = await supabase
      .from('client_progress')
      .select('client_identifier')
      .eq('kit_id', kitId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)

    const uniqueClientsCount = uniqueClientsData
      ? new Set(uniqueClientsData.map(c => c.client_identifier)).size
      : 0

    // Build comprehensive metrics object with safe property access
    const metrics: {
      overview: any
      timeline: any[]
      step_performance: any[]
      client_segments: any
      conversion_funnel: any[]
    } = {
      overview: {
        total_views: analyticsResults.total_views || 0,
        total_starts: analyticsResults.total_starts || 0,
        total_completions: analyticsResults.total_completions || 0,
        completion_rate: analyticsResults.completion_rate || 0,
        avg_completion_time_seconds: analyticsResults.avg_completion_time_seconds || 0,
        unique_clients: uniqueClientsCount,
      },
      timeline: [],
      step_performance: [],
      client_segments: {
        total: 0,
        completed: 0,
        in_progress: 0,
        not_started: 0,
        completion_rate: 0,
        avg_completion_time: 0,
      },
      conversion_funnel: [],
    }

    // Get timeline data (daily analytics)
    const { data: timelineData, error: timelineError } = await supabase
      .from('kit_analytics')
      .select('recorded_at, metric_name, metric_value')
      .eq('kit_id', kitId)
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: true })

    if (!timelineError && timelineData) {
      // Group by date and metric
      const timelineMap = new Map()
      timelineData.forEach((record: any) => {
        const date = record.recorded_at.split('T')[0] // Get date part
        if (!timelineMap.has(date)) {
          timelineMap.set(date, { date, views: 0, completions: 0, starts: 0 })
        }
        const dayData = timelineMap.get(date)
        if (record.metric_name === 'kit_view') dayData.views++
        if (record.metric_name === 'kit_completed') dayData.completions++
        if (record.metric_name === 'kit_started') dayData.starts++
      })
      metrics.timeline = Array.from(timelineMap.values())
    }

    // Get step performance data
    const { data: stepData, error: stepError } = await supabase
      .from('client_progress')
      .select(
        `
        step_id,
        status,
        time_spent,
        kit_steps!inner (
          title,
          step_type,
          step_order
        )
      `
      )
      .eq('kit_id', kitId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)

    if (!stepError && stepData) {
      const stepMap = new Map()
      stepData.forEach((record: any) => {
        const stepId = record.step_id
        if (!stepMap.has(stepId)) {
          stepMap.set(stepId, {
            step_id: stepId,
            title: record.kit_steps.title,
            step_type: record.kit_steps.step_type,
            step_order: record.kit_steps.step_order,
            total_views: 0,
            completions: 0,
            avg_time: 0,
            total_time: 0,
            conversion_rate: 0,
          })
        }
        const stepStats = stepMap.get(stepId)
        stepStats.total_views++
        stepStats.total_time += record.time_spent || 0
        if (record.status === 'completed') {
          stepStats.completions++
        }
      })

      // Calculate averages and conversion rates
      stepMap.forEach(stepStats => {
        stepStats.avg_time = stepStats.total_time / stepStats.total_views
        stepStats.conversion_rate =
          stepStats.completions / stepStats.total_views
        delete stepStats.total_time // Remove internal calculation field
      })

      metrics.step_performance = Array.from(stepMap.values()).sort(
        (a, b) => a.step_order - b.step_order
      )
    }

    // Get client segment data
    const { data: clientData, error: clientError } = await supabase
      .from('client_progress')
      .select('client_identifier, status, started_at, completed_at')
      .eq('kit_id', kitId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)

    if (!clientError && clientData) {
      const clientMap = new Map()
      clientData.forEach((record: any) => {
        const clientId = record.client_identifier
        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, {
            client_id: clientId,
            started_at: record.started_at,
            completed_at: record.completed_at,
            status: 'not_started',
            completion_time: null,
          })
        }
        const client = clientMap.get(clientId)
        if (record.status === 'completed' && record.completed_at) {
          client.status = 'completed'
          client.completed_at = record.completed_at
          client.completion_time =
            new Date(record.completed_at).getTime() -
            new Date(record.started_at).getTime()
        } else if (record.status === 'in_progress') {
          client.status = 'in_progress'
        }
      })

      const clients = Array.from(clientMap.values())
      const totalClients = clients.length
      const completedClients = clients.filter(
        c => c.status === 'completed'
      ).length
      const inProgressClients = clients.filter(
        c => c.status === 'in_progress'
      ).length
      const avgCompletionTime =
        clients
          .filter(c => c.completion_time)
          .reduce((sum, c) => sum + c.completion_time!, 0) / completedClients ||
        0

      metrics.client_segments = {
        total: totalClients,
        completed: completedClients,
        in_progress: inProgressClients,
        not_started: totalClients - completedClients - inProgressClients,
        completion_rate: completedClients / totalClients,
        avg_completion_time: avgCompletionTime,
      }
    }

    // Build conversion funnel
    if (metrics.step_performance.length > 0) {
      let previousViews = metrics.step_performance[0]?.total_views || 0
      metrics.conversion_funnel = metrics.step_performance.map(
        (step: any, index: number) => {
          const conversionRate =
            index === 0 ? 1 : step.total_views / previousViews
          previousViews = step.total_views
          return {
            step_order: step.step_order,
            step_title: step.title,
            step_type: step.step_type,
            views: step.total_views,
            conversion_rate: conversionRate,
            dropoff_rate: 1 - conversionRate,
          }
        }
      )
    }

    // Check if we have any meaningful data
    const hasData = metrics.overview.total_views > 0 ||
                   metrics.step_performance.length > 0 ||
                   metrics.timeline.length > 0

    return NextResponse.json({
      success: true,
      data: {
        kit_id: kitId,
        kit_name: kit.name,
        date_range: {
          start_date: startDate,
          end_date: endDate,
        },
        metrics,
      },
      zero_state: !hasData,
      message: !hasData ? 'No analytics data available yet. Data will appear once clients start using your kit.' : undefined,
    })
  } catch (error) {
    console.error('GET /api/kits/[kitId]/analytics error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid analytics query',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
