// PWA and Service Worker type declarations

declare global {
  interface Window {
    deferredPrompt?: any
    workbox?: any
  }
}

// Service Worker types
declare var self: ServiceWorkerGlobalScope & {
  addEventListener(type: string, listener: (event: any) => void): void
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void
}

interface FetchEvent extends ExtendableEvent {
  request: Request
  respondWith(response: Promise<Response> | Response): void
}

interface NotificationOptions {
  body?: string
  icon?: string
  badge?: string
  image?: string
  data?: any
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
}

export {}
