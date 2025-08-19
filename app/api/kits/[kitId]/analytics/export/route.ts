/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { format } from 'date-fns'

import { createClient } from '@/lib/supabase/server'

// GET /api/kits/[kitId]/analytics/export - Export kit analytics data as CSV
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

    // Parse query parameters for date range
    const searchParams = request.nextUrl.searchParams
    const endDate = searchParams.get('end_date') || new Date().toISOString()
    const startDate = searchParams.get('start_date') || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

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
        { error: 'Analytics not enabled for this kit' },
        { status: 403 }
      )
    }

    // Get analytics data using the built-in function
    const { data: analyticsData, error: analyticsError } = await supabase.rpc(
      'get_kit_metrics',
      {
        p_kit_id: kitId,
        p_start_date: startDate,
        p_end_date: endDate,
      }
    )

    if (analyticsError) {
      console.error('Error fetching analytics for export:', analyticsError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      )
    }

    // Get detailed step performance data
    const { data: stepData, error: stepError } = await supabase
      .from('client_progress')
      .select(
        `
        step_id,
        status,
        time_spent,
        started_at,
        completed_at,
        client_identifier,
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
      .order('started_at', { ascending: true })

    // Get timeline data
    const { data: timelineData, error: timelineError } = await supabase
      .from('kit_analytics')
      .select('recorded_at, metric_name, metric_value, client_identifier')
      .eq('kit_id', kitId)
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: true })

    // Create CSV content
    const csvRows: string[] = []
    
    // Add overview section
    csvRows.push('# Kit Analytics Overview')
    csvRows.push(`Kit Name,${kit.name}`)
    csvRows.push(`Kit ID,${kitId}`)
    csvRows.push(`Export Date,${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`)
    csvRows.push(`Date Range,"${format(new Date(startDate), 'yyyy-MM-dd')} to ${format(new Date(endDate), 'yyyy-MM-dd')}"`)
    csvRows.push('')

    if (analyticsData) {
      csvRows.push('# Overall Metrics')
      csvRows.push('Metric,Value')
      csvRows.push(`Total Views,${analyticsData.total_views || 0}`)
      csvRows.push(`Total Starts,${analyticsData.total_starts || 0}`)
      csvRows.push(`Total Completions,${analyticsData.total_completions || 0}`)
      csvRows.push(`Completion Rate,${analyticsData.completion_rate ? (analyticsData.completion_rate).toFixed(2) + '%' : '0%'}`)
      csvRows.push(`Average Completion Time (seconds),${analyticsData.avg_completion_time_seconds || 0}`)
      csvRows.push('')

      // Add step metrics
      if (analyticsData.step_metrics && analyticsData.step_metrics.length > 0) {
        csvRows.push('# Step Performance')
        csvRows.push('Step Order,Step Title,Views,Completions,Completion Rate')
        analyticsData.step_metrics.forEach((step: any) => {
          csvRows.push(
            `${step.step_order || 0},"${step.step_title || 'Unknown'}",${step.views || 0},${step.completions || 0},${step.completion_rate ? (step.completion_rate).toFixed(2) + '%' : '0%'}`
          )
        })
        csvRows.push('')
      }
    }

    // Add detailed client progress if available
    if (stepData && stepData.length > 0) {
      csvRows.push('# Detailed Client Progress')
      csvRows.push('Client ID,Step Order,Step Title,Step Type,Status,Time Spent (seconds),Started At,Completed At')
      stepData.forEach((record: any) => {
        const startedAt = record.started_at ? format(new Date(record.started_at), 'yyyy-MM-dd HH:mm:ss') : ''
        const completedAt = record.completed_at ? format(new Date(record.completed_at), 'yyyy-MM-dd HH:mm:ss') : ''
        csvRows.push(
          `"${record.client_identifier || 'Anonymous'}",${record.kit_steps?.step_order || 0},"${record.kit_steps?.title || 'Unknown'}","${record.kit_steps?.step_type || 'unknown'}","${record.status || 'unknown'}",${record.time_spent || 0},"${startedAt}","${completedAt}"`
        )
      })
      csvRows.push('')
    }

    // Add timeline events if available
    if (timelineData && timelineData.length > 0) {
      csvRows.push('# Timeline Events')
      csvRows.push('Date,Event Type,Client ID,Event Data')
      timelineData.forEach((record: any) => {
        const eventDate = format(new Date(record.recorded_at), 'yyyy-MM-dd HH:mm:ss')
        const eventData = record.metric_value ? JSON.stringify(record.metric_value).replace(/"/g, '""') : ''
        csvRows.push(
          `"${eventDate}","${record.metric_name || 'unknown'}","${record.client_identifier || 'Anonymous'}","${eventData}"`
        )
      })
    }

    // Handle case where no data is available
    if (!analyticsData && (!stepData || stepData.length === 0) && (!timelineData || timelineData.length === 0)) {
      csvRows.push('# No Analytics Data Available')
      csvRows.push('No analytics data found for the specified date range.')
      csvRows.push('This could mean:')
      csvRows.push('- No clients have interacted with this kit yet')
      csvRows.push('- The selected date range contains no activity')
      csvRows.push('- Analytics tracking may not be properly configured')
    }

    const csvContent = csvRows.join('\n')
    const fileName = `${kit.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analytics_${format(new Date(), 'yyyy_MM_dd')}.csv`

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

  } catch (error) {
    console.error('GET /api/kits/[kitId]/analytics/export error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
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