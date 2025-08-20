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

import * as React from 'react'
import { WelcomeMessageStep } from '@/components/steps/welcome-message-step'
import { WelcomeVideoStep } from '@/components/steps/welcome-video-step'
import { IntakeFormStep } from '@/components/steps/intake-form-step'
import { FileUploadStep } from '@/components/steps/file-upload-step'
import { ContractStep } from '@/components/steps/contract-step'
import { SchedulingStep } from '@/components/steps/scheduling-step'
import { PaymentStep } from '@/components/steps/payment-step'
import { ConfirmationStep } from '@/components/steps/confirmation-step'
import { StepWrapper } from '@/components/steps/step-wrapper'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { KitStep, StepType, ClientProgress } from '@/types'
import type { Tables } from '@/types/supabase'


// Type imported from @/types/supabase

interface StepRendererProps {
  step: KitStep
  clientId?: string
  currentStepIndex: number
  totalSteps: number
  progress?: any
  clientData?: any
  kitData?: any
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  onSkip?: () => void
  isLoading?: boolean
  useWrapper?: boolean
  className?: string
}

interface StepComponentProps {
  step: KitStep
  clientId?: string
  clientData?: any
  kitData?: any
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: any
  className?: string
}

// Wrapper components for steps that need required props
function FileUploadStepWrapper(props: StepComponentProps) {
  // Provide a default clientId if not provided
  const clientId = props.clientId || 'anonymous'
  return <FileUploadStep {...props} clientId={clientId} />
}

// Map step types to their corresponding components
const STEP_COMPONENTS: Record<
  StepType,
  React.ComponentType<StepComponentProps>
> = {
  welcome_message: WelcomeMessageStep,
  welcome_video: WelcomeVideoStep,
  intake_form: IntakeFormStep,
  file_upload: FileUploadStepWrapper,
  contract_signing: (props: StepComponentProps) => ContractStep(props as any),
  scheduling: SchedulingStep,
  payment: PaymentStep,
  confirmation: ConfirmationStep,
}

// Default fallback component for unknown step types
function UnknownStepComponent({
  step,
  onNext,
  onPrevious,
  className,
}: StepComponentProps) {
  return (
    <Card className={cn('mx-auto w-full max-w-2xl', className)}>
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Unknown Step Type
        </CardTitle>
        <CardDescription>
          Step type &quot;{step.step_type}&quot; is not supported
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-gray-600">
          This step type is not recognized by the system. Please contact support
          for assistance.
        </p>
        <div className="flex justify-center space-x-4">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
            >
              Previous
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Skip Step
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function StepRenderer({
  step,
  clientId,
  currentStepIndex,
  totalSteps,
  progress,
  clientData,
  kitData,
  onComplete,
  onNext,
  onPrevious,
  onSkip,
  isLoading = false,
  useWrapper = true,
  className,
}: StepRendererProps) {
  // Get the appropriate component for this step type
  const StepComponent = STEP_COMPONENTS[step.step_type] || UnknownStepComponent

  // Common props for all step components
  const stepProps: StepComponentProps = {
    step,
    clientId,
    clientData,
    kitData,
    onComplete,
    onNext,
    onPrevious,
    isLoading,
    progress,
    className: useWrapper ? undefined : className,
  }

  // Render step with or without wrapper
  if (useWrapper) {
    return (
      <StepWrapper
        step={step}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        progress={progress}
        isLoading={isLoading}
        onNext={onNext}
        onPrevious={onPrevious}
        onSkip={onSkip}
        className={className}
      >
        <StepComponent {...stepProps} />
      </StepWrapper>
    )
  }

  return <StepComponent {...stepProps} />
}

// Hook for managing multiple steps rendering
export function useStepRenderer() {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
    new Set()
  )
  const [stepProgress, setStepProgress] = React.useState<
    Record<string, any>
  >({})

  const goToStep = (stepIndex: number, totalSteps: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStepIndex(stepIndex)
    }
  }

  const goNext = (totalSteps: number) => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const goPrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const markStepCompleted = (
    stepIndex: number,
    stepId: string,
    progress: any
  ) => {
    setCompletedSteps(prev => new Set(prev).add(stepIndex))
    setStepProgress(prev => ({
      ...prev,
      [stepId]: progress,
    }))
  }

  const isStepCompleted = (stepIndex: number): boolean => {
    return completedSteps.has(stepIndex)
  }

  const getStepProgress = (stepId: string): any | undefined => {
    return stepProgress[stepId]
  }

  const canAdvanceToStep = (
    targetStepIndex: number,
    steps: KitStep[]
  ): boolean => {
    // Check if all required previous steps are completed
    for (let i = 0; i < targetStepIndex; i++) {
      const step = steps[i]
      if (step?.is_required && !isStepCompleted(i)) {
        return false
      }
    }
    return true
  }

  const getCompletionRate = (totalSteps: number): number => {
    return totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0
  }

  const reset = () => {
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    setStepProgress({})
  }

  return {
    currentStepIndex,
    completedSteps: Array.from(completedSteps),
    stepProgress,
    goToStep,
    goNext,
    goPrevious,
    markStepCompleted,
    isStepCompleted,
    getStepProgress,
    canAdvanceToStep,
    getCompletionRate,
    reset,
  }
}

// Utility functions for step rendering
export const stepUtils = {
  /**
   * Validate if a step has all required configuration
   */
  validateStepConfiguration: (
    step: KitStep
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!step.title || step.title.trim() === '') {
      errors.push('Step title is required')
    }

    switch (step.step_type) {
      case 'welcome_message':
        if (
          !step.content.instructions ||
          step.content.instructions.trim() === ''
        ) {
          errors.push('Welcome message content is required')
        }
        break

      case 'welcome_video':
        if (!step.content.video_url && !step.content.instructions) {
          errors.push('Video URL or instructions are required')
        }
        break

      case 'intake_form':
        if (
          !step.content.form_fields?.length &&
          !step.content.html_form?.html_content
        ) {
          errors.push('At least one form field or HTML form is required')
        }
        break

      case 'file_upload':
        if (!step.content.upload_config) {
          errors.push('Upload configuration is required')
        }
        break

      case 'contract_signing':
        if (!step.content.contract_template) {
          errors.push('Contract template is required')
        }
        break

      case 'scheduling':
        if (!step.content.calendar_config) {
          errors.push('Calendar configuration is required')
        }
        break

      case 'payment':
        if (!step.content.payment_config) {
          errors.push('Payment configuration is required')
        }
        break

      case 'confirmation':
        // Confirmation steps don't require specific configuration
        break

      default:
        errors.push(`Unknown step type: ${step.step_type}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Get display information for a step type
   */
  getStepTypeInfo: (stepType: StepType) => {
    const stepTypeInfo = {
      welcome_message: {
        name: 'Welcome Message',
        description: 'Display a welcome message to clients',
        icon: '👋',
        category: 'Introduction',
      },
      welcome_video: {
        name: 'Welcome Video',
        description: 'Show a welcome video or message',
        icon: '🎥',
        category: 'Introduction',
      },
      intake_form: {
        name: 'Intake Form',
        description: 'Collect information from clients with a custom form',
        icon: '📝',
        category: 'Data Collection',
      },
      file_upload: {
        name: 'File Upload',
        description: 'Allow clients to upload files and documents',
        icon: '📁',
        category: 'Data Collection',
      },
      contract_signing: {
        name: 'Contract Signing',
        description: 'Enable clients to sign contracts electronically',
        icon: '✍️',
        category: 'Legal',
      },
      scheduling: {
        name: 'Scheduling',
        description: 'Let clients schedule meetings or appointments',
        icon: '📅',
        category: 'Coordination',
      },
      payment: {
        name: 'Payment',
        description: 'Collect payments from clients',
        icon: '💳',
        category: 'Transaction',
      },
      confirmation: {
        name: 'Confirmation',
        description: 'Display confirmation and next steps',
        icon: '✅',
        category: 'Completion',
      },
    }

    return (
      stepTypeInfo[stepType] || {
        name: stepType,
        description: 'Unknown step type',
        icon: '❓',
        category: 'Unknown',
      }
    )
  },

  /**
   * Calculate estimated time for a step based on its type and configuration
   */
  estimateStepDuration: (step: KitStep): number => {
    const baseTimes = {
      welcome_message: 30, // 30 seconds
      welcome_video: 120, // 2 minutes
      intake_form: 300, // 5 minutes base
      file_upload: 180, // 3 minutes
      contract_signing: 600, // 10 minutes
      scheduling: 240, // 4 minutes
      payment: 120, // 2 minutes
      confirmation: 30, // 30 seconds
    }

    let baseTime = baseTimes[step.step_type] || 60

    // Adjust based on step configuration
    if (step.step_type === 'intake_form') {
      if (step.content.form_fields) {
        baseTime += step.content.form_fields.length * 30 // 30 seconds per field
      } else if (step.content.html_form?.html_content) {
        // Estimate based on HTML form complexity
        const htmlContent = step.content.html_form.html_content
        const inputCount = (htmlContent.match(/<(input|textarea|select)/g) || []).length
        baseTime += inputCount * 30 // 30 seconds per input field
      }
    }

    return baseTime
  },
}
