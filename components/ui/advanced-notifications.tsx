'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from './button'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: Date
  read?: boolean
  actions?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }[]
  avatar?: string
  category?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (id: string) => void
  onClearAll?: () => void
  className?: string
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  className
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'error' | 'warning' | 'info'>('all')

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.read
    return notification.type === filter
  })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'border-l-success-500 bg-success-50/50'
      case 'error': return 'border-l-error-500 bg-error-50/50'
      case 'warning': return 'border-l-warning-500 bg-warning-50/50'
      case 'info': return 'border-l-primary-500 bg-primary-50/50'
      default: return 'border-l-secondary-500 bg-secondary-50/50'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className={cn('relative', className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-strong z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="text-xs text-error-600"
                  >
                    Clear all
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1">
                {['all', 'unread', 'success', 'error', 'warning', 'info'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType as any)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-lg transition-colors capitalize',
                      filter === filterType
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="text-4xl mb-2">📭</div>
                  <p>No notifications</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border-l-4 border-b border-border/30 transition-all duration-200 hover:bg-muted/20',
                      getNotificationColor(notification.type),
                      !notification.read && 'bg-opacity-100'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {notification.avatar ? (
                          <img 
                            src={notification.avatar} 
                            alt="" 
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={cn(
                              'text-sm font-medium text-foreground',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {notification.category && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full">
                                {notification.category}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full ml-2" />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={action.onClick}
                                className="text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead?.(notification.id)}
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => onDelete?.(notification.id)}
                            className="text-xs text-error-600 hover:text-error-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Toast Notification Component
interface ToastProps {
  notification: Notification
  onClose: () => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function Toast({ notification, onClose, position = 'top-right' }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  return (
    <div className={cn(
      'fixed z-50 w-96 max-w-sm',
      positionClasses[position]
    )}>
      <div className={cn(
        'relative overflow-hidden rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md p-4 shadow-strong transition-all duration-300 animate-in slide-in-from-right',
        getNotificationColor(notification.type)
      )}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
              {getNotificationIcon(notification.type)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground">
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>

            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {notification.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-primary-500 animate-pulse" 
             style={{ 
               width: '100%',
               animation: 'shrink 5s linear forwards'
             }} 
        />
      </div>
    </div>
  )
}

// CSS for the shrinking animation
const style = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = style
  document.head.appendChild(styleSheet)
}