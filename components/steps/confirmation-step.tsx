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
import {
  CheckCircle2,
  Download,
  Calendar,
  Mail,
  Phone,
  FileText,
  Clock,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { Database } from '@/lib/supabase/database.types'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

type ClientProgress = Tables<'client_progress'>

interface ConfirmationStepProps {
  step: KitStep
  kitData?: any
  clientData?: any
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: ClientProgress
  className?: string
}

interface CompletionSummaryProps {
  title: string
  items: CompletionItem[]
}

interface CompletionItem {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
  status?: 'completed' | 'pending' | 'failed'
}

function CompletionSummary({ title, items }: CompletionSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
              <div className="mt-1 text-sm text-gray-600">{item.value}</div>
              {item.status && (
                <div
                  className={cn(
                    'mt-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                    item.status === 'completed' &&
                      'bg-green-100 text-green-800',
                    item.status === 'pending' &&
                      'bg-yellow-100 text-yellow-800',
                    item.status === 'failed' && 'bg-red-100 text-red-800'
                  )}
                >
                  {item.status === 'completed' && (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  )}
                  {item.status === 'pending' && (
                    <Clock className="mr-1 h-3 w-3" />
                  )}
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConfirmationStep({
  step,
  kitData,
  clientData,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
  progress,
  className,
}: ConfirmationStepProps) {
  const { content, title, description } = step
  const [isCompleted, setIsCompleted] = React.useState(false)

  // Check if user has already completed this step
  React.useEffect(() => {
    if (progress?.status === 'completed') {
      setIsCompleted(true)
    }
  }, [progress])

  // Auto-complete this step since it's just a confirmation
  React.useEffect(() => {
    if (!isCompleted) {
      handleComplete()
    }
  }, [isCompleted])

  const handleComplete = async () => {
    try {
      setIsCompleted(true)
      await onComplete({
        step_id: step.id,
        response_data: {
          completed_at: new Date().toISOString(),
          confirmation_viewed: true,
        },
        status: 'completed',
      })
    } catch (error) {
      console.error('Error completing confirmation step:', error)
    }
  }

  const handleFinish = () => {
    if (onNext) {
      onNext()
    } else {
      // Redirect to completion URL if specified
      if (kitData?.completion_redirect_url) {
        window.location.href = kitData.completion_redirect_url
      }
    }
  }

  // Generate completion summary from client data
  const generateCompletionSummary = (): CompletionItem[] => {
    const items: CompletionItem[] = []

    if (clientData?.name) {
      items.push({
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        label: 'Contact Information',
        value: `${clientData.name}${clientData.email ? ` (${clientData.email})` : ''}`,
        status: 'completed',
      })
    }

    if (clientData?.files && clientData.files.length > 0) {
      items.push({
        icon: <FileText className="h-5 w-5 text-blue-500" />,
        label: 'Documents Uploaded',
        value: `${clientData.files.length} file(s) uploaded`,
        status: 'completed',
      })
    }

    if (clientData?.meeting) {
      const meetingDate = new Date(
        clientData.meeting.startTime
      ).toLocaleString()
      items.push({
        icon: <Calendar className="h-5 w-5 text-purple-500" />,
        label: 'Meeting Scheduled',
        value: meetingDate,
        status: 'completed',
      })
    }

    if (clientData?.contract) {
      items.push({
        icon: <FileText className="h-5 w-5 text-indigo-500" />,
        label: 'Contract',
        value:
          clientData.contract.status === 'completed'
            ? 'Signed'
            : 'Pending signature',
        status:
          clientData.contract.status === 'completed' ? 'completed' : 'pending',
      })
    }

    return items
  }

  const completionItems = generateCompletionSummary()

  return (
    <Card className={cn('mx-auto w-full max-w-4xl', className)}>
      <CardHeader className="pb-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>
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
        {/* Confirmation Message */}
        {content.instructions && (
          <div className="text-center">
            <div
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content.instructions }}
            />
          </div>
        )}

        {/* Success Message */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <h3 className="mb-2 text-xl font-semibold text-green-800">
            🎉 Onboarding Complete!
          </h3>
          <p className="text-green-700">
            Thank you for completing the onboarding process. We have received
            all your information and will be in touch soon.
          </p>
        </div>

        {/* Completion Summary */}
        {completionItems.length > 0 && (
          <CompletionSummary
            title="What You've Completed"
            items={completionItems}
          />
        )}

        {/* Next Steps */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-blue-900">
            What Happens Next?
          </h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start space-x-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium">Email Confirmation</p>
                <p className="text-sm text-blue-700">
                  You&apos;ll receive a confirmation email with all the details
                  shortly.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-medium">We&apos;ll Be In Touch</p>
                <p className="text-sm text-blue-700">
                  Our team will contact you within 24-48 hours to get started.
                </p>
              </div>
            </div>
            {clientData?.meeting && (
              <div className="flex items-start space-x-3">
                <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="font-medium">Scheduled Meeting</p>
                  <p className="text-sm text-blue-700">
                    Don&apos;t forget about your scheduled meeting on{' '}
                    {new Date(
                      clientData.meeting.startTime
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Download Summary (Optional) */}
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Generate and download summary PDF
              console.log('Download summary clicked')
            }}
            className="mr-4"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Summary
          </Button>
        </div>

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

          <Button
            type="button"
            onClick={handleFinish}
            disabled={isLoading}
            className="bg-green-600 px-8 py-3 text-base text-white hover:bg-green-700"
          >
            {kitData?.completion_redirect_url
              ? 'Continue to Next Steps'
              : 'Finish'}
          </Button>
        </div>

        {/* Contact Information */}
        <div className="border-t pt-4 text-center text-sm text-gray-500">
          <p>
            Have questions? Contact us at{' '}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:text-blue-800"
            >
              support@example.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing confirmation step state
export function useConfirmationStep() {
  const [isCompleted, setIsCompleted] = React.useState(false)
  const [completionData, setCompletionData] = React.useState<any>(null)

  const markAsCompleted = (data?: any) => {
    setIsCompleted(true)
    if (data) {
      setCompletionData(data)
    }
  }

  const generateSummary = (clientData: any) => {
    return {
      completedAt: new Date().toISOString(),
      totalSteps: Object.keys(clientData).length,
      clientInfo: clientData,
    }
  }

  return {
    isCompleted,
    completionData,
    markAsCompleted,
    generateSummary,
  }
}
