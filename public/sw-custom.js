// OnboardKit Advanced Service Worker
// Handles offline functionality, push notifications, and background sync

const CACHE_NAME = 'onboardkit-v2.0.0'
const OFFLINE_URL = '/offline'
const API_CACHE_NAME = 'onboardkit-api-v2.0.0'
const STATIC_CACHE_NAME = 'onboardkit-static-v2.0.0'

// URLs to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache for offline access
const CACHEABLE_API_PATTERNS = [
  /^\/api\/kits$/,
  /^\/api\/kits\/[^\/]+$/,
  /^\/api\/v1\/analytics/,
  /^\/api\/user\/profile$/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing OnboardKit Service Worker v2.0.0')
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE_NAME)
        await cache.addAll(STATIC_ASSETS)
        console.log('[SW] Static assets cached successfully')
        
        // Skip waiting to activate immediately
        self.skipWaiting()
      } catch (error) {
        console.error('[SW] Failed to cache static assets:', error)
      }
    })()
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating OnboardKit Service Worker v2.0.0')
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys()
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('onboardkit-') && 
          !name.includes('v2.0.0')
        )
        
        await Promise.all(
          oldCaches.map(cacheName => caches.delete(cacheName))
        )
        
        console.log('[SW] Old caches cleaned up:', oldCaches)
        
        // Claim all clients
        self.clients.claim()
      } catch (error) {
        console.error('[SW] Activation failed:', error)
      }
    })()
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request))
})

// API request handler with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const isCacheable = CACHEABLE_API_PATTERNS.some(pattern => 
    pattern.test(url.pathname)
  )
  
  if (!isCacheable) {
    // Non-cacheable API requests - network only
    try {
      return await fetch(request)
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Network error',
          message: 'Unable to connect to server. Please check your internet connection.',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
  
  // Cacheable API requests - network first, then cache
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Add offline indicator to cached response
      const responseData = await cachedResponse.json()
      return new Response(
        JSON.stringify({
          ...responseData,
          offline: true,
          cached_at: new Date().toISOString()
        }),
        {
          status: cachedResponse.status,
          headers: cachedResponse.headers
        }
      )
    }
    
    // No cache available
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline',
        message: 'This data is not available offline. Please connect to the internet.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Static request handler with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Try network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Failed to fetch:', request.url)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match(OFFLINE_URL)
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    // Return a basic offline response
    return new Response(
      'Offline - Please check your internet connection',
      { status: 503, statusText: 'Service Unavailable' }
    )
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  if (!event.data) {
    console.log('[SW] Push event has no data')
    return
  }
  
  try {
    const data = event.data.json()
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      image: data.image,
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/action-dismiss.png'
        }
      ],
      tag: data.tag || 'onboardkit-notification',
      renotify: true,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: Date.now(),
      vibrate: [200, 100, 200]
    }
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'OnboardKit',
        options
      )
    )
  } catch (error) {
    console.error('[SW] Error handling push notification:', error)
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('OnboardKit', {
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        tag: 'onboardkit-fallback'
      })
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag)
  
  event.notification.close()
  
  const action = event.action
  const data = event.notification.data || {}
  
  let url = '/'
  
  if (action === 'view' || !action) {
    // Default action or view action
    if (data.url) {
      url = data.url
    } else if (data.kitId) {
      url = `/dashboard/kits/${data.kitId}`
    } else if (data.clientId) {
      url = `/dashboard/clients/${data.clientId}`
    } else {
      url = '/dashboard'
    }
  } else if (action === 'dismiss') {
    // Just close the notification
    return
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics())
  } else if (event.tag === 'background-sync-form-data') {
    event.waitUntil(syncFormData())
  } else if (event.tag === 'background-sync-file-uploads') {
    event.waitUntil(syncFileUploads())
  }
})

// Sync analytics data when back online
async function syncAnalytics() {
  try {
    console.log('[SW] Syncing analytics data...')
    
    // Get pending analytics events from IndexedDB
    const pendingEvents = await getPendingAnalyticsEvents()
    
    for (const event of pendingEvents) {
      try {
        const response = await fetch('/api/v1/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event.data)
        })
        
        if (response.ok) {
          await removePendingAnalyticsEvent(event.id)
          console.log('[SW] Analytics event synced:', event.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync analytics event:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Sync form data when back online
async function syncFormData() {
  try {
    console.log('[SW] Syncing form data...')
    
    // Get pending form submissions from IndexedDB
    const pendingForms = await getPendingFormData()
    
    for (const form of pendingForms) {
      try {
        const response = await fetch(form.endpoint, {
          method: form.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form.data)
        })
        
        if (response.ok) {
          await removePendingFormData(form.id)
          console.log('[SW] Form data synced:', form.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync form data:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Form sync failed:', error)
  }
}

// Sync file uploads when back online
async function syncFileUploads() {
  try {
    console.log('[SW] Syncing file uploads...')
    
    // Get pending file uploads from IndexedDB
    const pendingUploads = await getPendingFileUploads()
    
    for (const upload of pendingUploads) {
      try {
        const formData = new FormData()
        formData.append('file', upload.file)
        formData.append('metadata', JSON.stringify(upload.metadata))
        
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          await removePendingFileUpload(upload.id)
          console.log('[SW] File upload synced:', upload.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync file upload:', error)
      }
    }
  } catch (error) {
    console.error('[SW] File upload sync failed:', error)
  }
}

// IndexedDB helper functions (simplified - would need full implementation)
async function getPendingAnalyticsEvents() {
  // Implementation would use IndexedDB to retrieve pending events
  return []
}

async function removePendingAnalyticsEvent(id) {
  // Implementation would remove the event from IndexedDB
}

async function getPendingFormData() {
  // Implementation would use IndexedDB to retrieve pending form data
  return []
}

async function removePendingFormData(id) {
  // Implementation would remove the form data from IndexedDB
}

async function getPendingFileUploads() {
  // Implementation would use IndexedDB to retrieve pending uploads
  return []
}

async function removePendingFileUpload(id) {
  // Implementation would remove the upload from IndexedDB
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  } else if (event.data && event.data.type === 'CACHE_ANALYTICS_EVENT') {
    // Cache analytics event for background sync
    cacheAnalyticsEvent(event.data.payload)
  }
})

async function cacheAnalyticsEvent(eventData) {
  // Implementation would store the event in IndexedDB for later sync
  console.log('[SW] Analytics event cached for background sync')
}

console.log('[SW] OnboardKit Service Worker v2.0.0 loaded')