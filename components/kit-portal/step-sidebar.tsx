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

import { Check, Clock, Lock, ChevronRight } from 'lucide-react'
import type { KitStep } from '@/types'
import { cn } from '@/lib/utils/cn'

interface StepSidebarProps {
  steps: KitStep[]
  currentStepIndex: number
  completedSteps: string[]
  onStepClick: (stepIndex: number) => void
  brandColor?: string
  className?: string
}

interface StepItemProps {
  step: KitStep
  stepIndex: number
  isActive: boolean
  isCompleted: boolean
  isAccessible: boolean
  onClick: () => void
  brandColor: string
}

function StepItem({
  step,
  stepIndex,
  isActive,
  isCompleted,
  isAccessible,
  onClick,
  brandColor,
}: StepItemProps) {
  const getStepIcon = () => {
    if (isCompleted) {
      return <Check className="h-4 w-4 text-white" />
    }
    if (isActive) {
      return <Clock className="h-4 w-4 text-white" />
    }
    if (!isAccessible) {
      return <Lock className="h-3 w-3 text-gray-400" />
    }
    return (
      <span className="text-xs font-medium text-gray-500">{stepIndex + 1}</span>
    )
  }

  const getStepStatus = () => {
    if (isCompleted) return 'Completed'
    if (isActive) return 'Current'
    if (step.is_required) return 'Required'
    return 'Optional'
  }

  return (
    <li>
      <button
        onClick={isAccessible ? onClick : undefined}
        disabled={!isAccessible}
        className={cn(
          'flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-all duration-200',
          isActive && 'border border-blue-200 bg-blue-50',
          isCompleted && 'border border-green-200 bg-green-50',
          !isActive &&
            !isCompleted &&
            isAccessible &&
            'border border-transparent hover:bg-gray-50',
          !isAccessible && 'cursor-not-allowed opacity-60'
        )}
        style={{
          ...(isActive && {
            backgroundColor: `${brandColor}08`,
            borderColor: `${brandColor}30`,
          }),
          ...(isCompleted && {
            backgroundColor: '#f0f9f0',
            borderColor: '#22c55e30',
          }),
        }}
      >
        {/* Step Number/Icon */}
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all duration-200',
            isCompleted && 'bg-green-500',
            isActive && 'shadow-sm',
            !isActive && !isCompleted && isAccessible && 'bg-gray-100',
            !isAccessible && 'bg-gray-100'
          )}
          style={{
            ...(isActive && {
              backgroundColor: brandColor,
              color: 'white',
            }),
          }}
        >
          {getStepIcon()}
        </div>

        {/* Step Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4
              className={cn(
                'truncate text-sm font-medium',
                isActive && 'text-gray-900',
                isCompleted && 'text-gray-900',
                !isActive && !isCompleted && isAccessible && 'text-gray-700',
                !isAccessible && 'text-gray-400'
              )}
            >
              {step.title}
            </h4>
            {isAccessible && !isActive && !isCompleted && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </div>

          <div className="mt-1 flex items-center justify-between">
            <p className="truncate text-xs text-gray-500">
              {step.description || `Step ${stepIndex + 1}`}
            </p>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                isCompleted && 'bg-green-100 text-green-800',
                isActive && 'text-white',
                !isActive &&
                  !isCompleted &&
                  step.is_required &&
                  'bg-orange-100 text-orange-800',
                !isActive &&
                  !isCompleted &&
                  !step.is_required &&
                  'bg-gray-100 text-gray-600'
              )}
              style={{
                ...(isActive && {
                  backgroundColor: `${brandColor}20`,
                  color: brandColor,
                }),
              }}
            >
              {getStepStatus()}
            </span>
          </div>
        </div>
      </button>
    </li>
  )
}

export function StepSidebar({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
  brandColor = '#3B82F6',
  className,
}: StepSidebarProps) {
  const totalSteps = steps.length
  const completedCount = completedSteps.length
  const progressPercentage =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  return (
    <div
      className={cn(
        'hidden w-80 overflow-y-auto border-r border-gray-200 bg-white lg:block',
        className
      )}
    >
      <div className="p-6">
        {/* Progress Overview */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Progress
            </h2>
            <span className="text-sm font-medium" style={{ color: brandColor }}>
              {progressPercentage}%
            </span>
          </div>

          <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: brandColor,
              }}
            />
          </div>

          <p className="text-sm text-gray-600">
            {completedCount} of {totalSteps} steps completed
          </p>
        </div>

        {/* Steps List */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-900">
            Onboarding Steps
          </h3>
          <ol className="space-y-2">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isActive = index === currentStepIndex
              const isAccessible = index <= currentStepIndex || isCompleted

              return (
                <StepItem
                  key={step.id}
                  step={step}
                  stepIndex={index}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isAccessible={isAccessible}
                  onClick={() => onStepClick(index)}
                  brandColor={brandColor}
                />
              )
            })}
          </ol>
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">Need Help?</h4>
          <p className="mb-3 text-xs text-gray-600">
            If you have questions about any step, don&apos;t hesitate to reach out.
          </p>
          <div className="space-y-2">
            <button className="w-full text-left text-xs text-gray-600 transition-colors hover:text-gray-900">
              📧 Send us a message
            </button>
            <button className="w-full text-left text-xs text-gray-600 transition-colors hover:text-gray-900">
              📞 Schedule a call
            </button>
            <button className="w-full text-left text-xs text-gray-600 transition-colors hover:text-gray-900">
              💬 Live chat support
            </button>
          </div>
        </div>

        {/* Completion Estimate */}
        {progressPercentage > 0 && progressPercentage < 100 && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start space-x-2">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
              <div>
                <h4 className="mb-1 text-sm font-medium text-blue-900">
                  Almost there!
                </h4>
                <p className="text-xs text-blue-700">
                  You&apos;re {progressPercentage}% complete. Just{' '}
                  {totalSteps - completedCount} more step
                  {totalSteps - completedCount !== 1 ? 's' : ''} to go!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
