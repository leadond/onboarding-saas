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

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Eye,
  SkipForward,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { KitStep } from '@/types'
import type { Database } from '@/lib/supabase/database.types'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
import { cn } from '@/lib/utils/cn'

type ClientProgress = Tables<'client_progress'>

export type StepStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped'

interface StepProgressCardProps {
  step: KitStep
  progress?: ClientProgress | null
  stepNumber: number
  totalSteps: number
  isActive?: boolean
  isAccessible?: boolean
  onStepClick?: () => void
  onPreview?: () => void
  onEdit?: () => void
  onSkip?: () => void
  showActions?: boolean
  brandColor?: string
  className?: string
}

interface StepStatusBadgeProps {
  status: StepStatus
  isRequired: boolean
  brandColor: string
}

function StepStatusBadge({
  status,
  isRequired,
  brandColor,
}: StepStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          text: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200',
          iconColor: '#22C55E',
        }
      case 'in_progress':
        return {
          icon: Clock,
          text: 'In Progress',
          className: 'border-blue-200 text-blue-800',
          backgroundColor: `${brandColor}10`,
          iconColor: brandColor,
        }
      case 'skipped':
        return {
          icon: SkipForward,
          text: 'Skipped',
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          iconColor: '#6B7280',
        }
      default:
        return {
          icon: PlayCircle,
          text: isRequired ? 'Required' : 'Optional',
          className: isRequired
            ? 'bg-orange-100 text-orange-800 border-orange-200'
            : 'bg-gray-100 text-gray-600 border-gray-200',
          iconColor: isRequired ? '#F97316' : '#6B7280',
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-1 rounded-full border px-2 py-1 text-xs font-medium',
        config.className
      )}
      style={{ backgroundColor: config.backgroundColor }}
    >
      <IconComponent className="h-3 w-3" style={{ color: config.iconColor }} />
      <span>{config.text}</span>
    </div>
  )
}

interface ProgressBarProps {
  percentage: number
  color: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

function ProgressBar({
  percentage,
  color,
  size = 'md',
  animated = true,
}: ProgressBarProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setAnimatedPercentage(percentage), 200)
      return () => clearTimeout(timer)
    } else {
      setAnimatedPercentage(percentage)
    }
    return undefined
  }, [percentage, animated])

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-gray-200',
        heights[size]
      )}
    >
      <div
        className={cn(
          'rounded-full transition-all duration-500 ease-out',
          heights[size]
        )}
        style={{
          width: `${animatedPercentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )
}

interface TimeDisplayProps {
  timeSpent?: number
  estimatedTime?: number
  className?: string
}

function TimeDisplay({
  timeSpent = 0,
  estimatedTime,
  className,
}: TimeDisplayProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes === 0) {
      return `${remainingSeconds}s`
    } else if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
  }

  if (!timeSpent && !estimatedTime) return null

  return (
    <div
      className={cn(
        'flex items-center space-x-2 text-xs text-gray-500',
        className
      )}
    >
      <Clock className="h-3 w-3" />
      <span>
        {timeSpent > 0 && `${formatTime(timeSpent)} spent`}
        {timeSpent > 0 && estimatedTime && ' • '}
        {estimatedTime && `~${formatTime(estimatedTime)} est.`}
      </span>
    </div>
  )
}

export function StepProgressCard({
  step,
  progress,
  stepNumber,
  totalSteps,
  isActive = false,
  isAccessible = true,
  onStepClick,
  onPreview,
  onEdit,
  onSkip,
  showActions = false,
  brandColor = '#3B82F6',
  className,
}: StepProgressCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const status: StepStatus = (progress?.status as StepStatus) || 'not_started'
  const timeSpent = progress?.time_spent || 0
  const startedAt = progress?.started_at
  const completedAt = progress?.completed_at

  // Calculate estimated time (this would ideally come from analytics)
  const getEstimatedTime = (): number => {
    switch (step.step_type) {
      case 'welcome_message':
        return 120 // 2 minutes
      case 'welcome_video':
        return 300 // 5 minutes
      case 'intake_form':
        return 600 // 10 minutes
      case 'file_upload':
        return 300 // 5 minutes
      case 'contract_signing':
        return 900 // 15 minutes
      case 'scheduling':
        return 180 // 3 minutes
      case 'payment':
        return 240 // 4 minutes
      case 'confirmation':
        return 60 // 1 minute
      default:
        return 300 // 5 minutes default
    }
  }

  const estimatedTime = getEstimatedTime()
  const progressPercentage =
    status === 'completed'
      ? 100
      : status === 'in_progress'
        ? Math.min(90, (timeSpent / estimatedTime) * 100)
        : 0

  const getStepIcon = () => {
    if (status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
    if (status === 'in_progress') {
      return <Clock className="h-5 w-5" style={{ color: brandColor }} />
    }
    if (!isAccessible) {
      return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
    return (
      <div
        className="flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-medium"
        style={{
          borderColor: isActive ? brandColor : '#D1D5DB',
          backgroundColor: isActive ? brandColor : 'white',
          color: isActive ? 'white' : '#6B7280',
        }}
      >
        {stepNumber}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <Card
      className={cn(
        'cursor-pointer p-4 transition-all duration-200 hover:shadow-md',
        isActive && 'ring-2 ring-offset-2',
        !isAccessible && 'cursor-not-allowed opacity-60',
        className
      )}
      style={
        isActive
          ? ({
              '--tw-ring-color': `${brandColor}50`,
            } as React.CSSProperties)
          : undefined
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isAccessible ? onStepClick : undefined}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-start space-x-3">
            {/* Step Icon */}
            <div className="mt-0.5 flex-shrink-0">{getStepIcon()}</div>

            {/* Step Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      'truncate font-semibold text-gray-900',
                      !isAccessible && 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {step.description}
                    </p>
                  )}
                </div>

                <div className="ml-3 flex items-center space-x-2">
                  <StepStatusBadge
                    status={status}
                    isRequired={step.is_required}
                    brandColor={brandColor}
                  />

                  {showActions && (
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={e => {
                          e.stopPropagation()
                          setShowMenu(!showMenu)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {showMenu && (
                        <div className="absolute right-0 top-9 z-10 min-w-32 rounded-lg border bg-white py-1 shadow-lg">
                          {onPreview && (
                            <button
                              className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              onClick={e => {
                                e.stopPropagation()
                                onPreview()
                                setShowMenu(false)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                              <span>Preview</span>
                            </button>
                          )}
                          {onEdit && (
                            <button
                              className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                              onClick={e => {
                                e.stopPropagation()
                                onEdit()
                                setShowMenu(false)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                          )}
                          {onSkip &&
                            !step.is_required &&
                            status !== 'completed' && (
                              <button
                                className="flex w-full items-center space-x-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                                onClick={e => {
                                  e.stopPropagation()
                                  onSkip()
                                  setShowMenu(false)
                                }}
                              >
                                <SkipForward className="h-4 w-4" />
                                <span>Skip</span>
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {(status === 'in_progress' || status === 'completed') && (
          <div className="space-y-2">
            <ProgressBar
              percentage={progressPercentage}
              color={status === 'completed' ? '#22C55E' : brandColor}
              animated={isHovered}
            />
            {status === 'in_progress' && progressPercentage < 100 && (
              <p className="text-xs text-gray-500">
                {Math.round(progressPercentage)}% complete
              </p>
            )}
          </div>
        )}

        {/* Time and Date Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <TimeDisplay
            timeSpent={timeSpent}
            estimatedTime={status === 'not_started' ? estimatedTime : undefined}
          />

          <div className="flex items-center space-x-3">
            {startedAt && status !== 'not_started' && (
              <span>Started {formatDate(startedAt)}</span>
            )}
            {completedAt && status === 'completed' && (
              <span className="text-green-600">
                Completed {formatDate(completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Step Type Info */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="text-xs capitalize text-gray-500">
            {step.step_type.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Click overlay for better UX */}
      {showMenu && (
        <div className="z-5 fixed inset-0" onClick={() => setShowMenu(false)} />
      )}
    </Card>
  )
}
