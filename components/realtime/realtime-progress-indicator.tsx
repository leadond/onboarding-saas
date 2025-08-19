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

import React from 'react'
import { useRealtimeProgress } from '../../hooks/use-realtime-progress'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface RealtimeProgressIndicatorProps {
  kitId?: string
  clientIdentifier?: string
  className?: string
  variant?: 'compact' | 'detailed' | 'minimal'
  showConnectionStatus?: boolean
  autoRefresh?: boolean
}

export function RealtimeProgressIndicator({
  kitId,
  clientIdentifier,
  className,
  variant = 'detailed',
  showConnectionStatus = true,
  autoRefresh = true,
}: RealtimeProgressIndicatorProps) {
  const {
    isConnected,
    lastUpdate,
    error,
    totalClients,
    activeClients,
    completedClients,
    stuckClients,
    recentUpdates,
    clientSummaries,
    refresh,
  } = useRealtimeProgress({
    kitId,
    clientIdentifier,
    enabled: autoRefresh,
    onProgressUpdate: (update: any) => {
      console.log('Progress update received:', update)
      // Could show toast notification here
    },
    onClientComplete: (client: any) => {
      console.log('Client completed:', client)
      // Could show celebration notification
    },
    onClientStuck: (client: any) => {
      console.log('Client needs help:', client)
      // Could show warning notification
    },
  })

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )}
        ></div>
        <span className="text-xs text-gray-600">
          {isConnected ? 'Live' : 'Offline'}
        </span>
        {lastUpdate && (
          <span className="text-xs text-gray-500">
            Updated {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'
              )}
            ></div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {totalClients} Client{totalClients !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-500">
                {activeClients} active, {completedClients} completed
              </div>
            </div>
          </div>

          {showConnectionStatus && (
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
              {lastUpdate && (
                <div className="text-xs text-gray-400">
                  {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-600">
            {error}
          </div>
        )}
      </Card>
    )
  }

  // Default detailed variant
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'h-4 w-4 rounded-full',
                isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'
              )}
            ></div>
            <h3 className="text-lg font-semibold text-gray-900">
              Live Progress Monitor
            </h3>
          </div>

          <button
            onClick={refresh}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>

        {/* Connection Status */}
        {showConnectionStatus && (
          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(isConnected ? 'text-green-600' : 'text-red-600')}
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            {lastUpdate && (
              <span className="text-gray-500">
                Last update: {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <strong>Connection Error:</strong> {error}
          </div>
        )}

        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: 'Total',
              value: totalClients,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
            },
            {
              label: 'Active',
              value: activeClients,
              color: 'text-green-600',
              bgColor: 'bg-green-50',
            },
            {
              label: 'Completed',
              value: completedClients,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
            },
            {
              label: 'Need Help',
              value: stuckClients,
              color: 'text-red-600',
              bgColor: 'bg-red-50',
            },
          ].map((stat, index) => (
            <div
              key={index}
              className={cn('rounded-lg p-3 text-center', stat.bgColor)}
            >
              <div className={cn('text-2xl font-bold', stat.color)}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        {recentUpdates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Recent Activity
            </h4>
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {recentUpdates.slice(0, 5).map((update: any, index: number) => (
                <div
                  key={update.id || index}
                  className="flex items-center space-x-2 text-xs"
                >
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      update.completed ? 'bg-green-500' : 'bg-blue-500'
                    )}
                  ></div>
                  <span className="text-gray-600">
                    {update.client_name || 'Client'}{' '}
                    {update.completed ? 'completed' : 'started'} &quot;
                    {update.step_title}&quot;
                  </span>
                  <span className="text-gray-400">
                    {new Date(update.updated_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client Status Overview */}
        {clientIdentifier && clientSummaries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Your Progress</h4>
            {clientSummaries
              .filter((c: any) => c.client_identifier === clientIdentifier)
              .map((client: any, index: number) => (
                <div key={index} className="rounded-lg bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {client.kit_name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {client.completion_percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        client.completion_percentage === 100
                          ? 'bg-green-500'
                          : client.completion_percentage >= 75
                            ? 'bg-blue-500'
                            : client.completion_percentage >= 50
                              ? 'bg-yellow-500'
                              : client.completion_percentage > 0
                                ? 'bg-orange-500'
                                : 'bg-gray-300'
                      )}
                      style={{ width: `${client.completion_percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>
                      {client.completed_steps} / {client.total_steps} steps
                    </span>
                    <span className="capitalize">
                      {client.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* No Data State */}
        {totalClients === 0 && !error && (
          <div className="py-6 text-center text-gray-500">
            <div className="mb-2 text-4xl">📊</div>
            <div className="text-sm">No progress data available</div>
            <div className="mt-1 text-xs text-gray-400">
              Progress updates will appear here in real-time
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default RealtimeProgressIndicator
