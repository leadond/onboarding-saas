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

import * as React from 'react'
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { Tables } from '@/lib/supabase/database.types'

type ClientProgress = Tables<'client_progress'>

interface StepWrapperProps {
  step: KitStep
  currentStepIndex: number
  totalSteps: number
  progress?: ClientProgress
  isLoading?: boolean
  onNext?: () => void
  onPrevious?: () => void
  onSkip?: () => void
  children: React.ReactNode
  className?: string
}

interface StepHeaderProps {
  step: KitStep
  currentStepIndex: number
  totalSteps: number
  progress?: ClientProgress
}

interface StepProgressBarProps {
  currentStep: number
  totalSteps: number
  completedSteps: number
}

function StepHeader({
  step,
  currentStepIndex,
  totalSteps,
  progress,
}: StepHeaderProps) {
  const stepNumber = currentStepIndex + 1
  const isCompleted = progress?.status === 'completed'
  const isInProgress = progress?.status === 'in_progress'

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              isCompleted
                ? 'bg-green-100 text-green-800'
                : isInProgress
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600'
            )}
          >
            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {step.title}
            </h2>
            {step.description && (
              <p className="text-sm text-gray-600">{step.description}</p>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Step {stepNumber} of {totalSteps}
        </div>
      </div>
    </div>
  )
}

function StepProgressBar({
  currentStep,
  totalSteps,
  completedSteps,
}: StepProgressBarProps) {
  const progressPercentage = (completedSteps / totalSteps) * 100
  const currentProgressPercentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="mb-4 h-2 w-full rounded-full bg-gray-200">
      <div className="relative h-full">
        {/* Completed progress */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
        {/* Current progress */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${currentProgressPercentage}%` }}
        />
      </div>
    </div>
  )
}

export function StepWrapper({
  step,
  currentStepIndex,
  totalSteps,
  progress,
  isLoading = false,
  onNext,
  onPrevious,
  onSkip,
  children,
  className,
}: StepWrapperProps) {
  const [timeSpent, setTimeSpent] = React.useState(0)
  const [startTime] = React.useState(Date.now())

  // Track time spent on step
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const canGoNext =
    onNext && (!step.is_required || progress?.status === 'completed')
  const canGoPrevious = onPrevious && currentStepIndex > 0
  const canSkip =
    onSkip && !step.is_required && progress?.status !== 'completed'

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Progress Bar */}
      <div className="border-b border-gray-200 bg-white px-6 py-3">
        <StepProgressBar
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          completedSteps={0} // This would be calculated based on actual progress
        />
      </div>

      {/* Step Header */}
      <StepHeader
        step={step}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        progress={progress}
      />

      {/* Step Content */}
      <div className="flex-1 px-6 py-8">{children}</div>

      {/* Step Footer */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Time tracking */}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="mr-1 h-4 w-4" />
            <span>Time on step: {formatTime(timeSpent)}</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-3">
            {canGoPrevious && (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            )}

            {canSkip && (
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip This Step
              </Button>
            )}

            {canGoNext && (
              <Button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Step Requirements */}
        {step.is_required && progress?.status !== 'completed' && (
          <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              <strong>Required Step:</strong> This step must be completed before
              you can continue.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Simplified step wrapper for embedded use
export function SimpleStepWrapper({
  step,
  progress,
  isLoading = false,
  children,
  className,
}: {
  step: KitStep
  progress?: ClientProgress
  isLoading?: boolean
  children: React.ReactNode
  className?: string
}) {
  const isCompleted = progress?.status === 'completed'
  const isInProgress = progress?.status === 'in_progress'

  return (
    <Card className={cn('w-full', className)}>
      {/* Step Status Indicator */}
      <div
        className={cn(
          'border-b px-4 py-2',
          isCompleted
            ? 'border-green-200 bg-green-50'
            : isInProgress
              ? 'border-blue-200 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                isCompleted
                  ? 'bg-green-100 text-green-800'
                  : isInProgress
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
              )}
            >
              {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : '!'}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                isCompleted
                  ? 'text-green-800'
                  : isInProgress
                    ? 'text-blue-800'
                    : 'text-gray-600'
              )}
            >
              {isCompleted
                ? 'Completed'
                : isInProgress
                  ? 'In Progress'
                  : 'Pending'}
            </span>
          </div>

          {isLoading && <LoadingSpinner size="sm" />}
        </div>
      </div>

      {/* Step Content */}
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

// Hook for managing step wrapper state
export function useStepWrapper() {
  const [timeSpent, setTimeSpent] = React.useState(0)
  const [startTime, setStartTime] = React.useState<number>(Date.now())
  const [isVisible, setIsVisible] = React.useState(true)

  const resetTimer = () => {
    setStartTime(Date.now())
    setTimeSpent(0)
  }

  const getTimeSpent = () => {
    return Math.floor((Date.now() - startTime) / 1000)
  }

  React.useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setTimeSpent(getTimeSpent())
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime, isVisible])

  return {
    timeSpent,
    resetTimer,
    getTimeSpent,
    setIsVisible,
  }
}
