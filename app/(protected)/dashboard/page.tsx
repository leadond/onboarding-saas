'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface DashboardStats {
  totalKits: number
  activeClients: number
  completionRate: number
  thisMonthCompletions: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalKits: 0,
    activeClients: 0,
    completionRate: 0,
    thisMonthCompletions: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard')

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          setStats(data.data.stats)
          setRecentActivity(data.data.recentActivity || [])
        } else {
          throw new Error(data.error || 'Failed to load dashboard data')
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome back! Here&apos;s an overview of your onboarding kits.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/kits/new">Create New Kit</Link>
          </Button>
        </div>
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-red-900">
            Unable to load dashboard
          </h3>
          <p className="mb-6 text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-8">
      <div className="space-y-10">
        {/* Header Section */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Welcome back! Here&apos;s an overview of your onboarding kits.
              </p>
            </div>
            <Button asChild size="lg" className="shadow-glow">
              <Link href="/dashboard/kits/new">
                <span className="mr-2">✨</span>
                Create New Kit
              </Link>
            </Button>
          </div>
          
          {/* Color Line Separator */}
          <div className="absolute -bottom-5 left-0 w-32 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
        </div>

        {/* Stats Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-primary-50 to-primary-100/50 hover:from-primary-100 hover:to-primary-200/50 shadow-soft">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-4 relative z-10">
                <CardDescription className="text-primary-600 font-semibold">📊 Total Kits</CardDescription>
                <CardTitle className="text-4xl font-bold text-primary-700">{stats.totalKits}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-primary-600/80">
                  {stats.totalKits === 0 ? 'No kits created yet' : 'Onboarding kits'}
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-success-50 to-success-100/50 hover:from-success-100 hover:to-success-200/50 shadow-soft">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-500 to-success-600"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-success-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-4 relative z-10">
                <CardDescription className="text-success-600 font-semibold">👥 Active Clients</CardDescription>
                <CardTitle className="text-4xl font-bold text-success-700">{stats.activeClients}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-success-600/80">
                  {stats.activeClients === 0 ? 'No active clients' : 'Currently onboarding'}
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-warning-50 to-warning-100/50 hover:from-warning-100 hover:to-warning-200/50 shadow-soft">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning-500 to-warning-600"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-warning-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-4 relative z-10">
                <CardDescription className="text-warning-600 font-semibold">📈 Completion Rate</CardDescription>
                <CardTitle className="text-4xl font-bold text-warning-700">{stats.completionRate}%</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-warning-600/80">
                  {stats.completionRate === 0 ? 'No data yet' : 'Average completion'}
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-secondary-50 to-secondary-100/50 hover:from-secondary-100 hover:to-secondary-200/50 shadow-soft">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-500 to-secondary-600"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-4 relative z-10">
                <CardDescription className="text-secondary-600 font-semibold">🎯 This Month</CardDescription>
                <CardTitle className="text-4xl font-bold text-secondary-700">{stats.thisMonthCompletions}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-sm text-secondary-600/80">
                  {stats.thisMonthCompletions === 0 ? 'No completions yet' : 'Completed'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Color Line Separator */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="relative overflow-hidden shadow-soft">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">📈</span>
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-base">
                  {recentActivity.length === 0 
                    ? 'No recent activity' 
                    : 'Latest updates from your onboarding kits'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center shadow-soft">
                      <span className="text-3xl">📋</span>
                    </div>
                    <p className="text-muted-foreground text-base">
                      No recent activity. Create a kit to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {recentActivity.slice(0, 5).map(activity => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-muted/30 transition-all duration-200 border border-transparent hover:border-primary/20">
                        <div className="h-3 w-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mt-2 shadow-sm"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden shadow-soft">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-500 to-success-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <span className="text-2xl">⚡</span>
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-base">
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color Line Separator */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent mb-6"></div>
                
                <Button asChild className="w-full justify-start h-14 text-left shadow-glow" size="lg">
                  <Link href="/dashboard/kits/new">
                    <span className="mr-3 text-xl">✨</span>
                    Create Onboarding Kit
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start h-14 hover:shadow-soft transition-all duration-200" size="lg">
                  <Link href="/dashboard/clients">
                    <span className="mr-3 text-xl">👥</span>
                    Manage Clients
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start h-14 hover:shadow-soft transition-all duration-200" size="lg">
                  <Link href="/dashboard/analytics">
                    <span className="mr-3 text-xl">📊</span>
                    View Analytics
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start h-14 hover:shadow-soft transition-all duration-200" size="lg">
                  <Link href="/dashboard/settings">
                    <span className="mr-3 text-xl">⚙️</span>
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Color Line Separator */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full"></div>
        </div>

        {/* Empty State */}
        {stats.totalKits === 0 && (
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary-50/50 to-primary-100/30">
            <div className="absolute inset-0 bg-gradient-mesh opacity-5"></div>
            <CardContent className="py-16 text-center relative z-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-foreground">
                Welcome to Onboard Hero!
              </h3>
              <p className="mb-8 text-lg text-muted-foreground max-w-md mx-auto">
                Create your first onboarding kit to start streamlining your client onboarding process.
              </p>
              <Button asChild size="lg" className="shadow-glow">
                <Link href="/dashboard/kits/new">
                  <span className="mr-2">✨</span>
                  Create Your First Kit
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}