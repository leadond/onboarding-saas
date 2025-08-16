'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRealtimeProgress } from '../../hooks/use-realtime-progress'
import { cn } from '@/lib/utils/cn'

interface NotificationMessage {
  id: string
  type: 'progress' | 'completion' | 'stuck' | 'new_client' | 'info'
  title: string
  message: string
  timestamp: Date
  autoHide?: boolean
  duration?: number
}

interface RealtimeNotificationsProps {
  kitId?: string
  clientIdentifier?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxNotifications?: number
  enableSounds?: boolean
  className?: string
}

export function RealtimeNotifications({
  kitId,
  clientIdentifier,
  position = 'top-right',
  maxNotifications = 5,
  enableSounds = false,
  className,
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([])

  // Real-time progress hook with event handlers
  const { isConnected } = useRealtimeProgress({
    kitId,
    clientIdentifier,
    onProgressUpdate: useCallback((update: any) => {
      const notification: NotificationMessage = {
        id: `progress_${update.id}_${Date.now()}`,
        type: 'progress',
        title: 'Progress Update',
        message: `${update.client_name || 'A client'} ${update.completed ? 'completed' : 'started'} "${update.step_title}"`,
        timestamp: new Date(),
        autoHide: true,
        duration: 5000,
      }
      addNotification(notification)
    }, []),

    onClientComplete: useCallback(
      (client: any) => {
        const notification: NotificationMessage = {
          id: `complete_${client.client_identifier}_${Date.now()}`,
          type: 'completion',
          title: 'Client Completed! 🎉',
          message: `${client.client_name || 'A client'} finished their ${client.kit_name} onboarding`,
          timestamp: new Date(),
          autoHide: true,
          duration: 8000,
        }
        addNotification(notification)

        if (enableSounds) {
          // Play celebration sound
          playNotificationSound('success')
        }
      },
      [enableSounds]
    ),

    onClientStuck: useCallback(
      (client: any) => {
        const notification: NotificationMessage = {
          id: `stuck_${client.client_identifier}_${Date.now()}`,
          type: 'stuck',
          title: 'Client Needs Help',
          message: `${client.client_name || 'A client'} hasn't made progress in a while`,
          timestamp: new Date(),
          autoHide: false, // Don't auto-hide stuck notifications
        }
        addNotification(notification)

        if (enableSounds) {
          playNotificationSound('alert')
        }
      },
      [enableSounds]
    ),
  })

  const addNotification = useCallback(
    (notification: NotificationMessage) => {
      setNotifications(prev => {
        const newNotifications = [notification, ...prev]
        // Limit the number of notifications
        return newNotifications.slice(0, maxNotifications)
      })
    },
    [maxNotifications]
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Auto-hide notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    notifications.forEach(notification => {
      if (notification.autoHide && notification.duration) {
        const timer = setTimeout(() => {
          removeNotification(notification.id)
        }, notification.duration)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [notifications, removeNotification])

  // Play notification sounds
  const playNotificationSound = useCallback(
    (type: 'success' | 'alert' | 'info') => {
      // In a real app, you might use Web Audio API or audio files
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        try {
          const AudioContext =
            (window as any).AudioContext || (window as any).webkitAudioContext
          const audioContext = new AudioContext()

          // Create simple beep sounds
          const frequencies = {
            success: [523, 659, 783], // C5, E5, G5 (major chord)
            alert: [400, 400, 400], // Repeated low tone
            info: [523, 659], // C5, E5
          }

          frequencies[type].forEach((freq, index) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(
              freq,
              audioContext.currentTime + index * 0.15
            )
            oscillator.type = 'sine'

            gainNode.gain.setValueAtTime(
              0.1,
              audioContext.currentTime + index * 0.15
            )
            gainNode.gain.exponentialRampToValueAtTime(
              0.01,
              audioContext.currentTime + index * 0.15 + 0.1
            )

            oscillator.start(audioContext.currentTime + index * 0.15)
            oscillator.stop(audioContext.currentTime + index * 0.15 + 0.1)
          })
        } catch (error) {
          console.warn('Could not play notification sound:', error)
        }
      }
    },
    []
  )

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  // Notification type styling
  const getNotificationStyle = (type: NotificationMessage['type']) => {
    const styles = {
      progress: 'bg-blue-50 border-blue-200 text-blue-800',
      completion: 'bg-green-50 border-green-200 text-green-800',
      stuck: 'bg-red-50 border-red-200 text-red-800',
      new_client: 'bg-purple-50 border-purple-200 text-purple-800',
      info: 'bg-gray-50 border-gray-200 text-gray-800',
    }
    return styles[type]
  }

  const getNotificationIcon = (type: NotificationMessage['type']) => {
    const icons = {
      progress: '📈',
      completion: '🎉',
      stuck: '⚠️',
      new_client: '👋',
      info: 'ℹ️',
    }
    return icons[type]
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50 w-80 space-y-2',
        positionClasses[position],
        className
      )}
    >
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={cn(
            'pointer-events-auto transform transition-all duration-300 ease-out',
            'rounded-lg border bg-white p-4 shadow-lg',
            getNotificationStyle(notification.type),
            // Animation classes
            index === 0
              ? 'translate-x-0 opacity-100'
              : 'translate-x-2 opacity-95'
          )}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-lg">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{notification.title}</h4>
                  <p className="mt-1 text-xs opacity-90">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-xs opacity-75">
                    {notification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="ml-2 text-gray-400 transition-colors hover:text-gray-600"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Auto-hide progress bar */}
          {notification.autoHide && notification.duration && (
            <div className="mt-2 h-1 w-full rounded-full bg-gray-200">
              <div
                className="linear h-1 rounded-full bg-current transition-all"
                style={{
                  animation: `shrink ${notification.duration}ms linear`,
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Connection Status Indicator */}
      <div
        className={cn(
          'rounded border bg-white px-2 py-1 text-xs text-gray-500 shadow-sm',
          isConnected ? 'text-green-600' : 'text-red-600'
        )}
      >
        <span
          className={cn(
            'mr-2 inline-block h-2 w-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          )}
        ></span>
        {isConnected ? 'Live updates active' : 'Connection lost'}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

export default RealtimeNotifications
