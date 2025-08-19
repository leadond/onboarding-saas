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
  Calendar,
  TrendingUp,
  Award,
  Target,
  Zap,
  Flag,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { KitStep } from '@/types'
import type { Tables } from '@/lib/supabase/database.types'
import type { ProgressTrends } from '@/lib/progress/progress-calculator'
import { cn } from '@/lib/utils/cn'

type ClientProgress = Tables<'client_progress'>

interface CompletionTimelineProps {
  steps: KitStep[]
  progressData: Record<string, ClientProgress>
  trends?: ProgressTrends
  brandColor?: string
  showFuture?: boolean
  showStats?: boolean
  className?: string
}

interface TimelineEvent {
  id: string
  type: 'step_completed' | 'milestone' | 'streak' | 'future_step'
  stepId?: string
  title: string
  description: string
  date: Date
  status: 'completed' | 'current' | 'upcoming'
  icon: React.ComponentType<{ className?: string }>
  color: string
  timeSpent?: number
}

interface TimelineItemProps {
  event: TimelineEvent
  isLast: boolean
  brandColor: string
  animate?: boolean
}

function TimelineItem({
  event,
  isLast,
  brandColor,
  animate = true,
}: TimelineItemProps) {
  const [isVisible, setIsVisible] = useState(!animate)

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setIsVisible(true), Math.random() * 500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [animate])

  const getStatusStyles = () => {
    switch (event.status) {
      case 'completed':
        return {
          iconBg: event.color,
          iconColor: 'white',
          lineColor: event.color,
          textColor: 'text-gray-900',
          opacity: 'opacity-100',
        }
      case 'current':
        return {
          iconBg: brandColor,
          iconColor: 'white',
          lineColor: brandColor,
          textColor: 'text-gray-900',
          opacity: 'opacity-100',
        }
      default:
        return {
          iconBg: '#F3F4F6',
          iconColor: '#9CA3AF',
          lineColor: '#E5E7EB',
          textColor: 'text-gray-500',
          opacity: 'opacity-75',
        }
    }
  }

  const styles = getStatusStyles()
  const IconComponent = event.icon

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return minutes > 0 ? `${minutes}m` : `${seconds}s`
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (event.status === 'upcoming') {
      return 'Coming up'
    }

    if (diffDays === 0) {
      if (diffHours === 0) {
        if (diffMinutes === 0) {
          return 'Just now'
        }
        return `${diffMinutes}m ago`
      }
      return `${diffHours}h ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  return (
    <div
      className={cn(
        'relative flex items-start space-x-4 transition-all duration-500',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
        styles.opacity
      )}
    >
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-6 top-12 h-16 w-0.5 -translate-x-1/2"
          style={{ backgroundColor: styles.lineColor }}
        />
      )}

      {/* Icon */}
      <div
        className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm"
        style={{ backgroundColor: styles.iconBg }}
      >
        <div style={{ color: styles.iconColor }}>
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Pulse animation for current item */}
        {event.status === 'current' && (
          <div
            className="absolute inset-0 animate-ping rounded-full"
            style={{ backgroundColor: `${brandColor}40` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-8">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className={cn('font-semibold', styles.textColor)}>
              {event.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{event.description}</p>

            {/* Additional info */}
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>{formatDate(event.date)}</span>
              {event.timeSpent && (
                <>
                  <span>•</span>
                  <span>{formatTime(event.timeSpent)} spent</span>
                </>
              )}
            </div>
          </div>

          {/* Status badge */}
          {event.status === 'completed' && (
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-1 rounded-full bg-green-50 px-2 py-1 text-xs text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>Done</span>
              </div>
            </div>
          )}

          {event.status === 'current' && (
            <div className="flex-shrink-0">
              <div
                className="flex items-center space-x-1 rounded-full px-2 py-1 text-xs"
                style={{
                  backgroundColor: `${brandColor}10`,
                  color: brandColor,
                }}
              >
                <Clock className="h-3 w-3" />
                <span>Current</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface TimelineStatsProps {
  events: TimelineEvent[]
  brandColor: string
}

function TimelineStats({ events, brandColor }: TimelineStatsProps) {
  const completedEvents = events.filter(e => e.status === 'completed')
  const totalTimeSpent = completedEvents.reduce(
    (sum, e) => sum + (e.timeSpent || 0),
    0
  )
  const avgTimePerStep =
    completedEvents.length > 0 ? totalTimeSpent / completedEvents.length : 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const completedToday = completedEvents.filter(e => {
    const eventDate = new Date(e.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate.getTime() === today.getTime()
  }).length

  // Calculate streak
  let currentStreak = 0
  const sortedCompletions = completedEvents
    .map(e => new Date(e.date))
    .sort((a, b) => b.getTime() - a.getTime())

  if (sortedCompletions.length > 0) {
    currentStreak = 1
    const firstCompletion = sortedCompletions[0]
    if (!firstCompletion) return currentStreak

    let currentDate = new Date(firstCompletion)
    currentDate.setHours(0, 0, 0, 0)

    for (let i = 1; i < sortedCompletions.length; i++) {
      const completion = sortedCompletions[i]
      if (!completion) continue

      const eventDate = new Date(completion)
      eventDate.setHours(0, 0, 0, 0)

      const dayDiff = Math.floor(
        (currentDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (dayDiff === 1) {
        currentStreak++
        currentDate = eventDate
      } else if (dayDiff > 1) {
        break
      }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  const stats = [
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: completedEvents.length,
      color: '#22C55E',
    },
    {
      icon: Clock,
      label: 'Time Spent',
      value: formatTime(totalTimeSpent),
      color: brandColor,
    },
    {
      icon: Target,
      label: 'Avg per Step',
      value: formatTime(avgTimePerStep),
      color: '#8B5CF6',
    },
    {
      icon: Zap,
      label: 'Streak',
      value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`,
      color: '#F59E0B',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-white p-4 text-center"
        >
          <div
            className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
          </div>
          <div className="text-lg font-bold text-gray-900">{stat.value}</div>
          <div className="text-xs text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export function CompletionTimeline({
  steps,
  progressData,
  trends,
  brandColor = '#3B82F6',
  showFuture = true,
  showStats = true,
  className,
}: CompletionTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])

  useEffect(() => {
    const generateEvents = () => {
      const timelineEvents: TimelineEvent[] = []

      // Add step completion events
      steps.forEach(step => {
        const progress = progressData[step.id]

        if (
          progress &&
          progress.status === 'completed' &&
          progress.completed_at
        ) {
          timelineEvents.push({
            id: `step_${step.id}`,
            type: 'step_completed',
            stepId: step.id,
            title: step.title,
            description: `Completed ${step.step_type.replace('_', ' ')}`,
            date: new Date(progress.completed_at),
            status: 'completed',
            icon: CheckCircle2,
            color: '#22C55E',
            timeSpent: progress.time_spent || 0,
          })
        }
      })

      // Add milestone events
      const completedCount = timelineEvents.length
      const totalSteps = steps.length

      const milestones = [
        {
          threshold: Math.ceil(totalSteps * 0.25),
          title: 'First Quarter Complete!',
          icon: Target,
        },
        {
          threshold: Math.ceil(totalSteps * 0.5),
          title: 'Halfway Milestone!',
          icon: Flag,
        },
        {
          threshold: Math.ceil(totalSteps * 0.75),
          title: 'Three Quarters Done!',
          icon: Award,
        },
        { threshold: totalSteps, title: 'Onboarding Complete!', icon: Award },
      ]

      milestones.forEach(milestone => {
        if (completedCount >= milestone.threshold) {
          // Find the completion date of the step that triggered this milestone
          const sortedCompletions = timelineEvents.sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          )

          const triggerEvent = sortedCompletions[milestone.threshold - 1]
          if (triggerEvent) {
            timelineEvents.push({
              id: `milestone_${milestone.threshold}`,
              type: 'milestone',
              title: milestone.title,
              description: `Reached ${milestone.threshold} completed step${milestone.threshold > 1 ? 's' : ''}`,
              date: new Date(triggerEvent.date.getTime() + 1000), // 1 second after trigger
              status: 'completed',
              icon: milestone.icon,
              color: brandColor,
            })
          }
        }
      })

      // Add streak events if trends data is available
      if (trends && trends.dailyProgress.length > 0) {
        // Find significant streaks (3+ days)
        let currentStreak = 0
        let streakStart: Date | null = null

        const sortedDays = trends.dailyProgress
          .filter(day => day.stepsCompleted > 0)
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )

        for (let i = 0; i < sortedDays.length; i++) {
          const currentDay = sortedDays[i]
          const previousDay = i > 0 ? sortedDays[i - 1] : null

          if (!currentDay) continue

          const current = new Date(currentDay.date)
          const previous = previousDay ? new Date(previousDay.date) : null

          if (
            !previous ||
            current.getTime() - previous.getTime() === 24 * 60 * 60 * 1000
          ) {
            if (currentStreak === 0) {
              streakStart = current
            }
            currentStreak++
          } else {
            if (currentStreak >= 3 && streakStart) {
              timelineEvents.push({
                id: `streak_${streakStart.getTime()}`,
                type: 'streak',
                title: `${currentStreak} Day Streak!`,
                description: `Completed steps for ${currentStreak} consecutive days`,
                date: new Date(current.getTime() - 24 * 60 * 60 * 1000), // End of streak
                status: 'completed',
                icon: Zap,
                color: '#F59E0B',
              })
            }
            currentStreak = 1
            streakStart = current
          }
        }
      }

      // Add future steps if enabled
      if (showFuture) {
        const nextIncompleteStep = steps.find(
          step =>
            !progressData[step.id] ||
            progressData[step.id]?.status !== 'completed'
        )

        if (nextIncompleteStep) {
          timelineEvents.push({
            id: `future_${nextIncompleteStep.id}`,
            type: 'future_step',
            stepId: nextIncompleteStep.id,
            title: `Next: ${nextIncompleteStep.title}`,
            description: `Upcoming ${nextIncompleteStep.step_type.replace('_', ' ')} step`,
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            status: 'upcoming',
            icon: Calendar,
            color: '#6B7280',
          })
        }
      }

      // Sort all events by date
      return timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime())
    }

    setEvents(generateEvents())
  }, [steps, progressData, trends, brandColor, showFuture])

  if (events.length === 0) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Your Timeline Will Appear Here
        </h3>
        <p className="text-gray-600">
          Complete your first step to start building your progress timeline.
        </p>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats */}
      {showStats && <TimelineStats events={events} brandColor={brandColor} />}

      {/* Timeline */}
      <Card className="p-6">
        <div className="mb-6 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" style={{ color: brandColor }} />
          <h3 className="text-lg font-semibold text-gray-900">
            Progress Timeline
          </h3>
        </div>

        <div className="space-y-0">
          {events.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
              brandColor={brandColor}
              animate={true}
            />
          ))}
        </div>

        {/* Empty state for no completed events */}
        {events.every(e => e.status === 'upcoming') && (
          <div className="py-8 text-center text-gray-500">
            <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Your progress timeline will build as you complete steps.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
