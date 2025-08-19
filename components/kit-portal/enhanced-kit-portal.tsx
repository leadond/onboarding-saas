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

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StepRenderer } from '@/lib/steps/step-renderer'
import { useStepProgress } from '@/hooks/use-step-progress'
import { KitHeader } from './kit-header'
import { StepSidebar } from './step-sidebar'
import { MobileNavigation } from './mobile-navigation'
import { CompletionCelebration } from './completion-celebration'
import {
  SaveProgressIndicator,
  useSaveIndicator,
} from './save-progress-indicator'
import type { Kit, KitStep } from '@/types'
import { cn } from '@/lib/utils/cn'

interface EnhancedKitPortalProps {
  kit: Kit & {
    user?: {
      full_name?: string
      company_name?: string
    }
  }
  steps: KitStep[]
  clientIdentifier: string
  initialStepId?: string
}

export function EnhancedKitPortal({
  kit,
  steps,
  clientIdentifier,
  initialStepId,
}: EnhancedKitPortalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const saveIndicator = useSaveIndicator()

  const {
    progressData,
    isLoading: progressLoading,
    isSaving,
    saveStepProgress,
    getStepProgress,
    isStepCompleted,
    getCompletionPercentage,
    getNextIncompleteStep,
    getCurrentStepIndex,
    getProgressSummary,
    getTotalTimeSpent,
  } = useStepProgress({
    kitId: kit.id,
    clientIdentifier,
    steps,
  })

  // Update save indicator based on saving state
  useEffect(() => {
    if (isSaving) {
      saveIndicator.showSaving()
    }
  }, [isSaving, saveIndicator])

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
      const progressIndex = getCurrentStepIndex()
      targetStepIndex = progressIndex
    }

    setCurrentStepIndex(targetStepIndex)
  }, [initialStepId, getCurrentStepIndex, progressLoading, steps])

  // Check if kit is completed
  useEffect(() => {
    const completionPercentage = getCompletionPercentage()
    const allRequiredCompleted = steps
      .filter(step => step.is_required)
      .every(step => isStepCompleted(step.id))

    setIsCompleted(completionPercentage === 100 || allRequiredCompleted)
  }, [getCompletionPercentage, steps, isStepCompleted])

  const currentStep = steps[currentStepIndex]
  const completionPercentage = getCompletionPercentage()
  const progressSummary = getProgressSummary()
  const completedSteps = steps
    .filter(step => isStepCompleted(step.id))
    .map(step => step.id)

  const handleStepComplete = async (stepData?: any) => {
    if (!currentStep) return

    try {
      await saveStepProgress({
        step_id: currentStep.id,
        response_data: stepData,
        status: 'completed',
      })

      saveIndicator.showSaved(new Date())

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
        setIsCompleted(true)
        if (kit.completion_redirect_url) {
          setTimeout(() => {
            window.location.href = kit.completion_redirect_url!
          }, 5000) // Redirect after 5 seconds
        }
      }
    } catch (error) {
      console.error('Error completing step:', error)
      saveIndicator.showError('Failed to save progress')
    }
  }

  const handleStepNavigate = (stepIndex: number) => {
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

    // Close mobile nav if open
    setShowMobileNav(false)
  }

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1
      handleStepNavigate(prevStepIndex)
    }
  }

  const handleStepSkip = async () => {
    if (!currentStep || currentStep.is_required) return

    try {
      await saveStepProgress({
        step_id: currentStep.id,
        response_data: null,
        status: 'skipped',
      })

      saveIndicator.showSaved(new Date())

      const nextStepIndex = currentStepIndex + 1
      if (nextStepIndex < steps.length) {
        handleStepNavigate(nextStepIndex)
      }
    } catch (error) {
      console.error('Error skipping step:', error)
      saveIndicator.showError('Failed to save progress')
    }
  }

  // Show completion celebration if completed
  if (isCompleted) {
    const totalTime = getTotalTimeSpent()
    return (
      <CompletionCelebration
        kit={kit}
        clientName={(() => {
          const firstKey = Object.keys(progressData)[0]
          return firstKey
            ? progressData[firstKey]?.client_name || undefined
            : undefined
        })()}
        completionTime={totalTime}
        totalSteps={steps.length}
        onDownloadCertificate={() => {
          // TODO: Implement certificate download
          console.log('Download certificate')
        }}
        onShareSuccess={() => {
          // TODO: Implement social sharing
          console.log('Share success')
        }}
        onProvideFeedback={() => {
          // TODO: Implement feedback form
          console.log('Provide feedback')
        }}
      />
    )
  }

  if (progressLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div
          className="h-12 w-12 animate-spin rounded-full border-b-2"
          style={{ borderColor: kit.brand_color || '#3B82F6' }}
        ></div>
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <KitHeader
        kit={kit}
        completionPercentage={completionPercentage}
        currentStepIndex={currentStepIndex}
        totalSteps={steps.length}
        onMenuToggle={() => setShowMobileNav(!showMobileNav)}
        showMobileMenu={showMobileNav}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <StepSidebar
          steps={steps}
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
          onStepClick={handleStepNavigate}
          brandColor={kit.brand_color}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl p-6 lg:p-8">
            {/* Step Content Card */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8 lg:p-10">
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
                          handleStepNavigate(nextIndex)
                        }
                      : undefined
                  }
                  onPrevious={currentStepIndex > 0 ? handleStepBack : undefined}
                  onSkip={!currentStep.is_required ? handleStepSkip : undefined}
                  useWrapper={false}
                />
              </div>
            </div>

            {/* Progress Summary Card - Desktop Only */}
            <div className="mt-6 hidden lg:block">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>
                      {progressSummary.completedSteps} of{' '}
                      {progressSummary.totalSteps} completed
                    </span>
                    <span>•</span>
                    <span>
                      {Math.round(getTotalTimeSpent() / 60)} minutes invested
                    </span>
                  </div>
                  <div className="text-right">
                    {progressSummary.nextStep ? (
                      <span>Next: {progressSummary.nextStep.title}</span>
                    ) : (
                      <span className="font-medium text-green-600">
                        All steps complete!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <MobileNavigation
        steps={steps}
        currentStepIndex={currentStepIndex}
        completedSteps={completedSteps}
        onStepNavigate={handleStepNavigate}
        onClose={() => setShowMobileNav(false)}
        isOpen={showMobileNav}
        brandColor={kit.brand_color}
      />

      {/* Floating Save Indicator */}
      <div className="fixed bottom-4 right-4 z-40 lg:bottom-6 lg:right-6">
        <SaveProgressIndicator
          status={saveIndicator.status}
          className="shadow-lg"
          autoHide={true}
          autoHideDelay={2000}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="border-t border-gray-200 bg-white p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={handleStepBack}
            disabled={currentStepIndex === 0}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              currentStepIndex === 0
                ? 'cursor-not-allowed text-gray-400'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            ← Previous
          </button>

          <div className="text-sm text-gray-600">
            {currentStepIndex + 1} of {steps.length}
          </div>

          <button
            onClick={() => {
              if (currentStepIndex < steps.length - 1) {
                handleStepNavigate(currentStepIndex + 1)
              }
            }}
            disabled={currentStepIndex === steps.length - 1}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              currentStepIndex === steps.length - 1
                ? 'cursor-not-allowed text-gray-400'
                : 'text-white'
            )}
            style={{
              backgroundColor:
                currentStepIndex === steps.length - 1
                  ? '#d1d5db'
                  : kit.brand_color || '#3B82F6',
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
