'use client'

import useSWR from 'swr'
import { useMemo, useState } from 'react'
import type { KitAnalyticsQuery } from '@/lib/validations/kit'

type AnalyticsOverview = {
  total_views: number
  total_completions: number
  completion_rate: number
  avg_completion_time: number
  active_clients: number
}

type TimelineData = {
  date: string
  views: number
  completions: number
  starts: number
}

type StepPerformance = {
  step_id: string
  title: string
  step_type: string
  step_order: number
  total_views: number
  completions: number
  avg_time: number
  conversion_rate: number
}

type ClientSegments = {
  total: number
  completed: number
  in_progress: number
  not_started: number
  completion_rate: number
  avg_completion_time: number
}

type ConversionFunnelStep = {
  step_order: number
  step_title: string
  step_type: string
  views: number
  conversion_rate: number
  dropoff_rate: number
}

type KitAnalyticsData = {
  kit_id: string
  kit_name: string
  date_range: {
    start_date: string
    end_date: string
  }
  metrics: {
    overview: AnalyticsOverview
    timeline: TimelineData[]
    step_performance: StepPerformance[]
    client_segments: ClientSegments
    conversion_funnel: ConversionFunnelStep[]
  }
}

type AnalyticsResponse = {
  success: boolean
  data: KitAnalyticsData
}

// Helper function to build query string
const buildAnalyticsQuery = (params: Partial<KitAnalyticsQuery>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'kit_id') {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(','))
      } else {
        searchParams.set(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Main hook for kit analytics
export function useKitAnalytics(
  kitId: string | null,
  options: Omit<Partial<KitAnalyticsQuery>, 'kit_id'> = {}
) {
  const queryString = buildAnalyticsQuery(options)
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<AnalyticsResponse>(
    kitId
      ? `/api/kits/${kitId}/analytics${queryString ? `?${queryString}` : ''}`
      : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  return {
    analytics: data?.data || null,
    isLoading,
    error,
    refetch,
  }
}

// Hook for analytics overview with computed metrics
export function useAnalyticsOverview(
  kitId: string | null,
  dateRange?: { start_date: string; end_date: string }
) {
  const { analytics, isLoading, error } = useKitAnalytics(kitId, dateRange)

  const overview = useMemo(() => {
    if (!analytics) return null

    const { overview: rawOverview, client_segments } = analytics.metrics

    return {
      ...rawOverview,
      // Add computed metrics
      bounce_rate:
        rawOverview.total_views > 0
          ? ((rawOverview.total_views - rawOverview.total_completions) /
              rawOverview.total_views) *
            100
          : 0,
      avg_completion_time_formatted: formatDuration(
        rawOverview.avg_completion_time
      ),
      completion_rate_formatted: `${(rawOverview.completion_rate * 100).toFixed(1)}%`,
      client_segments,
    }
  }, [analytics])

  return {
    overview,
    isLoading,
    error,
  }
}

// Hook for timeline analytics with trend analysis
export function useAnalyticsTimeline(
  kitId: string | null,
  dateRange?: { start_date: string; end_date: string }
) {
  const { analytics, isLoading, error } = useKitAnalytics(kitId, dateRange)

  const timelineWithTrends = useMemo(() => {
    if (!analytics?.metrics.timeline) return []

    const timeline = analytics.metrics.timeline

    return timeline.map((day, index) => {
      const previousDay = index > 0 ? timeline[index - 1] : null

      return {
        ...day,
        // Calculate trends
        views_trend: previousDay
          ? ((day.views - previousDay.views) / (previousDay.views || 1)) * 100
          : 0,
        completions_trend: previousDay
          ? ((day.completions - previousDay.completions) /
              (previousDay.completions || 1)) *
            100
          : 0,
        conversion_rate:
          day.views > 0 ? (day.completions / day.views) * 100 : 0,
      }
    })
  }, [analytics])

  return {
    timeline: timelineWithTrends,
    isLoading,
    error,
  }
}

// Hook for step performance with insights
export function useStepPerformance(
  kitId: string | null,
  dateRange?: { start_date: string; end_date: string }
) {
  const { analytics, isLoading, error } = useKitAnalytics(kitId, dateRange)

  const performanceWithInsights = useMemo(() => {
    if (!analytics?.metrics.step_performance) return []

    const steps = analytics.metrics.step_performance

    return steps.map((step, index) => {
      const nextStep = steps[index + 1]
      const dropoffRate = nextStep
        ? ((step.total_views - nextStep.total_views) / step.total_views) * 100
        : 0

      return {
        ...step,
        dropoff_rate: dropoffRate,
        avg_time_formatted: formatDuration(step.avg_time),
        conversion_rate_formatted: `${(step.conversion_rate * 100).toFixed(1)}%`,
        performance_rating: getPerformanceRating(
          step.conversion_rate,
          dropoffRate
        ),
        is_bottleneck: dropoffRate > 30, // Flag steps with high dropoff
      }
    })
  }, [analytics])

  return {
    stepPerformance: performanceWithInsights,
    isLoading,
    error,
  }
}

// Hook for conversion funnel analysis
export function useConversionFunnel(
  kitId: string | null,
  dateRange?: { start_date: string; end_date: string }
) {
  const { analytics, isLoading, error } = useKitAnalytics(kitId, dateRange)

  const funnelAnalysis = useMemo(() => {
    if (!analytics?.metrics.conversion_funnel) return null

    const funnel = analytics.metrics.conversion_funnel
    const totalViews = funnel[0]?.views || 0

    const analysis = {
      steps: funnel.map(step => ({
        ...step,
        retention_rate: totalViews > 0 ? (step.views / totalViews) * 100 : 0,
        dropoff_rate_formatted: `${(step.dropoff_rate * 100).toFixed(1)}%`,
        conversion_rate_formatted: `${(step.conversion_rate * 100).toFixed(1)}%`,
      })),
      overall_completion_rate:
        totalViews > 0
          ? ((funnel[funnel.length - 1]?.views || 0) / totalViews) * 100
          : 0,
      biggest_dropoff_step: funnel.reduce(
        (max, step) =>
          step.dropoff_rate > (max?.dropoff_rate || 0) ? step : max,
        funnel[0]
      ),
    }

    return analysis
  }, [analytics])

  return {
    funnelAnalysis,
    isLoading,
    error,
  }
}

// Hook for date range management
export function useAnalyticsDateRange(
  defaultRange: 'last_7_days' | 'last_30_days' | 'last_90_days' = 'last_30_days'
) {
  const [dateRange, setDateRange] = useState<{
    start_date: string
    end_date: string
  }>(() => {
    const end = new Date()
    const start = new Date()

    switch (defaultRange) {
      case 'last_7_days':
        start.setDate(start.getDate() - 7)
        break
      case 'last_30_days':
        start.setDate(start.getDate() - 30)
        break
      case 'last_90_days':
        start.setDate(start.getDate() - 90)
        break
    }

    return {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    }
  })

  const setPresetRange = (
    preset: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom'
  ) => {
    if (preset === 'custom') return // Custom range should be set via setCustomRange

    const end = new Date()
    const start = new Date()

    switch (preset) {
      case 'last_7_days':
        start.setDate(start.getDate() - 7)
        break
      case 'last_30_days':
        start.setDate(start.getDate() - 30)
        break
      case 'last_90_days':
        start.setDate(start.getDate() - 90)
        break
    }

    setDateRange({
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    })
  }

  const setCustomRange = (start: Date, end: Date) => {
    setDateRange({
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    })
  }

  return {
    dateRange,
    setPresetRange,
    setCustomRange,
  }
}

// Utility functions
const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

const getPerformanceRating = (
  conversionRate: number,
  dropoffRate: number
): 'excellent' | 'good' | 'average' | 'poor' => {
  if (conversionRate > 0.8 && dropoffRate < 10) return 'excellent'
  if (conversionRate > 0.6 && dropoffRate < 20) return 'good'
  if (conversionRate > 0.4 && dropoffRate < 30) return 'average'
  return 'poor'
}

// Export types for use in components
export type {
  KitAnalyticsData,
  AnalyticsOverview,
  TimelineData,
  StepPerformance,
  ClientSegments,
  ConversionFunnelStep,
}
