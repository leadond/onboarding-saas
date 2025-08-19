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

// PWA Utilities with proper TypeScript types

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: any
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export interface OfflineQueueItem {
  id: string
  url: string
  method: string
  body?: any
  timestamp: number
}

export class PWAUtils {
  private static instance: PWAUtils
  private swRegistration: ServiceWorkerRegistration | null = null

  private constructor() {}

  static getInstance(): PWAUtils {
    if (!PWAUtils.instance) {
      PWAUtils.instance = new PWAUtils()
    }
    return PWAUtils.instance
  }

  // Check if PWA is supported
  isPWASupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isPWASupported()) {
      console.warn('PWA features not supported in this browser')
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      this.swRegistration = registration
      console.log('Service Worker registered successfully')
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Subscribe to push notifications
  async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered')
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as any,
      })

      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  // Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Show notification
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered')
    }

    const options: NotificationOptions & { actions?: any } = {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      data: payload.data,
    }

    // Add actions if supported
    if (payload.actions && 'actions' in Notification.prototype) {
      options.actions = payload.actions
    }

    await this.swRegistration.showNotification(payload.title, options)
  }

  // Check if app is installed
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  // Install prompt
  async showInstallPrompt(): Promise<boolean> {
    const deferredPrompt = (window as any).deferredPrompt
    if (!deferredPrompt) {
      return false
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    ;(window as any).deferredPrompt = null
    
    return outcome === 'accepted'
  }

  // Additional methods for PWA hook compatibility
  isOnlineStatus(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  getOfflineQueueStatus(): OfflineQueueItem[] {
    // Mock offline queue - in real implementation, this would use IndexedDB
    return []
  }

  async getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0
    
    try {
      const cacheNames = await caches.keys()
      let totalSize = 0
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        totalSize += requests.length
      }
      
      return totalSize
    } catch (error) {
      console.error('Error calculating cache size:', error)
      return 0
    }
  }

  async install(): Promise<boolean> {
    return this.showInstallPrompt()
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) return
    
    try {
      await this.swRegistration.update()
      console.log('Service Worker updated')
    } catch (error) {
      console.error('Service Worker update failed:', error)
    }
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'mock-vapid-key'
    return this.subscribeToPush(vapidKey)
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.swRegistration) return false
    
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        return true
      }
      return false
    } catch (error) {
      console.error('Unsubscribe failed:', error)
      return false
    }
  }

  addToOfflineQueue(item: OfflineQueueItem): void {
    // Mock implementation - in real app, would use IndexedDB
    console.log('Added to offline queue:', item)
  }

  clearOfflineQueue(): void {
    // Mock implementation
    console.log('Offline queue cleared')
  }

  async clearCache(): Promise<void> {
    if (!('caches' in window)) return
    
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      console.log('Cache cleared')
    } catch (error) {
      console.error('Cache clear failed:', error)
    }
  }

  async canInstall(): Promise<boolean> {
    return !this.isInstalled() && !!(window as any).deferredPrompt
  }
}

// Export singleton instance
export const pwaUtils = PWAUtils.getInstance()
export const pwaManager = pwaUtils // Alias for compatibility

// Helper functions
export const isPWASupported = () => pwaUtils.isPWASupported()
export const registerSW = () => pwaUtils.registerServiceWorker()
export const requestNotifications = () => pwaUtils.requestNotificationPermission()
export const subscribeToPush = (key: string) => pwaUtils.subscribeToPush(key)
export const showNotification = (payload: NotificationPayload) => pwaUtils.showNotification(payload)
export const isAppInstalled = () => pwaUtils.isInstalled()
export const showInstallPrompt = () => pwaUtils.showInstallPrompt()