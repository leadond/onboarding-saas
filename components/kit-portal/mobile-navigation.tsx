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
import {
  X,
  Check,
  Clock,
  Lock,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { KitStep } from '@/types'
import { cn } from '@/lib/utils/cn'

interface MobileNavigationProps {
  steps: KitStep[]
  currentStepIndex: number
  completedSteps: string[]
  onStepNavigate: (stepIndex: number) => void
  onClose: () => void
  isOpen: boolean
  brandColor?: string
  className?: string
}

interface StepProgressProps {
  steps: KitStep[]
  currentStepIndex: number
  completedSteps: string[]
  brandColor: string
}

function StepProgress({
  steps,
  currentStepIndex,
  completedSteps,
  brandColor,
}: StepProgressProps) {
  const totalSteps = steps.length
  const completedCount = completedSteps.length
  const progressPercentage =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
        <span
          className="rounded-full px-2 py-1 text-sm font-medium"
          style={{
            backgroundColor: `${brandColor}20`,
            color: brandColor,
          }}
        >
          {progressPercentage}%
        </span>
      </div>

      <div className="mb-3 h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: brandColor,
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {completedCount} of {totalSteps} completed
        </span>
        <span>
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
      </div>
    </div>
  )
}

interface MobileStepItemProps {
  step: KitStep
  stepIndex: number
  isActive: boolean
  isCompleted: boolean
  isAccessible: boolean
  onClick: () => void
  brandColor: string
}

function MobileStepItem({
  step,
  stepIndex,
  isActive,
  isCompleted,
  isAccessible,
  onClick,
  brandColor,
}: MobileStepItemProps) {
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
      <span className="text-sm font-medium text-gray-600">{stepIndex + 1}</span>
    )
  }

  return (
    <button
      onClick={isAccessible ? onClick : undefined}
      disabled={!isAccessible}
      className={cn(
        'flex w-full items-center space-x-4 rounded-lg border p-4 text-left transition-all duration-200',
        isActive && 'border-blue-200 bg-blue-50',
        isCompleted && 'border-green-200 bg-green-50',
        !isActive &&
          !isCompleted &&
          isAccessible &&
          'border-gray-200 bg-white hover:bg-gray-50',
        !isAccessible &&
          'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
      )}
      style={{
        ...(isActive && {
          backgroundColor: `${brandColor}08`,
          borderColor: `${brandColor}30`,
        }),
      }}
    >
      {/* Step Number/Icon */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-medium transition-all duration-200',
          isCompleted && 'bg-green-500',
          isActive && 'shadow-sm',
          !isActive &&
            !isCompleted &&
            isAccessible &&
            'border border-gray-300 bg-gray-100',
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
        <h4
          className={cn(
            'truncate font-medium',
            isActive && 'text-gray-900',
            isCompleted && 'text-gray-900',
            !isActive && !isCompleted && isAccessible && 'text-gray-700',
            !isAccessible && 'text-gray-400'
          )}
        >
          {step.title}
        </h4>

        <div className="mt-1 flex items-center justify-between">
          <p className="truncate text-sm text-gray-500">
            {step.description || `Step ${stepIndex + 1} of onboarding`}
          </p>
          <div className="ml-2 flex items-center space-x-2">
            {step.is_required && (
              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                Required
              </span>
            )}
            {isCompleted && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Done
              </span>
            )}
            {isActive && (
              <span
                className="rounded-full px-2 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${brandColor}20`,
                  color: brandColor,
                }}
              >
                Current
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export function MobileNavigation({
  steps,
  currentStepIndex,
  completedSteps,
  onStepNavigate,
  onClose,
  isOpen,
  brandColor = '#3B82F6',
  className,
}: MobileNavigationProps) {
  const [isClosing, setIsClosing] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 150)
  }

  const handleStepClick = (stepIndex: number) => {
    onStepNavigate(stepIndex)
    handleClose()
  }

  const canGoToPrevious = currentStepIndex > 0
  const canGoToNext = currentStepIndex < steps.length - 1

  const handlePrevious = () => {
    if (canGoToPrevious) {
      onStepNavigate(currentStepIndex - 1)
      handleClose()
    }
  }

  const handleNext = () => {
    if (canGoToNext) {
      onStepNavigate(currentStepIndex + 1)
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity',
          isClosing ? 'opacity-0' : 'opacity-100'
        )}
        onClick={handleClose}
      />

      {/* Mobile Navigation Panel */}
      <div className={cn('fixed inset-0 z-50 flex lg:hidden', className)}>
        <div
          className={cn(
            'flex w-full max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-out',
            isClosing ? '-translate-x-full' : 'translate-x-0'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Menu className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Navigation
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Progress Overview */}
            <StepProgress
              steps={steps}
              currentStepIndex={currentStepIndex}
              completedSteps={completedSteps}
              brandColor={brandColor}
            />

            {/* Quick Navigation */}
            <div className="mb-6 flex space-x-2">
              <Button
                onClick={handlePrevious}
                disabled={!canGoToPrevious}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canGoToNext}
                size="sm"
                className="flex-1"
                style={{ backgroundColor: brandColor }}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Steps List */}
            <div>
              <h3 className="mb-4 text-sm font-medium text-gray-900">
                All Steps
              </h3>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id)
                  const isActive = index === currentStepIndex
                  const isAccessible = index <= currentStepIndex || isCompleted

                  return (
                    <MobileStepItem
                      key={step.id}
                      step={step}
                      stepIndex={index}
                      isActive={isActive}
                      isCompleted={isCompleted}
                      isAccessible={isAccessible}
                      onClick={() => handleStepClick(index)}
                      brandColor={brandColor}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="text-center">
              <p className="mb-2 text-sm text-gray-600">Need help?</p>
              <div className="flex justify-center space-x-4">
                <button className="text-xs text-blue-600 transition-colors hover:text-blue-800">
                  💬 Chat
                </button>
                <button className="text-xs text-blue-600 transition-colors hover:text-blue-800">
                  📧 Email
                </button>
                <button className="text-xs text-blue-600 transition-colors hover:text-blue-800">
                  📞 Call
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side (empty space) */}
        <div className="flex-1" onClick={handleClose} />
      </div>
    </>
  )
}
