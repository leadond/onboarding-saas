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

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Filter,
  Archive,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface AdvancedNotification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  timestamp: Date
  read: boolean
  archived: boolean
  actionable: boolean
  actions?: NotificationAction[]
  metadata?: Record<string, any>
  expiresAt?: Date
  category?: string
  source?: string
}

export interface NotificationAction {
  id: string
  label: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  onClick: () => void | Promise<void>
}

interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  categories: Record<string, boolean>
  priorities: Record<NotificationPriority, boolean>
}

interface AdvancedNotificationsProps {
  notifications: AdvancedNotification[]
  onNotificationRead?: (id: string) => void
  onNotificationArchive?: (id: string) => void
  onNotificationDelete?: (id: string) => void
  onMarkAllRead?: () => void
  onClearAll?: () => void
  settings?: NotificationSettings
  onSettingsChange?: (settings: NotificationSettings) => void
  maxDisplayed?: number
  autoMarkReadDelay?: number
  groupByCategory?: boolean
  showFilters?: boolean
}

const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return 'text-green-600 bg-green-50 border-green-200'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200'
    case 'system':
      return 'text-purple-600 bg-purple-50 border-purple-200'
    default:
      return 'text-blue-600 bg-blue-50 border-blue-200'
  }
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'warning':
      return AlertTriangle
    case 'error':
      return XCircle
    case 'system':
      return Settings
    default:
      return Info
  }
}

const getPriorityBadgeVariant = (priority: NotificationPriority) => {
  switch (priority) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'default'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function AdvancedNotifications({
  notifications,
  onNotificationRead,
  onNotificationArchive,
  onNotificationDelete,
  onMarkAllRead,
  onClearAll,
  settings,
  onSettingsChange,
  maxDisplayed = 50,
  autoMarkReadDelay = 3000,
  groupByCategory = false,
  showFilters = true
}: AdvancedNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all')
  const [showSettings, setShowSettings] = useState(false)

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false
    if (filter === 'archived' && !notification.archived) return false
    if (filter !== 'archived' && notification.archived) return false
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false
    return true
  }).slice(0, maxDisplayed)

  // Group notifications by category if enabled
  const groupedNotifications = groupByCategory
    ? filteredNotifications.reduce((groups, notification) => {
        const category = notification.category || 'General'
        if (!groups[category]) groups[category] = []
        groups[category].push(notification)
        return groups
      }, {} as Record<string, AdvancedNotification[]>)
    : { 'All': filteredNotifications }

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read && !n.archived).length

  // Get unique categories for filter
  const categories = Array.from(new Set(notifications.map(n => n.category).filter(Boolean)))

  // Auto-mark as read after delay
  useEffect(() => {
    if (!isOpen || !autoMarkReadDelay) return

    const timer = setTimeout(() => {
      const unreadVisible = filteredNotifications.filter(n => !n.read)
      unreadVisible.forEach(notification => {
        onNotificationRead?.(notification.id)
      })
    }, autoMarkReadDelay)

    return () => clearTimeout(timer)
  }, [isOpen, filteredNotifications, autoMarkReadDelay, onNotificationRead])

  const handleNotificationAction = useCallback(async (action: NotificationAction) => {
    try {
      await action.onClick()
    } catch (error) {
      console.error('Error executing notification action:', error)
    }
  }, [])

  const NotificationItem = ({ notification }: { notification: AdvancedNotification }) => {
    const Icon = getNotificationIcon(notification.type)
    const colorClasses = getNotificationColor(notification.type)

    return (
      <div
        className={cn(
          'p-4 border rounded-lg transition-all duration-200 hover:shadow-md',
          colorClasses,
          !notification.read && 'ring-2 ring-blue-200'
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{notification.title}</h4>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Badge variant={getPriorityBadgeVariant(notification.priority)} className="text-xs">
                  {notification.priority}
                </Badge>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </div>
            
            <p className="text-sm opacity-90 mb-2">{notification.message}</p>
            
            <div className="flex items-center justify-between text-xs opacity-75">
              <span>{notification.timestamp.toLocaleString()}</span>
              {notification.source && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded">
                  {notification.source}
                </span>
              )}
            </div>

            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {notification.actions.map(action => (
                  <Button
                    key={action.id}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={() => handleNotificationAction(action)}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {!notification.read && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNotificationRead?.(notification.id)}
                className="h-6 w-6 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNotificationArchive?.(notification.id)}
              className="h-6 w-6 p-0"
            >
              <Archive className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onNotificationDelete?.(notification.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-[600px] shadow-lg z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="flex gap-2 mt-3">
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={onMarkAllRead}>
                Mark All Read
              </Button>
              <Button size="sm" variant="outline" onClick={onClearAll}>
                Clear All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-3">
                {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => (
                  <div key={category}>
                    {groupByCategory && Object.keys(groupedNotifications).length > 1 && (
                      <>
                        <h5 className="font-medium text-sm text-gray-600 mb-2">{category}</h5>
                        <Separator className="mb-3" />
                      </>
                    )}
                    
                    {categoryNotifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {categoryNotifications.map(notification => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}