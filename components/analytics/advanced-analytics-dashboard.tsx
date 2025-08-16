'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Clock,
  DollarSign,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  MousePointer,
  Smartphone,
  Monitor
} from 'lucide-react'

interface AnalyticsData {
  kit_id: string
  period: string
  date_range: {
    start: string
    end: string
  }
  basic_analytics: {
    total_clients: number
    completed_clients: number
    active_clients: number
    abandoned_clients: number
    completion_rate: number
    bounce_rate: number
    avg_completion_time_minutes: number
  }
  conversion_funnel: {
    total_entries: number
    steps: Array<{
      step_id: string
      step_title: string
      step_order: number
      completions: number
      conversion_rate: number
    }>
  }
  performance_benchmarks: Array<{
    benchmark_date: string
    completion_rate: number
    avg_completion_time: number
    bounce_rate: number
    client_satisfaction: number
    mobile_completion_rate: number
    desktop_completion_rate: number
  }>
  roi_data: {
    total_clients: number
    completed_clients: number
    revenue_generated: number
    cost_per_acquisition: number
    customer_lifetime_value: number
    time_saved_hours: number
    cost_savings: number
    roi_percentage: number
    payback_period_days: number
    efficiency_score: number
  } | null
  behavior_insights: {
    total_events: number
    event_distribution: Record<string, number>
    step_interactions: Record<string, Record<string, number>>
    most_common_events: Array<{ event: string; count: number }>
  }
}

interface AdvancedAnalyticsDashboardProps {
  kitId: string
  initialData?: AnalyticsData
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function AdvancedAnalyticsDashboard({ kitId, initialData }: AdvancedAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [period, setPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!initialData) {
      fetchAnalytics()
    }
  }, [kitId, period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/analytics?kit_id=${kitId}&period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchAnalytics()
  }

  const exportData = () => {
    if (!data) return
    
    const exportData = {
      ...data,
      exported_at: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${kitId}-${period}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading analytics...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
        <p className="text-muted-foreground mb-4">Unable to load analytics data for this kit.</p>
        <Button onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const { basic_analytics, conversion_funnel, performance_benchmarks, roi_data, behavior_insights } = data

  // Prepare chart data
  const funnelData = conversion_funnel?.steps?.map(step => ({
    name: step.step_title,
    value: step.completions,
    conversion_rate: step.conversion_rate * 100
  })) || []

  const trendsData = performance_benchmarks?.map(benchmark => ({
    date: new Date(benchmark.benchmark_date).toLocaleDateString(),
    completion_rate: benchmark.completion_rate * 100,
    bounce_rate: benchmark.bounce_rate * 100,
    satisfaction: benchmark.client_satisfaction,
    mobile_rate: benchmark.mobile_completion_rate * 100,
    desktop_rate: benchmark.desktop_completion_rate * 100
  })) || []

  const behaviorData = Object.entries(behavior_insights?.event_distribution || {}).map(([event, count]) => ({
    name: event.replace('_', ' ').toUpperCase(),
    value: count
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">
            {new Date(data.date_range.start).toLocaleDateString()} - {new Date(data.date_range.end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basic_analytics.total_clients.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {basic_analytics.completed_clients} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basic_analytics.completion_rate.toFixed(1)}%</div>
            <Progress value={basic_analytics.completion_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basic_analytics.avg_completion_time_minutes}m</div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(basic_analytics.avg_completion_time_minutes / 60)}h {basic_analytics.avg_completion_time_minutes % 60}m average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roi_data ? `${roi_data.roi_percentage.toFixed(1)}%` : 'N/A'}
            </div>
            {roi_data && (
              <p className="text-xs text-muted-foreground">
                ${roi_data.revenue_generated.toLocaleString()} revenue
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: basic_analytics.completed_clients, color: '#00C49F' },
                        { name: 'Active', value: basic_analytics.active_clients, color: '#0088FE' },
                        { name: 'Abandoned', value: basic_analytics.abandoned_clients, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Completed', value: basic_analytics.completed_clients, color: '#00C49F' },
                        { name: 'Active', value: basic_analytics.active_clients, color: '#0088FE' },
                        { name: 'Abandoned', value: basic_analytics.abandoned_clients, color: '#FF8042' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Performance</CardTitle>
                <CardDescription>Completion rates by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span className="text-sm">Desktop</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {performance_benchmarks?.[0]?.desktop_completion_rate 
                          ? (performance_benchmarks[0].desktop_completion_rate * 100).toFixed(1) + '%'
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={performance_benchmarks?.[0]?.desktop_completion_rate * 100 || 0} 
                    className="h-2" 
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Mobile</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {performance_benchmarks?.[0]?.mobile_completion_rate 
                          ? (performance_benchmarks[0].mobile_completion_rate * 100).toFixed(1) + '%'
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={performance_benchmarks?.[0]?.mobile_completion_rate * 100 || 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
              <CardDescription>
                Step-by-step conversion rates showing where clients drop off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'value' ? `${value} clients` : `${Number(value).toFixed(1)}%`,
                      name === 'value' ? 'Completions' : 'Conversion Rate'
                    ]}
                  />
                  <Bar dataKey="value" fill="#0088FE" />
                  <Bar dataKey="conversion_rate" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Track key metrics over time to identify patterns and improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completion_rate" 
                    stroke="#0088FE" 
                    name="Completion Rate (%)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bounce_rate" 
                    stroke="#FF8042" 
                    name="Bounce Rate (%)"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="satisfaction" 
                    stroke="#00C49F" 
                    name="Satisfaction Score"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
                <CardDescription>
                  Most common user interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={behaviorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {behaviorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Events</CardTitle>
                <CardDescription>
                  Most frequent user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behavior_insights?.most_common_events?.map((event, index) => (
                    <div key={event.event} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm capitalize">{event.event.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{event.count.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          {roi_data ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${roi_data.revenue_generated.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total revenue generated</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cost per acquisition</span>
                      <span>${roi_data.cost_per_acquisition.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Customer LTV</span>
                      <span>${roi_data.customer_lifetime_value.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {roi_data.time_saved_hours.toFixed(1)}h
                  </div>
                  <p className="text-sm text-muted-foreground">Hours saved through automation</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span>Cost savings</span>
                      <span className="text-green-600">${roi_data.cost_savings.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ROI Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {roi_data.roi_percentage.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Return on investment</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Payback period</span>
                      <span>{roi_data.payback_period_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Efficiency score</span>
                      <span>{roi_data.efficiency_score.toFixed(1)}/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ROI Data Available</h3>
                <p className="text-muted-foreground">
                  ROI calculations will appear here once you have sufficient data and revenue tracking.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
