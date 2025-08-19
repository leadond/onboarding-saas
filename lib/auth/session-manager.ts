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

import { createClient } from '@/lib/supabase/client'

const SESSION_TIMEOUT = 10 * 60 * 1000 // 10 minutes
const ACTIVITY_KEY = 'last_activity'

export class SessionManager {
  private supabase = createClient()
  private activityTimer: NodeJS.Timeout | null = null
  private visibilityTimer: NodeJS.Timeout | null = null

  constructor() {
    this.setupActivityTracking()
    this.setupVisibilityTracking()
    this.checkSessionValidity()
  }

  private setupActivityTracking() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus', 'blur']
    
    const updateActivity = () => {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
      this.resetActivityTimer()
    }

    // Throttle activity updates to avoid excessive calls
    let lastUpdate = 0
    const throttledUpdate = () => {
      const now = Date.now()
      if (now - lastUpdate > 5000) { // Update every 5 seconds max
        lastUpdate = now
        updateActivity()
      }
    }

    events.forEach(event => {
      document.addEventListener(event, throttledUpdate, true)
    })
  }

  private setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Don't logout immediately when tab is hidden
        // Let the normal inactivity timer handle it
      } else {
        // Page is visible again, update activity
        localStorage.setItem(ACTIVITY_KEY, Date.now().toString())
        this.resetActivityTimer()
      }
    })

    // Don't logout on beforeunload - let server handle session cleanup
  }

  private resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }

    this.activityTimer = setTimeout(() => {
      this.logout()
    }, SESSION_TIMEOUT)
  }

  private checkSessionValidity() {
    const lastActivity = localStorage.getItem(ACTIVITY_KEY)
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity)
      if (timeSinceActivity > SESSION_TIMEOUT) {
        this.logout()
        return
      }
    }
    this.resetActivityTimer()
  }

  private async logout() {
    try {
      await this.supabase.auth.signOut()
      localStorage.removeItem(ACTIVITY_KEY)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  public destroy() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }
    if (this.visibilityTimer) {
      clearTimeout(this.visibilityTimer)
    }
  }
}