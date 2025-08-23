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

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, subDays } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Activity,
  Upload,
  CreditCard
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Kit = {
  id: string
  name: string
  slug: string
  analytics_enabled: boolean
}

type AnalyticsData = {
  kit_id: string
  kit_name: string
  date_range: {
    start_date: string
    end_date: string
  }
  metrics: {
    overview: {
      total_views: number
      total_starts?: number
      total_completions: number
      completion_rate: number
      avg_completion_time: number
      avg_completion_time_seconds?: number
      unique_clients: number
    }
    timeline: Array<{
      date: string
      views: number
      completions: number
      starts: number
    }>
    step_performance: Array<{
      step_id: string
      title: string
      step_type: string
      step_order: number
      total_views: number
      completions: number
      avg_time: number
      conversion_rate: number
    }>
    client_segments: {
      total: number
      completed: number
      in_progress: number
      not_started: number
      completion_rate: number
      avg_completion_time: number
    }
    conversion_funnel: Array<{
      step_order: number
      step_title: string
      step_type: string
      views: number
      conversion_rate: number
      dropoff_rate: number
    }>
  }
  zero_state?: boolean
  message?: string
}

export default function KitAnalyticsPage({
  params,
}: {
  params: Promise<{ kitId: string }>
}) {
  const { kitId } = React.use(params)
  const [kit, setKit] = useState<Kit | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState('30')
  const [zeroStateMessage, setZeroStateMessage] = useState<string | null>(null)

  const fetchAnalytics = async (days: string = '30') => {
    try {
      setIsLoading(true)
      setError(null)
      setZeroStateMessage(null)
      const endDate = new Date().toISOString()
      const startDate = subDays(new Date(), parseInt(days)).toISOString()
      
      const response = await fetch(
        `/api/kits/${kitId}/analytics?start_date=${startDate}&end_date=${endDate}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch analytics')
      }
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics')
      }
      
      setAnalytics(result.data)
      
      // Handle zero state messaging
      if (result.zero_state && result.message) {
        setZeroStateMessage(result.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchKit = async () => {
      try {
        const response = await fetch(`/api/kits/${kitId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch kit')
        }
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch kit')
        }
        setKit(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchKit()
  }, [kitId])

  useEffect(() => {
    if (kit?.analytics_enabled) {
      fetchAnalytics(dateRange)
    } else if (kit && !kit.analytics_enabled) {
      setIsLoading(false)
    }
  }, [kit, dateRange])

  const handleExportAnalytics = async () => {
    try {
      setIsExporting(true)
      const response = await fetch(`/api/kits/${kitId}/analytics/export`)
      if (!response.ok) {
        throw new Error('Failed to export analytics')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${kit?.name || 'kit'}-analytics.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export analytics')
    } finally {
      setIsExporting(false)
    }
  }

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const getStepTypeIcon = (stepType: string) => {
    switch (stepType) {
      case 'welcome_message':
      case 'welcome_video':
        return <Activity className="h-4 w-4" />
      case 'intake_form':
        return <Users className="h-4 w-4" />
      case 'file_upload':
        return <Upload className="h-4 w-4" />
      case 'contract_signing':
        return <CheckCircle className="h-4 w-4" />
      case 'payment':
        return <CreditCard className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !kit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/kits/${kitId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kit
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error || 'Kit not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!kit.analytics_enabled) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/kits/${kit.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {kit.name}
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3" />
            Analytics
          </h1>
          <p className="mt-2 text-gray-600">Track your kit's performance and user engagement</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Disabled</h3>
              <p className="text-gray-600 mb-4">
                Enable analytics to track your kit's performance and user engagement.
              </p>
              <Button asChild>
                <Link href={`/dashboard/kits/${kit.id}/settings`}>
                  Enable Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/kits/${kit.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {kit.name}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              Analytics
            </h1>
            <p className="mt-2 text-gray-600">Track your kit's performance and user engagement</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportAnalytics} variant="outline" disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {zeroStateMessage && !error && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <Activity className="h-5 w-5 text-blue-400 mr-2" />
            <p className="text-sm text-blue-600">{zeroStateMessage}</p>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.metrics.overview.total_views || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique kit visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.metrics.overview.total_completions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Full kit completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.metrics.overview.completion_rate 
                ? `${Math.round(analytics.metrics.overview.completion_rate * 100)}%` 
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Views to completions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.metrics.overview.avg_completion_time_seconds
                ? formatDuration(analytics.metrics.overview.avg_completion_time_seconds * 1000)
                : analytics?.metrics.overview.avg_completion_time
                ? formatDuration(analytics.metrics.overview.avg_completion_time)
                : '0m'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              To complete kit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.metrics.overview.unique_clients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Individual users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Segments */}
      {analytics?.metrics.client_segments && (
        <Card>
          <CardHeader>
            <CardTitle>Client Progress</CardTitle>
            <CardDescription>
              Overview of client engagement and completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analytics.metrics.client_segments.completed}
                </div>
                <p className="text-sm text-green-700">Completed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.metrics.client_segments.in_progress}
                </div>
                <p className="text-sm text-blue-700">In Progress</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {analytics.metrics.client_segments.not_started}
                </div>
                <p className="text-sm text-gray-700">Not Started</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analytics.metrics.client_segments.completion_rate * 100)}%
                </div>
                <p className="text-sm text-purple-700">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Step Performance</CardTitle>
          <CardDescription>
            Detailed analytics for each step in your kit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!analytics?.metrics.step_performance || analytics.metrics.step_performance.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No step analytics data available yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Data will appear once clients start using your kit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.metrics.step_performance.map((step) => (
                <div key={step.step_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {getStepTypeIcon(step.step_type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Step {step.step_order + 1}: {step.title}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {step.step_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      step.conversion_rate > 0.8 
                        ? 'bg-green-100 text-green-800'
                        : step.conversion_rate > 0.5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(step.conversion_rate * 100)}% completion
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Views</p>
                      <p className="font-medium text-lg">{step.total_views}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Completions</p>
                      <p className="font-medium text-lg">{step.completions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg. Time</p>
                      <p className="font-medium text-lg">
                        {formatDuration(step.avg_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Drop-off Rate</p>
                      <p className="font-medium text-lg">
                        {Math.round((1 - step.conversion_rate) * 100)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          step.conversion_rate > 0.8 
                            ? 'bg-green-500'
                            : step.conversion_rate > 0.5
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${step.conversion_rate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      {analytics?.metrics.conversion_funnel && analytics.metrics.conversion_funnel.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              Step-by-step conversion rates through your onboarding process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.metrics.conversion_funnel.map((step, index) => (
                <div key={step.step_order} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{step.step_title}</h4>
                      <div className="text-sm text-gray-500">
                        {step.views} views • {Math.round(step.conversion_rate * 100)}% conversion
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${step.conversion_rate * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Chart */}
      {analytics?.metrics.timeline && analytics.metrics.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Daily views and completions over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.metrics.timeline.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="text-sm font-medium">
                    {format(new Date(day.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{day.views} views</span>
                    <span>{day.completions} completions</span>
                    <span>{day.starts} starts</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}