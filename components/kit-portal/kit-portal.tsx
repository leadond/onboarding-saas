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

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StepRenderer } from '@/lib/steps/step-renderer'
import { useStepProgress } from '@/hooks/use-step-progress'
import { KitNavigation } from './kit-navigation'
import { ProgressBar } from './progress-bar'
import type { Kit, KitStep } from '@/types'

interface KitPortalProps {
  kit: Kit
  steps: KitStep[]
  clientIdentifier: string
  initialStepId?: string
}

export function KitPortal({
  kit,
  steps,
  clientIdentifier,
  initialStepId,
}: KitPortalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const {
    progressData,
    isLoading: progressLoading,
    saveStepProgress,
    getStepProgress,
    isStepCompleted,
    getCompletionPercentage,
    getNextIncompleteStep,
    getCurrentStepIndex,
    getProgressSummary,
  } = useStepProgress({
    kitId: kit.id,
    clientIdentifier,
    steps,
  })

  // Set initial step based on progress or URL parameter
  useEffect(() => {
    if (progressLoading) return

    let targetStepIndex = 0

    if (initialStepId) {
      const stepIndex = steps.findIndex(step => step.id === initialStepId)
      if (stepIndex !== -1) {
        targetStepIndex = stepIndex
      }
    } else {
      // Use progress to determine current step
      const progressIndex = getCurrentStepIndex()
      targetStepIndex = progressIndex
    }

    setCurrentStepIndex(targetStepIndex)
  }, [initialStepId, getCurrentStepIndex, progressLoading, steps])

  const currentStep = steps[currentStepIndex]

  const handleStepComplete = async (stepData?: any) => {
    if (!currentStep) return

    try {
      // Save step progress
      await saveStepProgress({
        step_id: currentStep.id,
        response_data: stepData,
        status: 'completed',
      })

      // Move to next step or complete
      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < steps.length) {
        setCurrentStepIndex(nextStepIndex)

        // Update URL
        const params = new URLSearchParams(searchParams.toString())
        params.set('step', steps[nextStepIndex]?.id || '')
        router.push(`?${params.toString()}`)
      } else {
        // All steps completed
        if (kit.completion_redirect_url) {
          window.location.href = kit.completion_redirect_url
        } else {
          // Show completion state
          router.push(`?${searchParams.toString()}&completed=true`)
        }
      }
    } catch (error) {
      console.error('Error completing step:', error)
    }
  }

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1
      setCurrentStepIndex(prevStepIndex)

      // Update URL
      const params = new URLSearchParams(searchParams.toString())
      params.set('step', steps[prevStepIndex]?.id || '')
      router.push(`?${params.toString()}`)
    }
  }

  const handleStepSkip = async () => {
    if (!currentStep || currentStep.is_required) return

    try {
      // Save as skipped
      await saveStepProgress({
        step_id: currentStep.id,
        response_data: null,
        status: 'skipped',
      })

      // Move to next step
      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < steps.length) {
        setCurrentStepIndex(nextStepIndex)

        // Update URL
        const params = new URLSearchParams(searchParams.toString())
        params.set('step', steps[nextStepIndex]?.id || '')
        router.push(`?${params.toString()}`)
      }
    } catch (error) {
      console.error('Error skipping step:', error)
    }
  }

  const handleStepNavigate = (stepIndex: number) => {
    // Only allow navigation to completed steps or the current step
    const targetStep = steps[stepIndex]
    if (!targetStep) return

    const canNavigate =
      stepIndex <= currentStepIndex || isStepCompleted(targetStep.id)
    if (!canNavigate) return

    setCurrentStepIndex(stepIndex)

    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', targetStep.id)
    router.push(`?${params.toString()}`)
  }

  if (progressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Kit Complete!
          </h1>
          <p className="text-gray-600">
            Thank you for completing the onboarding process.
          </p>
        </div>
      </div>
    )
  }

  const completionPercentage = getCompletionPercentage()
  const progressSummary = getProgressSummary()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {kit.logo_url && (
                  <img
                    src={kit.logo_url}
                    alt={kit.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {kit.name}
                  </h1>
                  {kit.description && (
                    <p className="mt-1 text-gray-600">{kit.description}</p>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <ProgressBar
                steps={steps}
                currentStepIndex={currentStepIndex}
                completedSteps={progressSummary.completedSteps}
                onStepClick={handleStepNavigate}
                brandColor={kit.brand_color}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <StepRenderer
              step={currentStep}
              clientId={clientIdentifier}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              progress={getStepProgress(currentStep.id) || undefined}
              onComplete={handleStepComplete}
              onNext={
                currentStepIndex < steps.length - 1
                  ? () => {
                      const nextIndex = currentStepIndex + 1
                      setCurrentStepIndex(nextIndex)
                      const params = new URLSearchParams(
                        searchParams.toString()
                      )
                      params.set('step', steps[nextIndex]?.id || '')
                      router.push(`?${params.toString()}`)
                    }
                  : undefined
              }
              onPrevious={currentStepIndex > 0 ? handleStepBack : undefined}
              onSkip={!currentStep.is_required ? handleStepSkip : undefined}
              useWrapper={false}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <KitNavigation
        steps={steps}
        currentStepIndex={currentStepIndex}
        completedSteps={progressSummary.completedSteps}
        onStepNavigate={handleStepNavigate}
        onBack={currentStepIndex > 0 ? handleStepBack : undefined}
        onSkip={!currentStep.is_required ? handleStepSkip : undefined}
        className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4"
      />

      {/* Mobile spacing for fixed navigation */}
      <div className="h-20 sm:hidden"></div>
    </div>
  )
}
