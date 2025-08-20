'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ProgressCalculator,
  type ProgressMetrics,
  type StepAnalytics,
  type ProgressTrends,
} from '@/lib/progress/progress-calculator'
import {
  SessionManager,
  type SessionData,
} from '@/lib/progress/session-manager'
import type { Tables, ClientProgress } from '@/types/supabase'

import type { KitStep } from '@/types'

const supabase = createClient()

// Type imported from @/types/supabase
type KitAnalytics = Tables<'kit_analytics'>

export interface AnalyticsEvent {
  eventName: string
  stepId?: string
  data?: Record<string, any>
  timestamp: Date
}

export interface EngagementMetrics {
  pageViews: number
  timeOnPage: number
  clickEvents: number
  formInteractions: number
  scrollDepth: number
  bounceRate: number
}

export interface ConversionMetrics {
  stepCompletionRates: Record<string, number>
  dropoffPoints: string[]
  conversionFunnel: Array<{
    stepId: string
    stepTitle: string
    entered: number
    completed: number
    conversionRate: number
  }>
}

export interface UseProgressAnalyticsProps {
  kitId: string
  clientIdentifier: string
  steps: KitStep[]
  enableTracking?: boolean
  trackingConfig?: {
    trackClicks: boolean
    trackScrolling: boolean
    trackFormInteractions: boolean
    trackTimeSpent: boolean
    batchSize: number
    flushInterval: number
  }
}

export interface UseProgressAnalyticsReturn {
  // Metrics
  progressMetrics: ProgressMetrics | null
  stepAnalytics: StepAnalytics[]
  progressTrends: ProgressTrends | null
  engagementMetrics: EngagementMetrics | null
  conversionMetrics: ConversionMetrics | null

  // State
  isLoading: boolean
  error: string | null
  sessionData: SessionData | null

  // Actions
  trackEvent: (event: AnalyticsEvent) => void
  trackStepView: (stepId: string) => void
  trackStepStart: (stepId: string) => void
  trackStepComplete: (stepId: string, data?: any) => void
  trackFormInteraction: (
    stepId: string,
    fieldId: string,
    action: string
  ) => void
  trackTimeSpent: (stepId: string, timeSpent: number) => void
  refreshAnalytics: () => Promise<void>

  // Utilities
  getRecommendations: () => string[]
  isAtRisk: () => boolean
  getNextBestAction: () => string | null
}

const defaultTrackingConfig = {
  trackClicks: true,
  trackScrolling: true,
  trackFormInteractions: true,
  trackTimeSpent: true,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
}

export function useProgressAnalytics({
  kitId,
  clientIdentifier,
  steps,
  enableTracking = true,
  trackingConfig = defaultTrackingConfig,
}: UseProgressAnalyticsProps): UseProgressAnalyticsReturn {
  // Supabase client will be created in useEffect
  const sessionManager = useRef<SessionManager | null>(null)
  const eventQueue = useRef<AnalyticsEvent[]>([])
  const flushTimer = useRef<NodeJS.Timeout | null>(null)

  // State
  const [progressData, setProgressData] = useState<
    Record<string, ClientProgress>
  >({})
  const [progressMetrics, setProgressMetrics] =
    useState<ProgressMetrics | null>(null)
  const [stepAnalytics, setStepAnalytics] = useState<StepAnalytics[]>([])
  const [progressTrends, setProgressTrends] = useState<ProgressTrends | null>(
    null
  )
  const [engagementMetrics, setEngagementMetrics] =
    useState<EngagementMetrics | null>(null)
  const [conversionMetrics, setConversionMetrics] =
    useState<ConversionMetrics | null>(null)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize session manager
  useEffect(() => {
    if (!enableTracking) return

    sessionManager.current = new SessionManager(kitId, clientIdentifier)
    setSessionData(sessionManager.current.getSessionData())

    return () => {
      if (sessionManager.current) {
        sessionManager.current.destroy()
      }
    }
  }, [kitId, clientIdentifier, enableTracking])

  // Load initial progress data
  const loadProgressData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('client_progress')
        .select('*')
        .eq('kit_id', kitId)
        .eq('client_identifier', clientIdentifier)

      if (fetchError) throw fetchError

      const progressMap = (data || []).reduce(
        (acc, progress) => {
          acc[progress.step_id] = progress
          return acc
        },
        {} as Record<string, ClientProgress>
      )

      setProgressData(progressMap)

      // Update session manager with progress
      if (sessionManager.current) {
        Object.values(progressMap).forEach(progress => {
          sessionManager.current!.updateProgress(progress as any)
        })
        setSessionData(sessionManager.current.getSessionData())
      }
    } catch (err) {
      console.error('Error loading progress data:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to load progress data'
      )
    } finally {
      setIsLoading(false)
    }
  }, [kitId, clientIdentifier, supabase])

  // Calculate analytics when progress data changes
  useEffect(() => {
    if (Object.keys(progressData).length === 0) return

    const calculator = new ProgressCalculator(steps, progressData as any)

    // Calculate all metrics
    setProgressMetrics(calculator.calculateMetrics())
    setStepAnalytics(calculator.calculateStepAnalytics())
    setProgressTrends(calculator.calculateTrends())

    // Calculate engagement metrics (would be enhanced with real tracking data)
    setEngagementMetrics(calculateEngagementMetrics())

    // Calculate conversion metrics
    setConversionMetrics(calculateConversionMetrics(calculator))
  }, [progressData, steps])

  // Initialize tracking
  useEffect(() => {
    if (!enableTracking) return

    loadProgressData()

    if (trackingConfig.trackClicks) {
      setupClickTracking()
    }

    if (trackingConfig.trackScrolling) {
      setupScrollTracking()
    }

    // Start batch flushing
    startBatchFlushing()

    return () => {
      if (flushTimer.current) {
        clearInterval(flushTimer.current)
      }
      flushEventQueue()
    }
  }, [enableTracking, trackingConfig, loadProgressData])

  // Event tracking functions
  const trackEvent = useCallback(
    (event: AnalyticsEvent) => {
      if (!enableTracking) return

      eventQueue.current.push(event)

      // Flush immediately if queue is full
      if (eventQueue.current.length >= trackingConfig.batchSize) {
        flushEventQueue()
      }
    },
    [enableTracking, trackingConfig.batchSize]
  )

  const trackStepView = useCallback(
    (stepId: string) => {
      trackEvent({
        eventName: 'step_viewed',
        stepId,
        timestamp: new Date(),
      })

      // Update session manager
      if (sessionManager.current) {
        sessionManager.current.updateTimeSpent(1) // Add 1 second for view tracking
      }
    },
    [trackEvent]
  )

  const trackStepStart = useCallback(
    (stepId: string) => {
      trackEvent({
        eventName: 'step_started',
        stepId,
        timestamp: new Date(),
      })
    },
    [trackEvent]
  )

  const trackStepComplete = useCallback(
    (stepId: string, data?: any) => {
      trackEvent({
        eventName: 'step_completed',
        stepId,
        data,
        timestamp: new Date(),
      })
    },
    [trackEvent]
  )

  const trackFormInteraction = useCallback(
    (stepId: string, fieldId: string, action: string) => {
      if (!trackingConfig.trackFormInteractions) return

      trackEvent({
        eventName: 'form_interaction',
        stepId,
        data: { fieldId, action },
        timestamp: new Date(),
      })
    },
    [trackEvent, trackingConfig.trackFormInteractions]
  )

  const trackTimeSpent = useCallback(
    (stepId: string, timeSpent: number) => {
      if (!trackingConfig.trackTimeSpent) return

      trackEvent({
        eventName: 'time_spent',
        stepId,
        data: { timeSpent },
        timestamp: new Date(),
      })

      // Update session manager
      if (sessionManager.current) {
        sessionManager.current.updateTimeSpent(timeSpent)
      }
    },
    [trackEvent, trackingConfig.trackTimeSpent]
  )

  // Setup tracking utilities
  const setupClickTracking = useCallback(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const stepContainer = target.closest('[data-step-id]')
      const stepId = stepContainer?.getAttribute('data-step-id')

      if (stepId) {
        trackEvent({
          eventName: 'click',
          stepId,
          data: {
            elementTag: target.tagName,
            elementClass: target.className,
            elementId: target.id,
            text: target.textContent?.slice(0, 100),
          },
          timestamp: new Date(),
        })
      }
    }

    document.addEventListener('click', handleClick, { passive: true })

    return () => document.removeEventListener('click', handleClick)
  }, [trackEvent])

  const setupScrollTracking = useCallback(() => {
    let maxScrollDepth = 0

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      const scrollDepth = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      )

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth

        // Track significant scroll milestones
        if (scrollDepth >= 25 && scrollDepth < 50) {
          trackEvent({
            eventName: 'scroll_depth',
            data: { depth: 25 },
            timestamp: new Date(),
          })
        } else if (scrollDepth >= 50 && scrollDepth < 75) {
          trackEvent({
            eventName: 'scroll_depth',
            data: { depth: 50 },
            timestamp: new Date(),
          })
        } else if (scrollDepth >= 75) {
          trackEvent({
            eventName: 'scroll_depth',
            data: { depth: 75 },
            timestamp: new Date(),
          })
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackEvent])

  // Batch processing
  const startBatchFlushing = useCallback(() => {
    flushTimer.current = setInterval(() => {
      if (eventQueue.current.length > 0) {
        flushEventQueue()
      }
    }, trackingConfig.flushInterval)
  }, [trackingConfig.flushInterval])

  const flushEventQueue = useCallback(async () => {
    if (eventQueue.current.length === 0) return

    const events = [...eventQueue.current]
    eventQueue.current = []

    try {
      // Save events to analytics table
      const analyticsData = events.map(event => ({
        kit_id: kitId,
        metric_name: event.eventName,
        metric_value: {
          stepId: event.stepId,
          data: event.data,
          timestamp: event.timestamp.toISOString(),
        },
        client_identifier: clientIdentifier,
        session_id: sessionManager.current?.getSessionData()?.sessionId,
        recorded_at: event.timestamp.toISOString(),
      }))

      await supabase.from('kit_analytics').insert(analyticsData)
    } catch (error) {
      console.error('Error flushing event queue:', error)
      // Put events back in queue to retry
      eventQueue.current = [...events, ...eventQueue.current]
    }
  }, [kitId, clientIdentifier, supabase])

  // Calculate engagement metrics
  const calculateEngagementMetrics = useCallback((): EngagementMetrics => {
    // This would be enhanced with real tracking data
    const completedSteps = Object.values(progressData).filter(
      p => p.status === 'completed'
    ).length
    const totalTime = Object.values(progressData).reduce(
      (sum, p) => sum + (p.time_spent || 0),
      0
    )

    return {
      pageViews: steps.length,
      timeOnPage: totalTime,
      clickEvents: 0, // Would be populated from analytics
      formInteractions: completedSteps,
      scrollDepth: 75, // Would be populated from scroll tracking
      bounceRate: completedSteps === 0 ? 100 : 0,
    }
  }, [progressData, steps])

  // Calculate conversion metrics
  const calculateConversionMetrics = useCallback(
    (calculator: ProgressCalculator): ConversionMetrics => {
      const stepCompletionRates: Record<string, number> = {}
      const conversionFunnel: Array<{
        stepId: string
        stepTitle: string
        entered: number
        completed: number
        conversionRate: number
      }> = []

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        if (!step) continue

        const progress = progressData[step.id]
        const isCompleted = progress?.status === 'completed'

        // Calculate completion rate (simplified)
        stepCompletionRates[step.id] = isCompleted ? 100 : 0

        // Add to funnel
        conversionFunnel.push({
          stepId: step.id,
          stepTitle: step.title,
          entered: i === 0 ? 1 : conversionFunnel[i - 1]?.completed || 0,
          completed: isCompleted ? 1 : 0,
          conversionRate: isCompleted ? 100 : 0,
        })
      }

      const dropoffPoints = steps
        .filter(
          step =>
            step &&
            (!progressData[step.id] ||
              progressData[step.id]?.status !== 'completed')
        )
        .map(step => step.id)

      return {
        stepCompletionRates,
        dropoffPoints,
        conversionFunnel,
      }
    },
    [steps, progressData]
  )

  // Utility functions
  const refreshAnalytics = useCallback(async () => {
    await loadProgressData()
  }, [loadProgressData])

  const getRecommendations = useCallback((): string[] => {
    if (!progressMetrics) return []

    const calculator = new ProgressCalculator(steps, progressData as any)
    return calculator.getRecommendations()
  }, [steps, progressData, progressMetrics])

  const isAtRisk = useCallback((): boolean => {
    if (!progressMetrics) return false

    const calculator = new ProgressCalculator(steps, progressData as any)
    return calculator.isAtRisk()
  }, [steps, progressData, progressMetrics])

  const getNextBestAction = useCallback((): string | null => {
    const calculator = new ProgressCalculator(steps, progressData as any)
    const nextStep = calculator.getNextRecommendedStep()

    if (!nextStep) return null

    return `Continue with "${nextStep.title}"`
  }, [steps, progressData])

  return {
    // Metrics
    progressMetrics,
    stepAnalytics,
    progressTrends,
    engagementMetrics,
    conversionMetrics,

    // State
    isLoading,
    error,
    sessionData,

    // Actions
    trackEvent,
    trackStepView,
    trackStepStart,
    trackStepComplete,
    trackFormInteraction,
    trackTimeSpent,
    refreshAnalytics,

    // Utilities
    getRecommendations,
    isAtRisk,
    getNextBestAction,
  }
}

export default useProgressAnalytics
