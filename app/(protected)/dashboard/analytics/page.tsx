'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AnalyticsData {
  overview: {
    totalKits: number
    totalClients: number
    activeOnboardings: number
    completedThisMonth: number
    averageCompletionTime: number
    completionRate: number
  }
  recentActivity: Array<{
    id: string
    action: string
    resource: string
    timestamp: string
  }>
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/analytics')

        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.status}`)
        }

        const result = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error(result.error || 'Failed to load analytics')
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Track your onboarding performance and client progress.
          </p>
        </div>
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-red-900">
            Unable to load analytics
          </h3>
          <p className="mb-6 text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Track your onboarding performance and client progress.
          </p>
        </div>
        <div className="py-12 text-center">
          <p className="text-gray-500">No analytics data available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">
          Track your onboarding performance and client progress.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Kits</CardDescription>
            <CardTitle className="text-3xl">{data.overview.totalKits}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data.overview.totalKits === 0 ? 'No kits created' : 'Onboarding kits'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clients</CardDescription>
            <CardTitle className="text-3xl">{data.overview.totalClients}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data.overview.totalClients === 0 ? 'No clients yet' : 'Registered clients'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Onboardings</CardDescription>
            <CardTitle className="text-3xl">{data.overview.activeOnboardings}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data.overview.activeOnboardings === 0 ? 'No active onboardings' : 'In progress'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion Rate</CardDescription>
            <CardTitle className="text-3xl">{data.overview.completionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {data.overview.completionRate === 0 ? 'No data yet' : 'Average completion'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Completed This Month</span>
              <span className="text-2xl font-bold">{data.overview.completedThisMonth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg. Completion Time</span>
              <span className="text-2xl font-bold">
                {data.overview.averageCompletionTime === 0 
                  ? 'N/A' 
                  : `${data.overview.averageCompletionTime} days`
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              {data.recentActivity.length === 0 
                ? 'No recent activity' 
                : 'Latest system activity'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No recent activity to display.
              </p>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.slice(0, 5).map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action} - {activity.resource}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {data.overview.totalKits === 0 && (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No Data Available
          </h3>
          <p className="mb-6 text-gray-600">
            Create some onboarding kits and invite clients to see analytics.
          </p>
        </div>
      )}
    </div>
  )
}