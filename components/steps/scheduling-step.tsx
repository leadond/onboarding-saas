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
import { Calendar, Clock, User, Mail, MessageSquare } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  calendarIntegration,
  type CalendarConfig,
  type AvailabilitySlot,
  type SchedulingData,
} from '@/lib/integrations/calendar-integration'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { Tables } from '@/lib/supabase/database.types'

type ClientProgress = Tables<'client_progress'>

interface SchedulingStepProps {
  step: KitStep
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: ClientProgress
  className?: string
}

interface TimeSlotProps {
  slot: AvailabilitySlot
  selected: boolean
  onSelect: (slot: AvailabilitySlot) => void
  disabled?: boolean
}

function TimeSlot({
  slot,
  selected,
  onSelect,
  disabled = false,
}: TimeSlotProps) {
  const startTime = new Date(slot.startTime)
  const timeString = startTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      disabled={disabled || !slot.available}
      className={cn(
        'flex items-center justify-center rounded-md border p-3 text-sm font-medium transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : slot.available
            ? 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <Clock className="mr-2 h-4 w-4" />
      {timeString}
    </button>
  )
}

export function SchedulingStep({
  step,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
  progress,
  className,
}: SchedulingStepProps) {
  const { content, title, description } = step
  const calendarConfig = content.calendar_config as CalendarConfig

  const [selectedDate, setSelectedDate] = React.useState<string>('')
  const [selectedSlot, setSelectedSlot] =
    React.useState<AvailabilitySlot | null>(null)
  const [availableSlots, setAvailableSlots] = React.useState<
    AvailabilitySlot[]
  >([])
  const [attendeeName, setAttendeeName] = React.useState('')
  const [attendeeEmail, setAttendeeEmail] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false)
  const [isScheduling, setIsScheduling] = React.useState(false)
  const [scheduledMeeting, setScheduledMeeting] = React.useState<any>(null)

  // Load existing meeting if step is completed
  React.useEffect(() => {
    if (progress?.status === 'completed' && progress.response_data) {
      const meetingData = progress.response_data as any
      setScheduledMeeting(meetingData.meeting)
      setAttendeeName(meetingData.attendee_name || '')
      setAttendeeEmail(meetingData.attendee_email || '')
      setMessage(meetingData.message || '')
    }
  }, [progress])

  // Load available slots when date changes
  React.useEffect(() => {
    if (selectedDate && calendarConfig) {
      loadAvailableSlots(selectedDate)
    }
  }, [selectedDate, calendarConfig])

  const loadAvailableSlots = async (date: string) => {
    if (!calendarConfig) return

    setIsLoadingSlots(true)
    try {
      const startDate = `${date}T00:00:00Z`
      const endDate = `${date}T23:59:59Z`

      const slots = await calendarIntegration.getAvailableSlots(
        calendarConfig,
        startDate,
        endDate
      )

      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading available slots:', error)
      setAvailableSlots([])
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleScheduleMeeting = async () => {
    if (!selectedSlot || !calendarConfig || !attendeeName || !attendeeEmail) {
      return
    }

    setIsScheduling(true)
    try {
      const schedulingData: SchedulingData = {
        eventTitle: title,
        duration: calendarConfig.duration,
        attendeeName,
        attendeeEmail,
        selectedDate,
        selectedTime: new Date(selectedSlot.startTime).toLocaleTimeString(
          'en-US',
          {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          }
        ),
        timeZone:
          calendarConfig.timezone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        message,
      }

      const meeting = await calendarIntegration.scheduleMeeting(
        calendarConfig,
        schedulingData
      )
      setScheduledMeeting(meeting)

      // Save progress
      await onComplete({
        step_id: step.id,
        response_data: {
          meeting,
          attendee_name: attendeeName,
          attendee_email: attendeeEmail,
          message,
          selected_slot: selectedSlot,
          scheduled_at: new Date().toISOString(),
        },
        status: 'completed',
      })

      // Auto-advance if configured
      if (step.settings?.auto_advance && onNext) {
        setTimeout(() => {
          onNext()
        }, 2000)
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error)
    } finally {
      setIsScheduling(false)
    }
  }

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot)
  }

  const generateDateOptions = () => {
    const dates = []
    const today = new Date()

    // Generate next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip weekends for simplicity (can be configured)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        })
      }
    }

    return dates
  }

  const canSchedule =
    selectedSlot && attendeeName && attendeeEmail && !isScheduling

  if (!calendarConfig) {
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
            Calendar configuration has not been set up for this step.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Show scheduled meeting if already completed
  if (scheduledMeeting) {
    return (
      <Card className={cn('mx-auto w-full max-w-2xl', className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="mt-2 text-base">
            Your meeting has been scheduled!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="mb-4 flex items-center">
              <Calendar className="mr-3 h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">
                Meeting Scheduled
              </h3>
            </div>

            <div className="space-y-3 text-sm text-green-700">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>
                  {new Date(scheduledMeeting.startTime).toLocaleString(
                    'en-US',
                    {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    }
                  )}
                </span>
              </div>

              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Duration: {calendarConfig.duration} minutes</span>
              </div>

              {scheduledMeeting.meetingUrl && (
                <div className="mt-4 rounded border bg-white p-3">
                  <p className="mb-2 font-medium text-green-800">
                    Meeting Link:
                  </p>
                  <a
                    href={scheduledMeeting.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-blue-600 underline hover:text-blue-800"
                  >
                    {scheduledMeeting.meetingUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t pt-6">
            {onPrevious ? (
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            {onNext && (
              <Button type="button" onClick={onNext} disabled={isLoading}>
                Continue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('mx-auto w-full max-w-4xl', className)}>
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

      <CardContent className="space-y-6">
        {/* Meeting Information */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">
            Meeting Details
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>Duration: {calendarConfig.duration} minutes</span>
            </div>
            {calendarConfig.provider && (
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  Platform:{' '}
                  {calendarConfig.provider.charAt(0).toUpperCase() +
                    calendarConfig.provider.slice(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Select Date */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">1. Select a Date</Label>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          >
            <option value="">Choose a date...</option>
            {generateDateOptions().map(date => (
              <option key={date.value} value={date.value}>
                {date.label}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Time */}
        {selectedDate && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">2. Select a Time</Label>
            {isLoadingSlots ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="md" className="mr-3" />
                <span>Loading available times...</span>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                {availableSlots.map((slot, index) => (
                  <TimeSlot
                    key={index}
                    slot={slot}
                    selected={selectedSlot?.startTime === slot.startTime}
                    onSelect={handleSlotSelect}
                    disabled={isLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No available time slots for this date.
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contact Information */}
        {selectedSlot && (
          <div className="space-y-4">
            <Label className="text-base font-semibold">
              3. Your Information
            </Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attendeeName">
                  Your Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="attendeeName"
                    type="text"
                    value={attendeeName}
                    onChange={e => setAttendeeName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendeeEmail">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    id="attendeeEmail"
                    type="email"
                    value={attendeeEmail}
                    onChange={e => setAttendeeEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Any additional information or questions..."
                  className="min-h-[80px] pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Schedule Button */}
        {selectedSlot && (
          <div className="border-t pt-6">
            <Button
              type="button"
              onClick={handleScheduleMeeting}
              disabled={!canSchedule}
              className="w-full py-3 text-base"
            >
              {isScheduling ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Scheduling Meeting...
                </>
              ) : (
                'Schedule Meeting'
              )}
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
          {onPrevious ? (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading || isScheduling}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {/* Skip option for non-required steps */}
          {!step.is_required && !scheduledMeeting && onNext && (
            <Button
              type="button"
              variant="outline"
              onClick={onNext}
              disabled={isLoading || isScheduling}
            >
              Skip This Step
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing scheduling step state
export function useSchedulingStep() {
  const [selectedDate, setSelectedDate] = React.useState<string>('')
  const [selectedSlot, setSelectedSlot] =
    React.useState<AvailabilitySlot | null>(null)
  const [attendeeInfo, setAttendeeInfo] = React.useState({
    name: '',
    email: '',
    message: '',
  })
  const [scheduledMeeting, setScheduledMeeting] = React.useState<any>(null)

  const resetSelection = () => {
    setSelectedDate('')
    setSelectedSlot(null)
    setAttendeeInfo({ name: '', email: '', message: '' })
  }

  return {
    selectedDate,
    selectedSlot,
    attendeeInfo,
    scheduledMeeting,
    setSelectedDate,
    setSelectedSlot,
    setAttendeeInfo,
    setScheduledMeeting,
    resetSelection,
  }
}
