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

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'

interface KitNavigationProps {
  steps: KitStep[]
  currentStepIndex: number
  completedSteps: number
  onStepNavigate: (stepIndex: number) => void
  onBack?: () => void
  onSkip?: () => void
  className?: string
}

export function KitNavigation({
  steps,
  currentStepIndex,
  completedSteps,
  onStepNavigate,
  onBack,
  onSkip,
  className,
}: KitNavigationProps) {
  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Back Button */}
      <div className="flex-1">
        {onBack && !isFirstStep && (
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      {/* Step Indicators (Desktop) */}
      <div className="hidden flex-1 items-center justify-center space-x-2 md:flex">
        {steps.map((step, index) => {
          const isCompleted = index < completedSteps
          const isCurrent = index === currentStepIndex
          const canNavigate = isCompleted || index <= currentStepIndex

          return (
            <button
              key={step.id}
              onClick={() => canNavigate && onStepNavigate(index)}
              disabled={!canNavigate}
              className={cn(
                'h-3 w-3 rounded-full transition-all duration-200',
                {
                  'bg-blue-600': isCurrent,
                  'bg-green-500': isCompleted,
                  'bg-gray-300': !isCompleted && !isCurrent,
                  'cursor-pointer hover:scale-110': canNavigate,
                  'cursor-not-allowed': !canNavigate,
                }
              )}
              title={`${step.title} ${isCompleted ? '(Completed)' : isCurrent ? '(Current)' : '(Not started)'}`}
            />
          )
        })}
      </div>

      {/* Progress Counter (Mobile) */}
      <div className="flex-1 text-center md:hidden">
        <span className="text-sm text-gray-600">
          {currentStepIndex + 1} of {steps.length}
        </span>
      </div>

      {/* Skip Button */}
      <div className="flex flex-1 justify-end">
        {onSkip && !currentStep?.is_required && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            Skip
            <SkipForward className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
