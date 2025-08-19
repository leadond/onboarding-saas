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

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RealtimeProgressIndicator } from './realtime-progress-indicator'
import { RealtimeNotifications } from './realtime-notifications'
import { cn } from '@/lib/utils/cn'

interface RealtimeIntegrationExampleProps {
  kitId?: string
  clientIdentifier?: string
  className?: string
}

/**
 * Example component showing how to integrate all real-time features
 * This demonstrates the complete real-time experience for Onboard Hero
 */
export function RealtimeIntegrationExample({
  kitId,
  clientIdentifier,
  className,
}: RealtimeIntegrationExampleProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundsEnabled, setSoundsEnabled] = useState(false)
  const [indicatorVariant, setIndicatorVariant] = useState<
    'compact' | 'detailed' | 'minimal'
  >('detailed')

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Real-time Progress Experience
            </h2>
            <p className="text-sm text-gray-600">
              Live updates powered by Supabase real-time subscriptions
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={e => setNotificationsEnabled(e.target.checked)}
                className="rounded"
              />
              <span>Notifications</span>
            </label>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={soundsEnabled}
                onChange={e => setSoundsEnabled(e.target.checked)}
                className="rounded"
              />
              <span>Sounds</span>
            </label>
          </div>
        </div>

        {/* Variant Selector */}
        <div className="mb-4 flex space-x-2">
          <span className="text-sm text-gray-600">Display:</span>
          {(['minimal', 'compact', 'detailed'] as const).map(variant => (
            <Button
              key={variant}
              size="sm"
              variant={indicatorVariant === variant ? 'default' : 'outline'}
              onClick={() => setIndicatorVariant(variant)}
              className="capitalize"
            >
              {variant}
            </Button>
          ))}
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Live Progress Updates',
              description: 'See client progress changes in real-time',
              icon: '📈',
              status: 'active',
            },
            {
              title: 'Completion Celebrations',
              description: 'Instant notifications when clients finish',
              icon: '🎉',
              status: 'active',
            },
            {
              title: 'Client Support Alerts',
              description: 'Get notified when clients need help',
              icon: '🚨',
              status: 'active',
            },
            {
              title: 'Connection Status',
              description: 'Real-time connection monitoring',
              icon: '🔗',
              status: 'active',
            },
            {
              title: 'Sound Notifications',
              description: 'Audio alerts for important events',
              icon: '🔊',
              status: soundsEnabled ? 'active' : 'inactive',
            },
            {
              title: 'Toast Messages',
              description: 'Non-intrusive progress updates',
              icon: '💬',
              status: notificationsEnabled ? 'active' : 'inactive',
            },
          ].map((feature, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-3">
              <div className="mb-1 flex items-center space-x-2">
                <span className="text-lg">{feature.icon}</span>
                <span className="text-sm font-medium">{feature.title}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    feature.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {feature.status}
                </span>
              </div>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-time Progress Indicator */}
      <RealtimeProgressIndicator
        kitId={kitId}
        clientIdentifier={clientIdentifier}
        variant={indicatorVariant}
        showConnectionStatus={true}
        autoRefresh={true}
      />

      {/* Demo Actions */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Real-time Features Demo
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">For Clients</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Live progress tracking</li>
              <li>• Instant step completion feedback</li>
              <li>• Session recovery across devices</li>
              <li>• Progress synchronization</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">For Agencies</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Real-time client monitoring</li>
              <li>• Instant completion alerts</li>
              <li>• Stuck client notifications</li>
              <li>• Live dashboard updates</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Technical</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Supabase real-time subscriptions</li>
              <li>• WebSocket connections</li>
              <li>• Connection resilience</li>
              <li>• Optimistic updates</li>
            </ul>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-6 overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
          {/* Usage Example: */}
          <div className="mb-2 text-gray-400">Usage Example:</div>
          <div className="space-y-1">
            <div>
              <span className="text-blue-400">import</span>{' '}
              {`{ useRealtimeProgress }`}{' '}
              <span className="text-blue-400">from</span>{' '}
              <span className="text-yellow-400">
                &apos;@/hooks/use-realtime-progress&apos;
              </span>
            </div>
            <div className="mt-2">
              <span className="text-blue-400">const</span>{' '}
              {`{ isConnected, clientSummaries, recentUpdates }`} ={' '}
              <span className="text-purple-400">useRealtimeProgress</span>({`{`}
            </div>
            <div className="ml-4">
              kitId:{' '}
              <span className="text-yellow-400">
                &apos;{kitId || `your-kit-id`}&apos;
              </span>
              ,
            </div>
            <div className="ml-4">
              onProgressUpdate: <span className="text-blue-400">(update)</span>{' '}
              {`=> `}
              <span className="text-purple-400">console</span>.
              <span className="text-green-400">log</span>(
              <span className="text-yellow-400">&apos;Live update!&apos;</span>, update),
            </div>
            <div className="ml-4">
              onClientComplete: <span className="text-blue-400">(client)</span>{' '}
              {`=> `}
              <span className="text-purple-400">celebrate</span>(client)
            </div>
            <div>{`})`}</div>
          </div>
        </div>
      </Card>

      {/* Real-time Notifications */}
      {notificationsEnabled && (
        <RealtimeNotifications
          kitId={kitId}
          clientIdentifier={clientIdentifier}
          position="top-right"
          enableSounds={soundsEnabled}
          maxNotifications={5}
        />
      )}
    </div>
  )
}

export default RealtimeIntegrationExample
