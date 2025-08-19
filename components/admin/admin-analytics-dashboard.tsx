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
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface AnalyticsData {
  totalClients: number
  activeClients: number
  completedClients: number
  stuckClients: number
  averageCompletionTime: number
  averageProgressPercentage: number
  topPerformingKits: Array<{
    kitName: string
    clientCount: number
    averageCompletion: number
    completionRate: number
  }>
  recentActivity: Array<{
    clientName: string
    kitName: string
    action: string
    timestamp: string
  }>
  completionTrends: Array<{
    date: string
    completions: number
    newStarts: number
  }>
}

interface AdminAnalyticsDashboardProps {
  kitId?: string
  className?: string
  timeRange?: '7d' | '30d' | '90d'
  onTimeRangeChange?: (range: '7d' | '30d' | '90d') => void
}

export function AdminAnalyticsDashboard({
  kitId,
  className,
  timeRange = '30d',
  onTimeRangeChange,
}: AdminAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClients: 0,
    activeClients: 0,
    completedClients: 0,
    stuckClients: 0,
    averageCompletionTime: 0,
    averageProgressPercentage: 0,
    topPerformingKits: [],
    recentActivity: [],
    completionTrends: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [kitId, timeRange])

  async function loadAnalytics() {
    setIsLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(
        endDate.getDate() - parseInt(timeRange.replace('d', ''))
      )

      // Get client progress data
      let query = supabase
        .from('client_progress')
        .select(
          `
          *,
          kits!inner(
            id,
            name,
            user_id
          )
        `
        )
        .gte('created_at', startDate.toISOString())

      if (kitId) {
        query = query.eq('kit_id', kitId)
      }

      const { data: progressData, error } = await query

      if (error) {
        console.error('Analytics query error:', error)
        return
      }

      // Process analytics data
      const processedAnalytics = await processAnalyticsData(progressData || [])
      setAnalytics(processedAnalytics)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function processAnalyticsData(data: any[]): Promise<AnalyticsData> {
    // Group by client and calculate metrics
    const clientMap = new Map()
    const kitMap = new Map()

    data.forEach(progress => {
      const clientId = progress.client_identifier
      const kitId = progress.kit_id
      const kitName = progress.kits.name

      // Track clients
      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          id: clientId,
          kitId,
          kitName,
          totalSteps: 0,
          completedSteps: 0,
          startDate: progress.created_at,
          lastActivity: progress.updated_at,
          status: 'not_started',
        })
      }

      const client = clientMap.get(clientId)
      client.totalSteps++

      if (progress.completed) {
        client.completedSteps++
      }

      if (new Date(progress.updated_at) > new Date(client.lastActivity)) {
        client.lastActivity = progress.updated_at
      }

      // Track kits
      if (!kitMap.has(kitId)) {
        kitMap.set(kitId, {
          name: kitName,
          clients: new Set(),
          completedClients: new Set(),
          totalSteps: 0,
          completedSteps: 0,
        })
      }

      const kit = kitMap.get(kitId)
      kit.clients.add(clientId)
      kit.totalSteps++

      if (progress.completed) {
        kit.completedSteps++
      }
    })

    // Calculate client statuses and metrics
    const clients = Array.from(clientMap.values())
    const totalClients = clients.length
    let activeClients = 0
    let completedClients = 0
    let stuckClients = 0
    let totalProgress = 0
    let totalCompletionTime = 0
    let completedClientsWithTime = 0

    clients.forEach(client => {
      const completionPercentage =
        client.totalSteps > 0
          ? (client.completedSteps / client.totalSteps) * 100
          : 0

      totalProgress += completionPercentage

      if (completionPercentage === 100) {
        client.status = 'completed'
        completedClients++

        // Calculate completion time
        const startTime = new Date(client.startDate).getTime()
        const endTime = new Date(client.lastActivity).getTime()
        const completionDays = (endTime - startTime) / (1000 * 60 * 60 * 24)

        if (completionDays > 0) {
          totalCompletionTime += completionDays
          completedClientsWithTime++
        }
      } else if (completionPercentage > 0) {
        // Check if stuck (no activity in last 3 days)
        const daysSinceActivity =
          (Date.now() - new Date(client.lastActivity).getTime()) /
          (1000 * 60 * 60 * 24)

        if (daysSinceActivity > 3) {
          client.status = 'stuck'
          stuckClients++
        } else {
          client.status = 'active'
          activeClients++
        }
      }

      // Track kit completion
      if (client.status === 'completed') {
        const kit = kitMap.get(client.kitId)
        if (kit) {
          kit.completedClients.add(client.id)
        }
      }
    })

    const averageCompletionTime =
      completedClientsWithTime > 0
        ? totalCompletionTime / completedClientsWithTime
        : 0

    const averageProgressPercentage =
      totalClients > 0 ? totalProgress / totalClients : 0

    // Calculate top performing kits
    const topPerformingKits = Array.from(kitMap.values())
      .map(kit => ({
        kitName: kit.name,
        clientCount: kit.clients.size,
        averageCompletion:
          kit.totalSteps > 0 ? (kit.completedSteps / kit.totalSteps) * 100 : 0,
        completionRate:
          kit.clients.size > 0
            ? (kit.completedClients.size / kit.clients.size) * 100
            : 0,
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5)

    // Generate recent activity (mock data for demo)
    const recentActivity = clients
      .sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
      )
      .slice(0, 10)
      .map(client => ({
        clientName: `Client ${client.id.substring(0, 8)}`,
        kitName: client.kitName,
        action:
          client.status === 'completed'
            ? 'Completed onboarding'
            : client.status === 'active'
              ? 'Made progress'
              : 'Started onboarding',
        timestamp: client.lastActivity,
      }))

    // Generate completion trends (simplified for demo)
    const completionTrends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const dayCompletions = clients.filter(client => {
        if (client.status !== 'completed') return false
        const completionDate = new Date(client.lastActivity)
        return completionDate.toDateString() === date.toDateString()
      }).length

      const dayStarts = clients.filter(client => {
        const startDate = new Date(client.startDate)
        return startDate.toDateString() === date.toDateString()
      }).length

      completionTrends.push({
        date: date.toISOString().split('T')[0] || '',
        completions: dayCompletions,
        newStarts: dayStarts,
      })
    }

    return {
      totalClients,
      activeClients,
      completedClients,
      stuckClients,
      averageCompletionTime,
      averageProgressPercentage,
      topPerformingKits,
      recentActivity,
      completionTrends,
    }
  }

  async function refreshAnalytics() {
    setRefreshing(true)
    await loadAnalytics()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-8 w-1/2 rounded bg-gray-200"></div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="mb-4 h-6 w-1/2 rounded bg-gray-200"></div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 rounded bg-gray-200"></div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor your onboarding performance and client insights
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={e => onTimeRangeChange?.(e.target.value as any)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <Button
            onClick={refreshAnalytics}
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Total Clients',
            value: analytics.totalClients,
            subtext: 'All clients',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            icon: '👥',
          },
          {
            title: 'Active Now',
            value: analytics.activeClients,
            subtext: 'Making progress',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            icon: '🚀',
          },
          {
            title: 'Completed',
            value: analytics.completedClients,
            subtext: 'Finished onboarding',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            icon: '✅',
          },
          {
            title: 'Need Help',
            value: analytics.stuckClients,
            subtext: 'Require assistance',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            icon: '⚠️',
          },
        ].map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">{metric.title}</p>
                <p className={cn('text-3xl font-bold', metric.color)}>
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-gray-500">{metric.subtext}</p>
              </div>
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg text-2xl',
                  metric.bgColor
                )}
              >
                {metric.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Average Completion Time
          </h3>
          <div className="text-3xl font-bold text-blue-600">
            {Math.round(analytics.averageCompletionTime)} days
          </div>
          <p className="mt-1 text-sm text-gray-600">From start to finish</p>
        </Card>

        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Average Progress
          </h3>
          <div className="text-3xl font-bold text-green-600">
            {Math.round(analytics.averageProgressPercentage)}%
          </div>
          <p className="mt-1 text-sm text-gray-600">Across all clients</p>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Performing Kits */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Top Performing Kits
          </h3>
          <div className="space-y-4">
            {analytics.topPerformingKits.length > 0 ? (
              analytics.topPerformingKits.map((kit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {kit.kitName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {kit.clientCount} clients •{' '}
                      {Math.round(kit.averageCompletion)}% avg progress
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {Math.round(kit.completionRate)}%
                    </div>
                    <div className="text-xs text-gray-500">completion rate</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No kit data available
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {analytics.recentActivity.length > 0 ? (
              analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 rounded p-2 hover:bg-gray-50"
                >
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{activity.clientName}</span>{' '}
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.kitName} •{' '}
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Completion Trends */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          7-Day Completion Trend
        </h3>
        <div className="space-y-4">
          {analytics.completionTrends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="text-sm text-gray-600">
                {new Date(trend.date).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium text-green-600">
                    {trend.completions}
                  </span>
                  <span className="text-gray-500"> completed</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-blue-600">
                    {trend.newStarts}
                  </span>
                  <span className="text-gray-500"> started</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
