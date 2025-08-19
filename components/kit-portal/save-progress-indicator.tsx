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

import { useState, useEffect } from 'react'
import { Check, Save, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline'

interface SaveProgressIndicatorProps {
  status: SaveStatus
  lastSaved?: Date
  error?: string
  className?: string
  showLastSaved?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

export function SaveProgressIndicator({
  status,
  lastSaved,
  error,
  className,
  showLastSaved = true,
  autoHide = true,
  autoHideDelay = 3000,
}: SaveProgressIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeAgo, setTimeAgo] = useState<string>('')

  // Show/hide logic
  useEffect(() => {
    if (status === 'saving' || status === 'error') {
      setIsVisible(true)
    } else if (status === 'saved' && autoHide) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, autoHideDelay)
      return () => clearTimeout(timer)
    } else if (status === 'saved') {
      setIsVisible(true)
    } else if (status === 'offline') {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
    return undefined
  }, [status, autoHide, autoHideDelay])

  // Update time ago
  useEffect(() => {
    if (!lastSaved) return

    const updateTimeAgo = () => {
      const now = new Date()
      const diff = now.getTime() - lastSaved.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (seconds < 30) {
        setTimeAgo('just now')
      } else if (seconds < 60) {
        setTimeAgo(`${seconds} seconds ago`)
      } else if (minutes < 60) {
        setTimeAgo(`${minutes} minute${minutes !== 1 ? 's' : ''} ago`)
      } else {
        setTimeAgo(`${hours} hour${hours !== 1 ? 's' : ''} ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [lastSaved])

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: Save,
          text: 'Saving...',
          className: 'text-blue-600 bg-blue-50 border-blue-200',
          iconClassName: 'animate-pulse',
        }
      case 'saved':
        return {
          icon: Check,
          text: 'Saved',
          className: 'text-green-600 bg-green-50 border-green-200',
          iconClassName: '',
        }
      case 'error':
        return {
          icon: AlertCircle,
          text: error || 'Save failed',
          className: 'text-red-600 bg-red-50 border-red-200',
          iconClassName: '',
        }
      case 'offline':
        return {
          icon: WifiOff,
          text: 'Offline',
          className: 'text-orange-600 bg-orange-50 border-orange-200',
          iconClassName: '',
        }
      default:
        return {
          icon: Save,
          text: 'Auto-save enabled',
          className: 'text-gray-600 bg-gray-50 border-gray-200',
          iconClassName: '',
        }
    }
  }

  if (!isVisible && status === 'idle') return null

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div
      className={cn(
        'flex items-center space-x-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out',
        config.className,
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
        className
      )}
    >
      <IconComponent className={cn('h-4 w-4', config.iconClassName)} />
      <span>{config.text}</span>
      {showLastSaved && lastSaved && status === 'saved' && (
        <span className="text-xs opacity-75">• {timeAgo}</span>
      )}
    </div>
  )
}

interface AutoSaveIndicatorProps {
  isOnline?: boolean
  className?: string
}

export function AutoSaveIndicator({
  isOnline = true,
  className,
}: AutoSaveIndicatorProps) {
  return (
    <div
      className={cn(
        'flex items-center space-x-2 text-xs text-gray-500',
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span>Auto-save enabled</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 text-orange-500" />
          <span className="text-orange-600">
            Offline - changes saved locally
          </span>
        </>
      )}
    </div>
  )
}

interface SaveIndicatorHookReturn {
  status: SaveStatus
  showSaving: () => void
  showSaved: (date?: Date) => void
  showError: (errorMessage?: string) => void
  showOffline: () => void
  reset: () => void
}

export function useSaveIndicator(): SaveIndicatorHookReturn {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | undefined>()

  const showSaving = () => {
    setStatus('saving')
    setError(undefined)
  }

  const showSaved = (date?: Date) => {
    setStatus('saved')
    setError(undefined)
  }

  const showError = (errorMessage?: string) => {
    setStatus('error')
    setError(errorMessage)
  }

  const showOffline = () => {
    setStatus('offline')
    setError(undefined)
  }

  const reset = () => {
    setStatus('idle')
    setError(undefined)
  }

  return {
    status,
    showSaving,
    showSaved,
    showError,
    showOffline,
    reset,
  }
}

// Floating save indicator that can be positioned anywhere
interface FloatingSaveIndicatorProps extends SaveProgressIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function FloatingSaveIndicator({
  position = 'bottom-right',
  className,
  ...props
}: FloatingSaveIndicatorProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-50',
        positionClasses[position]
      )}
    >
      <SaveProgressIndicator
        className={cn('shadow-lg', className)}
        {...props}
      />
    </div>
  )
}

// Inline save indicator for forms and input fields
interface InlineSaveIndicatorProps {
  status: SaveStatus
  lastSaved?: Date
  error?: string
  size?: 'sm' | 'md'
  className?: string
}

export function InlineSaveIndicator({
  status,
  lastSaved,
  error,
  size = 'sm',
  className,
}: InlineSaveIndicatorProps) {
  const config = {
    saving: { icon: Save, text: 'Saving...', color: 'text-blue-500' },
    saved: { icon: Check, text: 'Saved', color: 'text-green-500' },
    error: { icon: AlertCircle, text: 'Error', color: 'text-red-500' },
    offline: { icon: WifiOff, text: 'Offline', color: 'text-orange-500' },
    idle: { icon: null, text: '', color: '' },
  }

  const statusConfig = config[status]
  if (!statusConfig.icon || status === 'idle') return null

  const IconComponent = statusConfig.icon
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div
      className={cn(
        'flex items-center space-x-1',
        statusConfig.color,
        className
      )}
    >
      <IconComponent
        className={cn(iconSize, status === 'saving' && 'animate-pulse')}
      />
      <span className={textSize}>{statusConfig.text}</span>
    </div>
  )
}
