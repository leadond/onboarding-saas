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

// Service Worker Type Definitions

declare var self: ServiceWorkerGlobalScope

interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  addEventListener(type: 'install', listener: (event: ExtendableEvent) => void): void
  addEventListener(type: 'activate', listener: (event: ExtendableEvent) => void): void
  addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void
  addEventListener(type: 'push', listener: (event: PushEvent) => void): void
  addEventListener(type: 'notificationclick', listener: (event: NotificationEvent) => void): void
  skipWaiting(): Promise<void>
  clients: Clients
  registration: ServiceWorkerRegistration
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void
}

interface FetchEvent extends ExtendableEvent {
  request: Request
  respondWith(response: Promise<Response> | Response): void
}

interface PushEvent extends ExtendableEvent {
  data: PushMessageData | null
}

interface NotificationEvent extends ExtendableEvent {
  notification: Notification
  action: string
}

interface PushMessageData {
  json(): any
  text(): string
  arrayBuffer(): ArrayBuffer
  blob(): Blob
}
