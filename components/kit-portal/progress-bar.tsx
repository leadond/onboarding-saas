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

import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'

interface ProgressBarProps {
  steps: KitStep[]
  currentStepIndex: number
  completedSteps: number
  onStepClick?: (stepIndex: number) => void
  brandColor?: string
  className?: string
}

export function ProgressBar({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
  brandColor = '#3b82f6',
  className,
}: ProgressBarProps) {
  const progressPercentage = (completedSteps / steps.length) * 100

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 text-xs">
          <div
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: brandColor,
            }}
            className="flex flex-col justify-center whitespace-nowrap text-center text-white shadow-none transition-all duration-500 ease-in-out"
          />
        </div>
      </div>

      {/* Step Labels */}
      <div className="mt-4 flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < completedSteps
          const isCurrent = index === currentStepIndex
          const canClick =
            onStepClick && (isCompleted || index <= currentStepIndex)

          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center"
              style={{ width: `${100 / steps.length}%` }}
            >
              {/* Step Circle */}
              <button
                onClick={() => canClick && onStepClick?.(index)}
                disabled={!canClick}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-200',
                  {
                    'border-green-500 bg-green-500 text-white': isCompleted,
                    'border-blue-600 bg-blue-600 text-white':
                      isCurrent && !isCompleted,
                    'border-gray-300 bg-white text-gray-400':
                      !isCompleted && !isCurrent,
                    'cursor-pointer hover:scale-110': canClick,
                    'cursor-not-allowed': !canClick,
                  }
                )}
                style={{
                  borderColor: isCurrent ? brandColor : undefined,
                  backgroundColor: isCurrent ? brandColor : undefined,
                }}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step Title */}
              <div className="mt-2 text-center">
                <p
                  className={cn('max-w-20 truncate text-xs font-medium', {
                    'text-green-600': isCompleted,
                    'text-blue-600': isCurrent && !isCompleted,
                    'text-gray-400': !isCompleted && !isCurrent,
                  })}
                  style={{
                    color: isCurrent ? brandColor : undefined,
                  }}
                  title={step.title}
                >
                  {step.title}
                </p>
                {step.is_required && (
                  <span className="mt-1 text-xs text-red-500">*</span>
                )}
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div
                  className="absolute left-1/2 top-4 -z-10 h-0.5 w-full bg-gray-200"
                  style={{
                    backgroundColor:
                      index < completedSteps - 1 ? brandColor : '#e5e7eb',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Simplified version for mobile
export function MobileProgressBar({
  steps,
  currentStepIndex,
  completedSteps,
  brandColor = '#3b82f6',
  className,
}: Omit<ProgressBarProps, 'onStepClick'>) {
  const progressPercentage = (completedSteps / steps.length) * 100
  const currentStep = steps[currentStepIndex]

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative mb-3">
        <div className="flex h-2 overflow-hidden rounded-full bg-gray-200 text-xs">
          <div
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: brandColor,
            }}
            className="flex flex-col justify-center whitespace-nowrap text-center text-white shadow-none transition-all duration-500 ease-in-out"
          />
        </div>
      </div>

      {/* Current Step Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {currentStep?.title}
          </h3>
          <p className="text-xs text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>
        <div className="text-xs font-medium text-gray-600">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    </div>
  )
}
