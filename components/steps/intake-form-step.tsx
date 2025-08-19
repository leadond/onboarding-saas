'use client'

import * as React from 'react'
import { FormRenderer } from '@/lib/forms/form-renderer'
import { HtmlFormRenderer } from '@/lib/forms/html-form-renderer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { Tables } from '@/lib/supabase/database.types'

type ClientProgress = Tables<'client_progress'>

interface IntakeFormStepProps {
  step: KitStep
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: ClientProgress
  className?: string
}

export function IntakeFormStep({
  step,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
  progress,
  className,
}: IntakeFormStepProps) {
  const { content, title, description } = step
  const formFields = content.form_fields || []
  const htmlForm = content.html_form

  // Get existing response data if available
  const defaultValues = React.useMemo(() => {
    if (progress?.response_data && typeof progress.response_data === 'object') {
      return progress.response_data as Record<string, any>
    }
    return {}
  }, [progress?.response_data])

  const handleSubmit = async (formData: any) => {
    try {
      await onComplete({
        step_id: step.id,
        response_data: formData,
        status: 'completed',
      })

      // Auto-advance if configured
      if (step.settings?.auto_advance && onNext) {
        onNext()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      throw error
    }
  }

  if (!formFields?.length && !htmlForm) {
    return (
      <Card className={cn('mx-auto w-full max-w-2xl', className)}>
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No form fields or HTML form have been configured for this step.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('mx-auto w-full max-w-2xl', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-2 text-base">
            {description}
          </CardDescription>
        )}
        {content.instructions && (
          <div
            className="prose prose-sm mt-4 max-w-none text-left"
            dangerouslySetInnerHTML={{ __html: content.instructions }}
          />
        )}
      </CardHeader>

      <CardContent>
        {htmlForm ? (
          <HtmlFormRenderer
            htmlForm={htmlForm}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            isLoading={isLoading}
            submitText={step.settings?.auto_advance ? 'Continue' : 'Submit'}
            className="space-y-6"
          />
        ) : (
          <FormRenderer
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            isLoading={isLoading}
            submitText={step.settings?.auto_advance ? 'Continue' : 'Submit'}
            className="space-y-6"
          />
        )}

        {/* Navigation buttons */}
        {(onPrevious || (!step.settings?.auto_advance && onNext)) && (
          <div className="flex items-center justify-between border-t pt-6">
            {onPrevious ? (
              <button
                type="button"
                onClick={onPrevious}
                disabled={isLoading}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {!step.settings?.auto_advance && onNext && (
              <button
                type="button"
                onClick={onNext}
                disabled={isLoading}
                className="rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for managing intake form step state
export function useIntakeFormStep() {
  const [submissionData, setSubmissionData] = React.useState<any>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleFormSubmit = async (
    onComplete: (data: any) => void | Promise<void>,
    data: any
  ) => {
    setIsSubmitting(true)
    try {
      setSubmissionData(data)
      await onComplete(data)
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submissionData,
    isSubmitting,
    handleFormSubmit,
  }
}
