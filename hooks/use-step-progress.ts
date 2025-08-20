'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { KitStep } from '@/types'
import type { Database } from '@/lib/supabase/database.types'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

type ClientProgress = Tables<'client_progress'>

interface StepProgressData {
  step_id: string
  response_data: any
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  time_spent?: number
  completed_at?: string
}

interface UseStepProgressProps {
  kitId: string
  clientIdentifier: string
  steps: KitStep[]
}

export function useStepProgress({
  kitId,
  clientIdentifier,
  steps,
}: UseStepProgressProps) {
  const [progressData, setProgressData] = useState<
    Record<string, ClientProgress>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load existing progress data
  const loadProgress = useCallback(async () => {
    if (!kitId || !clientIdentifier) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('client_progress')
        .select('*')
        .eq('kit_id', kitId)
        .eq('client_identifier', clientIdentifier)

      if (fetchError) {
        throw fetchError
      }

      const progressMap = (data || []).reduce(
        (acc, progress) => {
          acc[progress.step_id] = progress
          return acc
        },
        {} as Record<string, ClientProgress>
      )

      setProgressData(progressMap)
    } catch (err) {
      console.error('Error loading progress:', err)
      setError(err instanceof Error ? err.message : 'Failed to load progress')
    } finally {
      setIsLoading(false)
    }
  }, [kitId, clientIdentifier, supabase])

  // Save step progress
  const saveStepProgress = useCallback(
    async (data: StepProgressData) => {
      if (!kitId || !clientIdentifier) return

      setIsSaving(true)
      setError(null)

      try {
        // Check if progress already exists
        const existingProgress = progressData[data.step_id]
        const now = new Date().toISOString()

        if (existingProgress) {
          // Update existing progress
          const { data: updatedData, error: updateError } = await supabase
            .from('client_progress')
            .update({
              status: data.status,
              response_data: data.response_data,
              time_spent: data.time_spent || 0,
              completed_at:
                data.status === 'completed' ? data.completed_at || now : null,
              updated_at: now,
            })
            .eq('id', existingProgress.id)
            .select()
            .single()

          if (updateError) {
            throw updateError
          }

          setProgressData(prev => ({
            ...prev,
            [data.step_id]: updatedData,
          }))
        } else {
          // Create new progress record
          const { data: newData, error: insertError } = await supabase
            .from('client_progress')
            .insert({
              kit_id: kitId,
              client_identifier: clientIdentifier,
              step_id: data.step_id,
              status: data.status,
              response_data: data.response_data,
              time_spent: data.time_spent || 0,
              completed_at:
                data.status === 'completed' ? data.completed_at || now : null,
              started_at: now,
              updated_at: now,
            })
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          setProgressData(prev => ({
            ...prev,
            [data.step_id]: newData,
          }))
        }
      } catch (err) {
        console.error('Error saving progress:', err)
        setError(err instanceof Error ? err.message : 'Failed to save progress')
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [kitId, clientIdentifier, progressData, supabase]
  )

  // Get progress for a specific step
  const getStepProgress = useCallback(
    (stepId: string): ClientProgress | null => {
      return progressData[stepId] || null
    },
    [progressData]
  )

  // Check if a step is completed
  const isStepCompleted = useCallback(
    (stepId: string): boolean => {
      const progress = progressData[stepId]
      return progress?.status === 'completed'
    },
    [progressData]
  )

  // Get completion percentage
  const getCompletionPercentage = useCallback((): number => {
    const totalSteps = steps.length
    if (totalSteps === 0) return 0

    const completedSteps = steps.filter(step => isStepCompleted(step.id)).length
    return Math.round((completedSteps / totalSteps) * 100)
  }, [steps, isStepCompleted])

  // Get next incomplete step
  const getNextIncompleteStep = useCallback((): KitStep | null => {
    for (const step of steps) {
      if (!isStepCompleted(step.id)) {
        return step
      }
    }
    return null
  }, [steps, isStepCompleted])

  // Get current step index
  const getCurrentStepIndex = useCallback((): number => {
    const nextStep = getNextIncompleteStep()
    if (!nextStep) return steps.length - 1 // All steps completed, return last index

    return steps.findIndex(step => step.id === nextStep.id)
  }, [steps, getNextIncompleteStep])

  // Check if all required steps are completed
  const areRequiredStepsCompleted = useCallback((): boolean => {
    const requiredSteps = steps.filter(step => step.is_required)
    return requiredSteps.every(step => isStepCompleted(step.id))
  }, [steps, isStepCompleted])

  // Get all completed steps
  const getCompletedSteps = useCallback((): KitStep[] => {
    return steps.filter(step => isStepCompleted(step.id))
  }, [steps, isStepCompleted])

  // Get all incomplete steps
  const getIncompleteSteps = useCallback((): KitStep[] => {
    return steps.filter(step => !isStepCompleted(step.id))
  }, [steps, isStepCompleted])

  // Calculate total time spent
  const getTotalTimeSpent = useCallback((): number => {
    return Object.values(progressData).reduce((total, progress) => {
      return total + (progress.time_spent || 0)
    }, 0)
  }, [progressData])

  // Get progress summary
  const getProgressSummary = useCallback(() => {
    const completedSteps = getCompletedSteps()
    const incompleteSteps = getIncompleteSteps()
    const totalTime = getTotalTimeSpent()
    const completionPercentage = getCompletionPercentage()

    return {
      totalSteps: steps.length,
      completedSteps: completedSteps.length,
      incompleteSteps: incompleteSteps.length,
      requiredStepsCompleted: areRequiredStepsCompleted(),
      completionPercentage,
      totalTimeSpent: totalTime,
      nextStep: getNextIncompleteStep(),
      currentStepIndex: getCurrentStepIndex(),
    }
  }, [
    steps.length,
    getCompletedSteps,
    getIncompleteSteps,
    getTotalTimeSpent,
    getCompletionPercentage,
    areRequiredStepsCompleted,
    getNextIncompleteStep,
    getCurrentStepIndex,
  ])

  // Load progress on mount
  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  return {
    // State
    progressData,
    isLoading,
    isSaving,
    error,

    // Actions
    saveStepProgress,
    loadProgress,

    // Queries
    getStepProgress,
    isStepCompleted,
    getCompletionPercentage,
    getNextIncompleteStep,
    getCurrentStepIndex,
    areRequiredStepsCompleted,
    getCompletedSteps,
    getIncompleteSteps,
    getTotalTimeSpent,
    getProgressSummary,
  }
}

// Hook for managing individual step state
export function useStepState(
  stepId: string,
  initialStatus: ClientProgress['status'] = 'not_started'
) {
  const [status, setStatus] = useState<ClientProgress['status']>(initialStatus)
  const [responseData, setResponseData] = useState<any>(null)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())

  // Update status
  const updateStatus = useCallback((newStatus: ClientProgress['status']) => {
    setStatus(newStatus)
  }, [])

  // Update response data
  const updateResponseData = useCallback((data: any) => {
    setResponseData(data)
  }, [])

  // Mark as completed
  const markCompleted = useCallback((data?: any) => {
    setStatus('completed')
    if (data) {
      setResponseData(data)
    }
  }, [])

  // Mark as in progress
  const markInProgress = useCallback((data?: any) => {
    setStatus('in_progress')
    if (data) {
      setResponseData(data)
    }
  }, [])

  // Reset step state
  const reset = useCallback(() => {
    setStatus('not_started')
    setResponseData(null)
    setTimeSpent(0)
    setStartTime(Date.now())
  }, [])

  // Update time spent periodically
  useEffect(() => {
    if (status === 'not_started') return

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [status, startTime])

  return {
    status,
    responseData,
    timeSpent,
    updateStatus,
    updateResponseData,
    markCompleted,
    markInProgress,
    reset,
  }
}
