'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { Tables } from '@/lib/supabase/database.types'

type ClientProgress = Tables<'client_progress'>

interface WelcomeMessageStepProps {
  step: KitStep
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: ClientProgress
  className?: string
}

export function WelcomeMessageStep({
  step,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
  progress,
  className,
}: WelcomeMessageStepProps) {
  const { content, title, description } = step
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [hasViewed, setHasViewed] = React.useState(false)

  // Check if user has already completed this step
  React.useEffect(() => {
    if (progress?.status === 'completed') {
      setIsCompleted(true)
      setHasViewed(true)
    }
  }, [progress])

  // Mark as viewed after a short delay (to ensure user has time to read)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasViewed) {
        setHasViewed(true)
        trackProgress('viewed')
      }
    }, 2000) // 2 second delay

    return () => clearTimeout(timer)
  }, [hasViewed])

  const trackProgress = async (action: string) => {
    try {
      await onComplete({
        step_id: step.id,
        response_data: {
          action,
          viewed_at: new Date().toISOString(),
        },
        status: action === 'completed' ? 'completed' : 'in_progress',
      })
    } catch (error) {
      console.error('Error tracking progress:', error)
    }
  }

  const handleContinue = async () => {
    if (!isCompleted) {
      setIsCompleted(true)
      await trackProgress('completed')
    }

    // Auto-advance if configured, otherwise require manual continue
    if (step.settings?.auto_advance && onNext) {
      onNext()
    } else if (onNext) {
      onNext()
    }
  }

  const welcomeMessage = content.instructions || ''

  return (
    <Card className={cn('mx-auto w-full max-w-3xl', className)}>
      <CardHeader className="pb-8 text-center">
        <CardTitle className="text-3xl font-bold text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="mt-3 text-lg text-gray-600">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Welcome Message Content */}
        {welcomeMessage && (
          <div className="prose prose-lg max-w-none">
            <div
              className="leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{ __html: welcomeMessage }}
            />
          </div>
        )}

        {/* Completion Indicator */}
        {isCompleted && (
          <div className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle className="mr-3 h-6 w-6 text-green-600" />
            <span className="font-medium text-green-800">
              Welcome message acknowledged
            </span>
          </div>
        )}

        {/* Progress Indicator for Required Steps */}
        {step.is_required && hasViewed && !isCompleted && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-800">
              Please click &quot;Continue&quot; to proceed to the next step.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-8">
          {onPrevious ? (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
              className="px-6 py-2"
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {/* Auto-advance or manual continue */}
          {step.settings?.auto_advance ? (
            hasViewed && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                Auto-advancing in 3 seconds...
              </div>
            )
          ) : (
            <Button
              type="button"
              onClick={handleContinue}
              disabled={isLoading || (!hasViewed && step.is_required)}
              className="px-8 py-2 text-base"
            >
              {isCompleted ? 'Continue' : 'Continue'}
            </Button>
          )}
        </div>

        {/* Skip option for non-required steps */}
        {!step.is_required &&
          !isCompleted &&
          onNext &&
          !step.settings?.auto_advance && (
            <div className="pt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onNext}
                disabled={isLoading}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip this step
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  )
}

// Hook for managing welcome message step state
export function useWelcomeMessageStep() {
  const [hasViewed, setHasViewed] = React.useState(false)
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [viewStartTime, setViewStartTime] = React.useState<number | null>(null)

  React.useEffect(() => {
    setViewStartTime(Date.now())
  }, [])

  const markAsViewed = () => {
    setHasViewed(true)
  }

  const markAsCompleted = () => {
    setIsCompleted(true)
  }

  const getTimeSpent = () => {
    if (!viewStartTime) return 0
    return Date.now() - viewStartTime
  }

  const reset = () => {
    setHasViewed(false)
    setIsCompleted(false)
    setViewStartTime(Date.now())
  }

  return {
    hasViewed,
    isCompleted,
    timeSpent: getTimeSpent(),
    markAsViewed,
    markAsCompleted,
    reset,
  }
}
