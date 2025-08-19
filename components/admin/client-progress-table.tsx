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
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface ClientProgressData {
  id: string
  client_identifier: string
  client_name?: string
  client_email?: string
  kit_name: string
  total_steps: number
  completed_steps: number
  completion_percentage: number
  last_activity: string
  status: 'not_started' | 'in_progress' | 'completed' | 'stuck'
  created_at: string
  updated_at: string
  current_step?: string
  time_spent_minutes?: number
}

interface ClientProgressTableProps {
  kitId?: string
  className?: string
  onClientSelect?: (client: ClientProgressData) => void
  onSendNotification?: (client: ClientProgressData, type: string) => void
  refreshTrigger?: number
}

export function ClientProgressTable({
  kitId,
  className,
  onClientSelect,
  onSendNotification,
  refreshTrigger = 0,
}: ClientProgressTableProps) {
  const [clients, setClients] = useState<ClientProgressData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<
    'name' | 'progress' | 'last_activity' | 'created_at'
  >('last_activity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const supabase = createClient()

  useEffect(() => {
    loadClientProgress()
  }, [kitId, refreshTrigger])

  async function loadClientProgress() {
    setIsLoading(true)
    try {
      // Get all client progress data with kit information
      let query = supabase.from('client_progress').select(`
          *,
          kits!inner(
            id,
            name,
            user_id
          ),
          kit_steps!inner(
            id,
            title,
            step_type
          )
        `)

      if (kitId) {
        query = query.eq('kit_id', kitId)
      }

      const { data: progressData, error: progressError } = await query

      if (progressError) {
        console.error('Error loading progress:', progressError)
        return
      }

      // Group progress by client and calculate metrics
      const clientMap = new Map<string, ClientProgressData>()

      progressData?.forEach((progress: any) => {
        const clientId = progress.client_identifier
        const kitName = progress.kits.name

        if (!clientMap.has(clientId)) {
          clientMap.set(clientId, {
            id: clientId,
            client_identifier: clientId,
            client_name: progress.client_name || 'Unknown Client',
            client_email: progress.client_email,
            kit_name: kitName,
            total_steps: 0,
            completed_steps: 0,
            completion_percentage: 0,
            last_activity: progress.updated_at,
            status: 'not_started',
            created_at: progress.created_at,
            updated_at: progress.updated_at,
            time_spent_minutes: 0,
          })
        }

        const client = clientMap.get(clientId)!
        client.total_steps++

        if (progress.completed) {
          client.completed_steps++
        } else if (progress.started_at) {
          client.status = 'in_progress'
        }

        // Update last activity if this record is more recent
        if (new Date(progress.updated_at) > new Date(client.last_activity)) {
          client.last_activity = progress.updated_at
          if (progress.started_at && !progress.completed) {
            client.current_step = progress.kit_steps.title
          }
        }

        // Add time spent
        if (progress.time_spent_seconds) {
          client.time_spent_minutes =
            (client.time_spent_minutes || 0) +
            Math.round(progress.time_spent_seconds / 60)
        }
      })

      // Calculate final metrics and status for each client
      const clientsArray: ClientProgressData[] = Array.from(
        clientMap.values()
      ).map(client => {
        client.completion_percentage =
          client.total_steps > 0
            ? Math.round((client.completed_steps / client.total_steps) * 100)
            : 0

        // Determine status
        if (client.completion_percentage === 100) {
          client.status = 'completed'
        } else if (client.completion_percentage > 0) {
          // Check if stuck (no activity in last 3 days)
          const daysSinceActivity = Math.floor(
            (Date.now() - new Date(client.last_activity).getTime()) /
              (1000 * 60 * 60 * 24)
          )
          client.status = daysSinceActivity > 3 ? 'stuck' : 'in_progress'
        } else {
          client.status = 'not_started'
        }

        return client
      })

      setClients(clientsArray)
    } catch (error) {
      console.error('Failed to load client progress:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort clients
  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch =
        !searchTerm ||
        client.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.kit_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' || client.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = a.client_name || ''
          bValue = b.client_name || ''
          break
        case 'progress':
          aValue = a.completion_percentage
          bValue = b.completion_percentage
          break
        case 'last_activity':
          aValue = new Date(a.last_activity).getTime()
          bValue = new Date(b.last_activity).getTime()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue)
      } else {
        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

  function getStatusBadge(status: ClientProgressData['status']) {
    const styles = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      stuck: 'bg-red-100 text-red-800',
    }

    const labels = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      completed: 'Completed',
      stuck: 'Needs Help',
    }

    return (
      <span
        className={cn(
          'rounded-full px-2 py-1 text-xs font-medium',
          styles[status]
        )}
      >
        {labels[status]}
      </span>
    )
  }

  function getProgressBar(percentage: number) {
    return (
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            percentage === 100
              ? 'bg-green-500'
              : percentage >= 75
                ? 'bg-blue-500'
                : percentage >= 50
                  ? 'bg-yellow-500'
                  : percentage > 0
                    ? 'bg-orange-500'
                    : 'bg-gray-300'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading client progress...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Client Progress Monitor
            </h3>
            <p className="text-sm text-gray-600">
              Track and manage your clients&apos; onboarding progress
            </p>
          </div>
          <Button onClick={loadClientProgress} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search clients, emails, or kits..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="stuck">Needs Help</option>
          </select>

          <select
            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={`${sortBy}_${sortOrder}`}
            onChange={e => {
              const [field, order] = e.target.value.split('_')
              setSortBy(field as any)
              setSortOrder(order as any)
            }}
          >
            <option value="last_activity_desc">Recent Activity</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="progress_desc">Progress High-Low</option>
            <option value="progress_asc">Progress Low-High</option>
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: 'Total Clients',
              value: clients.length,
              color: 'text-blue-600',
            },
            {
              label: 'In Progress',
              value: clients.filter(c => c.status === 'in_progress').length,
              color: 'text-yellow-600',
            },
            {
              label: 'Completed',
              value: clients.filter(c => c.status === 'completed').length,
              color: 'text-green-600',
            },
            {
              label: 'Need Help',
              value: clients.filter(c => c.status === 'stuck').length,
              color: 'text-red-600',
            },
          ].map((stat, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-4 text-center">
              <div className={cn('text-2xl font-bold', stat.color)}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Client Table */}
        {filteredAndSortedClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="pb-3 font-medium text-gray-900">Client</th>
                  <th className="pb-3 font-medium text-gray-900">Kit</th>
                  <th className="pb-3 font-medium text-gray-900">Progress</th>
                  <th className="pb-3 font-medium text-gray-900">Status</th>
                  <th className="pb-3 font-medium text-gray-900">
                    Last Activity
                  </th>
                  <th className="pb-3 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedClients.map(client => (
                  <tr
                    key={client.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {client.client_name || 'Unknown'}
                        </div>
                        {client.client_email && (
                          <div className="text-sm text-gray-500">
                            {client.client_email}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="text-sm text-gray-900">
                        {client.kit_name}
                      </div>
                      {client.current_step && (
                        <div className="text-xs text-gray-500">
                          Current: {client.current_step}
                        </div>
                      )}
                    </td>

                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24">
                          {getProgressBar(client.completion_percentage)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {client.completion_percentage}%
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {client.completed_steps} / {client.total_steps} steps
                      </div>
                    </td>

                    <td className="py-4">{getStatusBadge(client.status)}</td>

                    <td className="py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(client.last_activity).toLocaleDateString()}
                      </div>
                      {client.time_spent_minutes &&
                        client.time_spent_minutes > 0 && (
                          <div className="text-xs text-gray-500">
                            {client.time_spent_minutes}m total
                          </div>
                        )}
                    </td>

                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onClientSelect?.(client)}
                        >
                          View
                        </Button>

                        {client.status === 'stuck' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onSendNotification?.(client, 'reminder')
                            }
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            Help
                          </Button>
                        )}

                        {client.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onSendNotification?.(client, 'completion')
                            }
                            className="border-green-200 text-green-600 hover:bg-green-50"
                          >
                            Celebrate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-2 text-lg text-gray-500">No clients found</div>
            <div className="text-sm text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No clients have started onboarding yet'}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
