'use client'

import { useState, useEffect, useCallback } from 'react'
import { pwaManager, NotificationPayload, OfflineQueueItem } from '@/lib/pwa/pwa-utils'

export interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  isOnline: boolean
  hasUpdate: boolean
  notificationPermission: NotificationPermission
  offlineQueue: {
    pending: number
    failed: number
  }
  cacheSize: number
}

export interface PWAActions {
  install: () => Promise<boolean>
  updateApp: () => Promise<void>
  requestNotifications: () => Promise<NotificationPermission>
  subscribeToPush: () => Promise<PushSubscription | null>
  unsubscribeFromPush: () => Promise<boolean>
  showNotification: (payload: NotificationPayload) => Promise<void>
  addToOfflineQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) => void
  clearOfflineQueue: () => void
  clearCache: () => Promise<void>
  refreshCacheSize: () => Promise<void>
}

export function usePWA(): PWAState & PWAActions {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: true,
    hasUpdate: false,
    notificationPermission: 'default',
    offlineQueue: { pending: 0, failed: 0 },
    cacheSize: 0
  })

  // Initialize PWA state
  useEffect(() => {
    const updateState = () => {
      setState(prev => ({
        ...prev,
        isInstalled: pwaManager.isInstalled(),
        isOnline: pwaManager.isOnlineStatus(),
        notificationPermission: 'Notification' in window ? Notification.permission : 'denied',
        offlineQueue: { pending: 0, failed: 0 }
      }))
    }

    updateState()

    // Set up event listeners
    const handleInstallable = () => {
      setState(prev => ({ ...prev, canInstall: true }))
    }

    const handleInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, canInstall: false }))
    }

    const handleConnectionChange = (event: CustomEvent) => {
      setState(prev => ({ ...prev, isOnline: event.detail.online }))
    }

    const handleUpdateAvailable = () => {
      setState(prev => ({ ...prev, hasUpdate: true }))
    }

    const handleOfflineSyncSuccess = () => {
      setState(prev => ({ ...prev, offlineQueue: { pending: 0, failed: 0 } }))
    }

    const handleOfflineSyncFailed = () => {
      setState(prev => ({ ...prev, offlineQueue: { pending: 0, failed: 0 } }))
    }

    // Add event listeners
    window.addEventListener('pwa-installable', handleInstallable as EventListener)
    window.addEventListener('pwa-installed', handleInstalled as EventListener)
    window.addEventListener('pwa-connection-changed', handleConnectionChange as EventListener)
    window.addEventListener('pwa-sw-update-available', handleUpdateAvailable as EventListener)
    window.addEventListener('pwa-offline-sync-success', handleOfflineSyncSuccess as EventListener)
    window.addEventListener('pwa-offline-sync-failed', handleOfflineSyncFailed as EventListener)

    // Initial cache size calculation
    pwaManager.getCacheSize().then(size => {
      setState(prev => ({ ...prev, cacheSize: size }))
    })

    // Cleanup
    return () => {
      window.removeEventListener('pwa-installable', handleInstallable as EventListener)
      window.removeEventListener('pwa-installed', handleInstalled as EventListener)
      window.removeEventListener('pwa-connection-changed', handleConnectionChange as EventListener)
      window.removeEventListener('pwa-sw-update-available', handleUpdateAvailable as EventListener)
      window.removeEventListener('pwa-offline-sync-success', handleOfflineSyncSuccess as EventListener)
      window.removeEventListener('pwa-offline-sync-failed', handleOfflineSyncFailed as EventListener)
    }
  }, [])

  // Actions
  const install = useCallback(async () => {
    const result = await pwaManager.install()
    setState(prev => ({ 
      ...prev, 
      canInstall: false,
      isInstalled: result === true
    }))
    return result
  }, [])

  const updateApp = useCallback(async () => {
    await pwaManager.updateServiceWorker()
    setState(prev => ({ ...prev, hasUpdate: false }))
  }, [])

  const requestNotifications = useCallback(async () => {
    const permission = await pwaManager.requestNotificationPermission()
    setState(prev => ({ ...prev, notificationPermission: permission }))
    return permission
  }, [])

  const subscribeToPush = useCallback(async () => {
    return await pwaManager.subscribeToPushNotifications()
  }, [])

  const unsubscribeFromPush = useCallback(async () => {
    return await pwaManager.unsubscribeFromPushNotifications()
  }, [])

  const showNotification = useCallback(async (payload: NotificationPayload) => {
    return await pwaManager.showNotification(payload)
  }, [])

  const addToOfflineQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) => {
    pwaManager.addToOfflineQueue({ ...item, id: Date.now().toString(), timestamp: Date.now() })
    setState(prev => ({ ...prev, offlineQueue: { pending: 0, failed: 0 } }))
  }, [])

  const clearOfflineQueue = useCallback(() => {
    pwaManager.clearOfflineQueue()
    setState(prev => ({ ...prev, offlineQueue: { pending: 0, failed: 0 } }))
  }, [])

  const clearCache = useCallback(async () => {
    await pwaManager.clearCache()
    setState(prev => ({ ...prev, cacheSize: 0 }))
  }, [])

  const refreshCacheSize = useCallback(async () => {
    const size = await pwaManager.getCacheSize()
    setState(prev => ({ ...prev, cacheSize: size }))
  }, [])

  return {
    ...state,
    install,
    updateApp,
    requestNotifications,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification,
    addToOfflineQueue,
    clearOfflineQueue,
    clearCache,
    refreshCacheSize
  }
}

// Hook for online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    const handleConnectionChange = (event: CustomEvent) => {
      setIsOnline(event.detail.online)
    }

    // Initial status
    updateOnlineStatus()

    // Listen for browser online/offline events
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Listen for PWA connection events
    window.addEventListener('pwa-connection-changed', handleConnectionChange as EventListener)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      window.removeEventListener('pwa-connection-changed', handleConnectionChange as EventListener)
    }
  }, [])

  return isOnline
}

// Hook for PWA installation prompt
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const updateInstallState = () => {
      setIsInstalled(pwaManager.isInstalled())
    }

    const handleInstallable = () => {
      setCanInstall(true)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }

    // Initial state
    updateInstallState()
    pwaManager.canInstall().then(setCanInstall)

    // Event listeners
    window.addEventListener('pwa-installable', handleInstallable as EventListener)
    window.addEventListener('pwa-installed', handleInstalled as EventListener)

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable as EventListener)
      window.removeEventListener('pwa-installed', handleInstalled as EventListener)
    }
  }, [])

  const install = useCallback(async () => {
    if (!canInstall) return { outcome: 'dismissed' as const }
    
    const result = await pwaManager.install()
    if (typeof result === 'object' && result === true) {
      setIsInstalled(true)
      setCanInstall(false)
    }
    return result
  }, [canInstall])

  return {
    canInstall,
    isInstalled,
    install
  }
}

// Hook for push notifications
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Check for existing subscription
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(setSubscription)
      })
    }
  }, [])

  const requestPermission = useCallback(async () => {
    const result = await pwaManager.requestNotificationPermission()
    setPermission(result)
    return result
  }, [])

  const subscribe = useCallback(async () => {
    const sub = await pwaManager.subscribeToPushNotifications()
    setSubscription(sub)
    return sub
  }, [])

  const unsubscribe = useCallback(async () => {
    const result = await pwaManager.unsubscribeFromPushNotifications()
    if (result) {
      setSubscription(null)
    }
    return result
  }, [])

  const showNotification = useCallback(async (payload: NotificationPayload) => {
    return await pwaManager.showNotification(payload)
  }, [])

  return {
    permission,
    subscription,
    isSubscribed: subscription !== null,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification
  }
}