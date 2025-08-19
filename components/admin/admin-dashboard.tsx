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

import React, { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClientProgressTable } from './client-progress-table'
import { AdminAnalyticsDashboard } from './admin-analytics-dashboard'
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

interface AdminDashboardProps {
  kitId?: string
  className?: string
}

export function AdminDashboard({ kitId, className }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'clients' | 'analytics'
  >('overview')
  const [selectedClient, setSelectedClient] =
    useState<ClientProgressData | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [sendingNotification, setSendingNotification] = useState<string | null>(
    null
  )

  const handleClientSelect = useCallback((client: ClientProgressData) => {
    setSelectedClient(client)
    // Could open a modal or navigate to client detail view
    console.log('Selected client:', client)
  }, [])

  const handleSendNotification = useCallback(
    async (client: ClientProgressData, type: string) => {
      setSendingNotification(`${client.id}_${type}`)

      try {
        const response = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            kitId: kitId,
            clientIdentifier: client.client_identifier,
            clientName: client.client_name,
            clientEmail: client.client_email || 'client@example.com',
            fromAdmin: true,
          }),
        })

        if (response.ok) {
          alert(
            `${type} notification sent successfully to ${client.client_name || 'client'}!`
          )
          setRefreshTrigger(prev => prev + 1) // Trigger refresh
        } else {
          alert('Failed to send notification. Please try again.')
        }
      } catch (error) {
        console.error('Failed to send notification:', error)
        alert('Failed to send notification. Please try again.')
      } finally {
        setSendingNotification(null)
      }
    },
    [kitId]
  )

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'clients' as const, label: 'Client Progress', icon: '👥' },
    { id: 'analytics' as const, label: 'Analytics', icon: '📈' },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor and manage your client onboarding process
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={handleRefresh} variant="outline">
            Refresh Data
          </Button>

          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Send Bulk Notification
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="p-1">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center space-x-2 rounded-lg px-4 py-3 font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Quick Actions
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Manage your clients efficiently
                    </p>
                  </div>
                  <div className="text-3xl">⚡</div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('clients')}
                  >
                    View All Clients
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab('analytics')}
                  >
                    View Analytics
                  </Button>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Client Support
                    </h3>
                    <p className="mt-1 text-sm text-green-700">
                      Help clients succeed
                    </p>
                  </div>
                  <div className="text-3xl">🤝</div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Send Reminders
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Custom Messages
                  </Button>
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">
                      Performance
                    </h3>
                    <p className="mt-1 text-sm text-purple-700">
                      Track your success
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Export Reports
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Kit Performance
                  </Button>
                </div>
              </Card>
            </div>

            {/* Mini Analytics Preview */}
            <AdminAnalyticsDashboard
              kitId={kitId}
              timeRange="7d"
              onTimeRangeChange={setTimeRange}
            />
          </div>
        )}

        {activeTab === 'clients' && (
          <ClientProgressTable
            kitId={kitId}
            onClientSelect={handleClientSelect}
            onSendNotification={handleSendNotification}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalyticsDashboard
            kitId={kitId}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}
      </div>

      {/* Client Detail Modal (if selected) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedClient.client_name || 'Unknown Client'}
                  </h3>
                  <p className="text-gray-600">{selectedClient.client_email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Kit
                    </label>
                    <p className="text-gray-900">{selectedClient.kit_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="capitalize text-gray-900">
                      {selectedClient.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Progress
                    </label>
                    <p className="text-gray-900">
                      {selectedClient.completed_steps} /{' '}
                      {selectedClient.total_steps} steps (
                      {selectedClient.completion_percentage}%)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Last Activity
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        selectedClient.last_activity
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedClient.current_step && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Current Step
                    </label>
                    <p className="text-gray-900">
                      {selectedClient.current_step}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSendNotification(selectedClient, 'reminder')
                    }
                    disabled={
                      sendingNotification === `${selectedClient.id}_reminder`
                    }
                  >
                    {sendingNotification === `${selectedClient.id}_reminder`
                      ? 'Sending...'
                      : 'Send Reminder'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleSendNotification(selectedClient, 'custom_message')
                    }
                    disabled={
                      sendingNotification ===
                      `${selectedClient.id}_custom_message`
                    }
                  >
                    {sendingNotification ===
                    `${selectedClient.id}_custom_message`
                      ? 'Sending...'
                      : 'Custom Message'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notification Status */}
      {sendingNotification && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg">
          Sending notification...
        </div>
      )}
    </div>
  )
}
