'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface NotificationPreferences {
  id?: string
  client_identifier: string
  email_notifications: boolean
  welcome_emails: boolean
  step_completion_emails: boolean
  reminder_emails: boolean
  completion_emails: boolean
  admin_notifications: boolean
  custom_messages: boolean
  email_frequency: 'immediate' | 'daily' | 'weekly'
  quiet_hours_start?: string
  quiet_hours_end?: string
  timezone?: string
}

interface NotificationPreferencesProps {
  clientIdentifier: string
  kitId: string
  initialPreferences?: Partial<NotificationPreferences>
  onPreferencesChange?: (preferences: NotificationPreferences) => void
}

export function NotificationPreferences({
  clientIdentifier,
  kitId,
  initialPreferences = {},
  onPreferencesChange,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    client_identifier: clientIdentifier,
    email_notifications: true,
    welcome_emails: true,
    step_completion_emails: true,
    reminder_emails: true,
    completion_emails: true,
    admin_notifications: true,
    custom_messages: true,
    email_frequency: 'immediate',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ...initialPreferences,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [testEmailSending, setTestEmailSending] = useState(false)

  const supabase = createClient()

  // Load existing preferences on mount
  useEffect(() => {
    loadPreferences()
  }, [clientIdentifier])

  async function loadPreferences() {
    if (!clientIdentifier) return

    setIsLoading(true)
    try {
      // For now, use localStorage as a simple preference store
      // In production, this would be stored in the database
      const stored = localStorage.getItem(
        `notification_preferences_${clientIdentifier}`
      )
      if (stored) {
        const parsedPrefs = JSON.parse(stored)
        setPreferences(prev => ({
          ...prev,
          ...parsedPrefs,
        }))
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function savePreferences() {
    setIsSaving(true)
    setMessage(null)

    try {
      // For now, save to localStorage
      // In production, this would save to the database
      localStorage.setItem(
        `notification_preferences_${clientIdentifier}`,
        JSON.stringify(preferences)
      )

      setMessage({
        type: 'success',
        text: 'Notification preferences saved successfully!',
      })
      onPreferencesChange?.(preferences)

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setMessage({
        type: 'error',
        text: 'Failed to save preferences. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function sendTestEmail() {
    setTestEmailSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom_message',
          kitId,
          clientIdentifier,
          clientName: 'Test Client',
          clientEmail: 'test@example.com', // In production, get from client data
          customSubject: 'Test Email - OnboardKit Notifications',
          customMessage:
            'This is a test email to verify your notification preferences are working correctly. If you received this, your notifications are set up properly!',
          fromAdmin: false,
        }),
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Test email sent successfully! Check your inbox.',
        })
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to send test email. Please try again.',
        })
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      setMessage({
        type: 'error',
        text: 'Failed to send test email. Please try again.',
      })
    } finally {
      setTestEmailSending(false)
    }
  }

  function updatePreference<K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading preferences...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Notification Preferences
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage how and when you receive notifications about your onboarding
            progress.
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`rounded-lg p-4 ${
              message.type === 'success'
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <div className="h-5 w-5 text-green-400">✓</div>
                ) : (
                  <div className="h-5 w-5 text-red-400">✕</div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Master Email Toggle */}
        <div className="flex items-center justify-between border-b border-gray-200 py-3">
          <div>
            <label className="text-base font-medium text-gray-900">
              Email Notifications
            </label>
            <p className="text-sm text-gray-600">
              Enable or disable all email notifications
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="sr-only"
              checked={preferences.email_notifications}
              onChange={e =>
                updatePreference('email_notifications', e.target.checked)
              }
            />
            <div
              className={`h-6 w-11 rounded-full transition-colors ${
                preferences.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  preferences.email_notifications
                    ? 'translate-x-5'
                    : 'translate-x-0'
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Individual Email Types */}
        {preferences.email_notifications && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Email Types</h4>

            {[
              {
                key: 'welcome_emails' as const,
                label: 'Welcome Emails',
                description:
                  'Initial welcome message when you start onboarding',
              },
              {
                key: 'step_completion_emails' as const,
                label: 'Step Completion',
                description: 'Confirmation when you complete each step',
              },
              {
                key: 'reminder_emails' as const,
                label: 'Reminder Emails',
                description: 'Gentle reminders to continue your progress',
              },
              {
                key: 'completion_emails' as const,
                label: 'Completion Celebration',
                description: 'Celebration email when you finish all steps',
              },
              {
                key: 'admin_notifications' as const,
                label: 'Admin Messages',
                description: 'Important messages from your onboarding team',
              },
              {
                key: 'custom_messages' as const,
                label: 'Custom Messages',
                description: 'Personalized messages and updates',
              },
            ].map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                <label className="relative ml-4 inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={preferences[key]}
                    onChange={e => updatePreference(key, e.target.checked)}
                  />
                  <div
                    className={`h-5 w-9 rounded-full transition-colors ${
                      preferences[key] ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        preferences[key] ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Email Frequency */}
        {preferences.email_notifications && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Email Frequency
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={preferences.email_frequency}
              onChange={e =>
                updatePreference('email_frequency', e.target.value as any)
              }
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
        )}

        {/* Quiet Hours */}
        {preferences.email_notifications && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Quiet Hours (No notifications during this time)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">From</label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_start || ''}
                  onChange={e =>
                    updatePreference('quiet_hours_start', e.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">To</label>
                <Input
                  type="time"
                  value={preferences.quiet_hours_end || ''}
                  onChange={e =>
                    updatePreference('quiet_hours_end', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Timezone */}
        {preferences.email_notifications && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <Input
              type="text"
              value={preferences.timezone || ''}
              onChange={e => updatePreference('timezone', e.target.value)}
              placeholder="e.g., America/New_York"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
          <Button
            onClick={savePreferences}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>

          <Button
            variant="outline"
            onClick={sendTestEmail}
            disabled={testEmailSending || !preferences.email_notifications}
            className="flex-1"
          >
            {testEmailSending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p>
            <strong>Note:</strong> Changes take effect immediately. You can
            update these preferences at any time. Test emails help verify your
            settings are working correctly.
          </p>
        </div>
      </div>
    </Card>
  )
}
