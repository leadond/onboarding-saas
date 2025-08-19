/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Filter, Download, RefreshCw } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  metadata: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
  user?: {
    email: string
    full_name: string
  }
}

interface ActivityLogViewerProps {
  organizationId?: string
  userId?: string
  resourceType?: string
  resourceId?: string
}

const actionLabels: Record<string, string> = {
  'create': 'Created',
  'update': 'Updated',
  'delete': 'Deleted',
  'view': 'Viewed',
  'login': 'Logged In',
  'logout': 'Logged Out',
  'invite': 'Invited',
  'accept': 'Accepted',
  'reject': 'Rejected',
}

export function ActivityLogViewer({
  organizationId,
  userId,
  resourceType,
  resourceId,
}: ActivityLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedResource, setSelectedResource] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')

  useEffect(() => {
    fetchLogs()
  }, [organizationId, userId, resourceType, resourceId])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // Mock data for now
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          user_id: 'user-1',
          action: 'create',
          resource_type: 'kit',
          resource_id: 'kit-1',
          metadata: { title: 'New Onboarding Kit' },
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date().toISOString(),
          user: {
            email: 'user@example.com',
            full_name: 'John Doe',
          },
        },
        {
          id: '2',
          user_id: 'user-2',
          action: 'update',
          resource_type: 'organization',
          resource_id: 'org-1',
          metadata: { name: 'Updated Organization' },
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0...',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user: {
            email: 'admin@example.com',
            full_name: 'Jane Admin',
          },
        },
      ]
      setLogs(mockLogs)
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = selectedAction === 'all' || log.action === selectedAction
    const matchesResource = selectedResource === 'all' || log.resource_type === selectedResource

    return matchesSearch && matchesAction && matchesResource
  })

  // Get unique actions and resources for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action).filter(Boolean)))
  const uniqueResources = Array.from(new Set(logs.map(log => log.resource_type).filter(Boolean)))

  const exportLogs = () => {
    const csvContent = [
      ['Date', 'User', 'Action', 'Resource', 'Details'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user?.full_name || log.user?.email || 'Unknown',
        actionLabels[log.action] || log.action,
        log.resource_type,
        JSON.stringify(log.metadata).replace(/"/g, '""'),
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Log</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogs}
              disabled={filteredLogs.length === 0}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {actionLabels[action] || action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedResource} onValueChange={setSelectedResource}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              {uniqueResources.map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Loading logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit logs found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {log.user?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {log.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {actionLabels[log.action] || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {log.resource_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={JSON.stringify(log.metadata, null, 2)}>
                        {Object.keys(log.metadata).length > 0
                          ? JSON.stringify(log.metadata)
                          : 'No details'
                        }
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ip_address}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination info */}
        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>
              Showing {filteredLogs.length} of {logs.length} logs
            </div>
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
