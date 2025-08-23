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

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Database, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Server,
  HardDrive,
  Cpu,
  Wifi
} from 'lucide-react'

export default function AdminPanelPage() {
  const [systemStats, setSystemStats] = useState({
    uptime: '7 days, 14 hours',
    totalUsers: 1247,
    activeUsers: 892,
    totalCompanies: 156,
    totalKits: 89,
    systemHealth: 'healthy',
    databaseSize: '2.4 GB',
    apiCalls: 45678,
    errorRate: 0.02
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'user_login',
      message: 'User john.doe@example.com logged in',
      timestamp: '2024-01-20T14:30:00Z',
      severity: 'info'
    },
    {
      id: 2,
      type: 'kit_created',
      message: 'New onboarding kit created by jane.smith@demo.com',
      timestamp: '2024-01-20T14:25:00Z',
      severity: 'info'
    },
    {
      id: 3,
      type: 'error',
      message: 'API rate limit exceeded for IP 192.168.1.100',
      timestamp: '2024-01-20T14:20:00Z',
      severity: 'warning'
    },
    {
      id: 4,
      type: 'system',
      message: 'Database backup completed successfully',
      timestamp: '2024-01-20T14:00:00Z',
      severity: 'success'
    }
  ])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>
      case 'warning':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🔧 Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            System administration and monitoring dashboard for global administrators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            System Healthy
          </Badge>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-primary-600 font-semibold flex items-center gap-2">
              <Server className="w-4 h-4" />
              System Uptime
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{systemStats.uptime}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">99.9% availability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-success-600 font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Users
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{systemStats.activeUsers.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">of {systemStats.totalUsers.toLocaleString()} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-warning-600 font-semibold flex items-center gap-2">
              <Database className="w-4 h-4" />
              Database Size
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{systemStats.databaseSize}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Growing steadily</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-destructive-600 font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Error Rate
            </CardDescription>
            <CardTitle className="text-2xl font-bold">{(systemStats.errorRate * 100).toFixed(2)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different admin sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Statistics</CardTitle>
                <CardDescription>Key metrics across the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Companies</span>
                  <span className="text-2xl font-bold">{systemStats.totalCompanies}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Onboarding Kits</span>
                  <span className="text-2xl font-bold">{systemStats.totalKits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">API Calls (24h)</span>
                  <span className="text-2xl font-bold">{systemStats.apiCalls.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage User Roles
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Database Backup
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  System Configuration
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  View System Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">User Management</h3>
                <p className="text-muted-foreground mb-4">
                  Access detailed user management from the dedicated Users page.
                </p>
                <Button>
                  Go to User Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  CPU Usage
                </CardDescription>
                <CardTitle className="text-2xl font-bold">23%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Memory Usage
                </CardDescription>
                <CardTitle className="text-2xl font-bold">67%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Disk Usage
                </CardDescription>
                <CardTitle className="text-2xl font-bold">45%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Network I/O
                </CardDescription>
                <CardTitle className="text-2xl font-bold">12 MB/s</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">↑ 8.2 MB/s ↓ 3.8 MB/s</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System events and user activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(activity.severity)}
                      <div>
                        <p className="font-medium">{activity.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                    {getSeverityBadge(activity.severity)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}