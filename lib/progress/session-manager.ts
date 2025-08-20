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

import { getSupabaseClient } from '@/lib/supabase'
import type { Tables } from '@/types/supabase'

import type { KitStep } from '@/types'

// Type imported from @/types/supabase

export interface SessionData {
  sessionId: string
  kitId: string
  clientIdentifier: string
  lastActiveAt: string
  deviceInfo: DeviceInfo
  progress: Record<string, ClientProgress>
  metadata: SessionMetadata
}

export interface DeviceInfo {
  userAgent: string
  platform: string
  browserName: string
  browserVersion: string
  screenResolution: string
  timezone: string
}

export interface SessionMetadata {
  startedAt: string
  totalTimeSpent: number
  stepsViewed: string[]
  lastStepId?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface SessionRecoveryData {
  lastStepId: string
  progress: Record<string, ClientProgress>
  timeSpent: number
  resumeMessage: string
}

export class SessionManager {
  private supabase: any = null
  private sessionId: string
  private sessionData: SessionData | null = null
  private autoSaveInterval: NodeJS.Timeout | null = null
  private activityTimer: NodeJS.Timeout | null = null

  constructor(kitId: string, clientIdentifier: string) {
    this.sessionId = this.generateSessionId()
    this.initializeSession(kitId, clientIdentifier)
    this.startAutoSave()
    this.trackActivity()
  }

  /**
   * Initialize a new session or recover existing one
   */
  private async initializeSession(
    kitId: string,
    clientIdentifier: string
  ): Promise<void> {
    try {
      // Try to recover existing session
      const existingSession = await this.recoverSession(kitId, clientIdentifier)

      if (existingSession) {
        this.sessionData = existingSession
        this.sessionId = existingSession.sessionId
      } else {
        // Create new session
        this.sessionData = {
          sessionId: this.sessionId,
          kitId,
          clientIdentifier,
          lastActiveAt: new Date().toISOString(),
          deviceInfo: this.getDeviceInfo(),
          progress: {},
          metadata: {
            startedAt: new Date().toISOString(),
            totalTimeSpent: 0,
            stepsViewed: [],
            referrer:
              typeof document !== 'undefined' ? document.referrer : undefined,
            utmSource: this.getUrlParam('utm_source'),
            utmMedium: this.getUrlParam('utm_medium'),
            utmCampaign: this.getUrlParam('utm_campaign'),
          },
        }
      }

      // Save session to localStorage for quick access
      this.saveToLocalStorage()
    } catch (error) {
      console.error('Error initializing session:', error)
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        platform: 'server',
        browserName: 'unknown',
        browserVersion: 'unknown',
        screenResolution: '0x0',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }
    }

    const userAgent = navigator.userAgent
    const platform = navigator.platform
    const screen = window.screen
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Simple browser detection
    let browserName = 'unknown'
    let browserVersion = 'unknown'

    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/([0-9.]+)/)
      browserVersion = match?.[1] || 'unknown'
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/([0-9.]+)/)
      browserVersion = match?.[1] || 'unknown'
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/([0-9.]+)/)
      browserVersion = match?.[1] || 'unknown'
    }

    return {
      userAgent,
      platform,
      browserName,
      browserVersion,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone,
    }
  }

  /**
   * Get URL parameter
   */
  private getUrlParam(param: string): string | undefined {
    if (typeof window === 'undefined') return undefined

    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param) || undefined
  }

  /**
   * Update session progress
   */
  updateProgress(stepProgress: ClientProgress): void {
    if (!this.sessionData) return

    this.sessionData.progress[stepProgress.step_id] = stepProgress
    this.sessionData.lastActiveAt = new Date().toISOString()
    this.sessionData.metadata.lastStepId = stepProgress.step_id

    // Add to viewed steps if not already there
    if (!this.sessionData.metadata.stepsViewed.includes(stepProgress.step_id)) {
      this.sessionData.metadata.stepsViewed.push(stepProgress.step_id)
    }

    this.saveToLocalStorage()
  }

  /**
   * Update time spent
   */
  updateTimeSpent(additionalTime: number): void {
    if (!this.sessionData) return

    this.sessionData.metadata.totalTimeSpent += additionalTime
    this.sessionData.lastActiveAt = new Date().toISOString()
    this.saveToLocalStorage()
  }

  /**
   * Save session to localStorage
   */
  private saveToLocalStorage(): void {
    if (!this.sessionData || typeof window === 'undefined') return

    try {
      const key = `onboarding_session_${this.sessionData.kitId}_${this.sessionData.clientIdentifier}`
      localStorage.setItem(key, JSON.stringify(this.sessionData))
    } catch (error) {
      console.error('Error saving session to localStorage:', error)
    }
  }

  /**
   * Load session from localStorage
   */
  private loadFromLocalStorage(
    kitId: string,
    clientIdentifier: string
  ): SessionData | null {
    if (typeof window === 'undefined') return null

    try {
      const key = `onboarding_session_${kitId}_${clientIdentifier}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error loading session from localStorage:', error)
      return null
    }
  }

  /**
   * Save session to database
   */
  async saveToDatabase(): Promise<void> {
    if (!this.sessionData) return

    try {
      // Save session metadata
      await this.supabase.from('audit_logs').insert({
        action: 'create',
        resource_type: 'session',
        resource_id: this.sessionData.sessionId,
        details: JSON.parse(JSON.stringify(this.sessionData)) as any,
        session_id: this.sessionId,
        user_agent: this.sessionData.deviceInfo.userAgent,
      })

      // Update client progress records
      for (const progress of Object.values(this.sessionData.progress)) {
        await this.supabase.from('client_progress').upsert({
          ...progress,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error saving session to database:', error)
    }
  }

  /**
   * Recover existing session
   */
  async recoverSession(
    kitId: string,
    clientIdentifier: string
  ): Promise<SessionData | null> {
    try {
      // First try localStorage
      let sessionData = this.loadFromLocalStorage(kitId, clientIdentifier)

      if (sessionData) {
        // Check if session is still valid (not older than 7 days)
        const sessionAge =
          Date.now() - new Date(sessionData.lastActiveAt).getTime()
        const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

        if (sessionAge > maxAge) {
          sessionData = null
        }
      }

      // If no valid localStorage session, try to get latest progress from database
      if (!sessionData) {
        const { data: progressData } = await this.supabase
          .from('client_progress')
          .select('*')
          .eq('kit_id', kitId)
          .eq('client_identifier', clientIdentifier)

        if (progressData && progressData.length > 0) {
          const progressMap = progressData.reduce(
            (acc, progress) => {
              acc[progress.step_id] = progress
              return acc
            },
            {} as Record<string, ClientProgress>
          )

          // Create session from database progress
          const firstProgress = progressData[0]
          if (firstProgress) {
            sessionData = {
              sessionId: this.generateSessionId(),
              kitId,
              clientIdentifier,
              lastActiveAt: new Date().toISOString(),
              deviceInfo: this.getDeviceInfo(),
              progress: progressMap,
              metadata: {
                startedAt: firstProgress.started_at,
                totalTimeSpent: progressData.reduce(
                  (total, p) => total + (p.time_spent || 0),
                  0
                ),
                stepsViewed: progressData.map(p => p.step_id),
                lastStepId: progressData.sort(
                  (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime()
                )[0]?.step_id,
              },
            }
          }
        }
      }

      return sessionData
    } catch (error) {
      console.error('Error recovering session:', error)
      return null
    }
  }

  /**
   * Get recovery data for resuming progress
   */
  getRecoveryData(): SessionRecoveryData | null {
    if (!this.sessionData) return null

    const completedSteps = Object.values(this.sessionData.progress).filter(
      p => p.status === 'completed'
    ).length

    const totalSteps = this.sessionData.metadata.stepsViewed.length

    let resumeMessage = 'Welcome back! '

    if (completedSteps === 0) {
      resumeMessage += "Let's get started with your onboarding."
    } else if (completedSteps < totalSteps) {
      resumeMessage += `You've completed ${completedSteps} step${completedSteps > 1 ? 's' : ''}. Ready to continue?`
    } else {
      resumeMessage += "You're almost done! Just a few more steps to complete."
    }

    return {
      lastStepId: this.sessionData.metadata.lastStepId || '',
      progress: this.sessionData.progress,
      timeSpent: this.sessionData.metadata.totalTimeSpent,
      resumeMessage,
    }
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(): void {
    // Save to database every 2 minutes
    this.autoSaveInterval = setInterval(
      () => {
        this.saveToDatabase()
      },
      2 * 60 * 1000
    )
  }

  /**
   * Track user activity and update last active time
   */
  private trackActivity(): void {
    if (typeof window === 'undefined') return

    const updateActivity = () => {
      if (this.sessionData) {
        this.sessionData.lastActiveAt = new Date().toISOString()
        this.saveToLocalStorage()
      }
    }

    // Update activity on user interaction
    const events = ['click', 'scroll', 'keypress', 'mousemove']
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true })
    })

    // Clear activity timer and reset
    const resetActivityTimer = () => {
      if (this.activityTimer) {
        clearTimeout(this.activityTimer)
      }

      this.activityTimer = setTimeout(
        () => {
          // User inactive for 30 minutes, save to database
          this.saveToDatabase()
        },
        30 * 60 * 1000
      )
    }

    events.forEach(event => {
      window.addEventListener(event, resetActivityTimer, { passive: true })
    })
  }

  /**
   * Get current session data
   */
  getSessionData(): SessionData | null {
    return this.sessionData
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }

    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
    }

    // Save final state to database
    this.saveToDatabase()

    // Clear localStorage
    if (this.sessionData && typeof window !== 'undefined') {
      const key = `onboarding_session_${this.sessionData.kitId}_${this.sessionData.clientIdentifier}`
      localStorage.removeItem(key)
    }

    this.sessionData = null
  }

  /**
   * Cleanup when component unmounts
   */
  destroy(): void {
    this.clearSession()
  }
}

export default SessionManager
