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

import { createClient } from '@/lib/supabase/client'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  timeZone: string
  location?: string
  meetingUrl?: string
  attendees: CalendarAttendee[]
  status: 'confirmed' | 'tentative' | 'cancelled'
}

export interface CalendarAttendee {
  email: string
  name: string
  responseStatus: 'needsAction' | 'accepted' | 'declined' | 'tentative'
}

export interface AvailabilitySlot {
  startTime: string
  endTime: string
  available: boolean
}

export interface CalendarConfig {
  provider: 'google' | 'calendly' | 'outlook' | 'custom'
  calendar_id?: string
  duration: number
  buffer_time?: number
  available_times?: TimeSlot[]
  timezone?: string
}

export interface TimeSlot {
  day: string
  start_time: string
  end_time: string
}

export interface SchedulingData {
  eventTitle: string
  duration: number
  attendeeName: string
  attendeeEmail: string
  selectedDate: string
  selectedTime: string
  timeZone: string
  message?: string
}

class CalendarIntegration {
  private supabase = createClient()

  /**
   * Initialize calendar integration
   */
  async initialize(provider: string) {
    switch (provider) {
      case 'google':
        return this.initializeGoogle()
      case 'calendly':
        return this.initializeCalendly()
      case 'outlook':
        return this.initializeOutlook()
      default:
        return { success: true, provider: 'custom' }
    }
  }

  /**
   * Get available time slots for scheduling
   */
  async getAvailableSlots(
    config: CalendarConfig,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    try {
      if (config.provider === 'calendly') {
        return this.getCalendlyAvailability(config, startDate, endDate)
      }

      if (config.provider === 'google') {
        return this.getGoogleAvailability(config, startDate, endDate)
      }

      // Custom availability based on configuration
      return this.getCustomAvailability(config, startDate, endDate)
    } catch (error) {
      console.error('Error getting available slots:', error)
      return []
    }
  }

  /**
   * Schedule a meeting
   */
  async scheduleMeeting(
    config: CalendarConfig,
    schedulingData: SchedulingData
  ): Promise<CalendarEvent> {
    try {
      if (config.provider === 'calendly') {
        return this.scheduleCalendlyMeeting(config, schedulingData)
      }

      if (config.provider === 'google') {
        return this.scheduleGoogleMeeting(config, schedulingData)
      }

      // Custom scheduling
      return this.scheduleCustomMeeting(config, schedulingData)
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      throw error
    }
  }

  /**
   * Cancel a scheduled meeting
   */
  async cancelMeeting(eventId: string, provider: string): Promise<boolean> {
    try {
      if (provider === 'google') {
        return this.cancelGoogleMeeting(eventId)
      }

      if (provider === 'calendly') {
        return this.cancelCalendlyMeeting(eventId)
      }

      return this.cancelCustomMeeting(eventId)
    } catch (error) {
      console.error('Error canceling meeting:', error)
      return false
    }
  }

  /**
   * Get meeting details
   */
  async getMeetingDetails(
    eventId: string,
    provider: string
  ): Promise<CalendarEvent | null> {
    try {
      if (provider === 'google') {
        return this.getGoogleMeetingDetails(eventId)
      }

      if (provider === 'calendly') {
        return this.getCalendlyMeetingDetails(eventId)
      }

      return this.getCustomMeetingDetails(eventId)
    } catch (error) {
      console.error('Error getting meeting details:', error)
      return null
    }
  }

  // Google Calendar Integration
  private async initializeGoogle() {
    // In development, return mock initialization
    if (process.env.NODE_ENV === 'development') {
      return { success: true, provider: 'google', calendarId: 'primary' }
    }

    // Production would implement Google OAuth
    return {
      success: false,
      error: 'Google Calendar integration not configured',
    }
  }

  private async getGoogleAvailability(
    config: CalendarConfig,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    // In development, return mock availability
    if (process.env.NODE_ENV === 'development') {
      return this.generateMockAvailability(startDate, endDate, config.duration)
    }

    // Production Google Calendar API call would go here
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${config.calendar_id}/freebusy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await this.getGoogleAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startDate,
          timeMax: endDate,
          timeZone: config.timezone || 'UTC',
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to get Google Calendar availability')
    }

    const data = await response.json()
    return this.parseGoogleAvailability(data, config)
  }

  private async scheduleGoogleMeeting(
    config: CalendarConfig,
    schedulingData: SchedulingData
  ): Promise<CalendarEvent> {
    const startTime = new Date(
      `${schedulingData.selectedDate}T${schedulingData.selectedTime}`
    )
    const endTime = new Date(startTime.getTime() + config.duration * 60000)

    // In development, return mock event
    if (process.env.NODE_ENV === 'development') {
      const mockEvent: CalendarEvent = {
        id: `mock-event-${Date.now()}`,
        title: schedulingData.eventTitle,
        description: schedulingData.message,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timeZone: schedulingData.timeZone,
        attendees: [
          {
            email: schedulingData.attendeeEmail,
            name: schedulingData.attendeeName,
            responseStatus: 'needsAction',
          },
        ],
        status: 'confirmed',
      }

      await this.saveMeetingToDatabase(mockEvent, config)
      return mockEvent
    }

    // Production Google Calendar API call
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${config.calendar_id}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await this.getGoogleAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: schedulingData.eventTitle,
          description: schedulingData.message,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: schedulingData.timeZone,
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: schedulingData.timeZone,
          },
          attendees: [
            {
              email: schedulingData.attendeeEmail,
              displayName: schedulingData.attendeeName,
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to create Google Calendar event')
    }

    const event = await response.json()
    const calendarEvent = this.parseGoogleEvent(event)
    await this.saveMeetingToDatabase(calendarEvent, config)

    return calendarEvent
  }

  // Calendly Integration
  private async initializeCalendly() {
    return { success: true, provider: 'calendly' }
  }

  private async getCalendlyAvailability(
    config: CalendarConfig,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    // Calendly doesn't provide direct availability API for public use
    // Return mock availability or use their booking page
    return this.generateMockAvailability(startDate, endDate, config.duration)
  }

  private async scheduleCalendlyMeeting(
    config: CalendarConfig,
    schedulingData: SchedulingData
  ): Promise<CalendarEvent> {
    // Calendly scheduling would typically happen through their booking page
    // For integration purposes, we'd use webhooks to get event data
    const mockEvent: CalendarEvent = {
      id: `calendly-${Date.now()}`,
      title: schedulingData.eventTitle,
      description: schedulingData.message,
      startTime: new Date(
        `${schedulingData.selectedDate}T${schedulingData.selectedTime}`
      ).toISOString(),
      endTime: new Date(
        new Date(
          `${schedulingData.selectedDate}T${schedulingData.selectedTime}`
        ).getTime() +
          config.duration * 60000
      ).toISOString(),
      timeZone: schedulingData.timeZone,
      attendees: [
        {
          email: schedulingData.attendeeEmail,
          name: schedulingData.attendeeName,
          responseStatus: 'needsAction',
        },
      ],
      status: 'confirmed',
    }

    await this.saveMeetingToDatabase(mockEvent, config)
    return mockEvent
  }

  // Custom scheduling implementation
  private async getCustomAvailability(
    config: CalendarConfig,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    const slots: AvailabilitySlot[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Generate slots based on available_times configuration
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = d
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase()
      const availableTime = config.available_times?.find(
        t => t.day.toLowerCase() === dayName
      )

      if (availableTime) {
        const daySlots = this.generateDaySlots(
          d,
          availableTime.start_time,
          availableTime.end_time,
          config.duration,
          config.buffer_time || 0
        )
        slots.push(...daySlots)
      }
    }

    return slots
  }

  private async scheduleCustomMeeting(
    config: CalendarConfig,
    schedulingData: SchedulingData
  ): Promise<CalendarEvent> {
    const startTime = new Date(
      `${schedulingData.selectedDate}T${schedulingData.selectedTime}`
    )
    const endTime = new Date(startTime.getTime() + config.duration * 60000)

    const event: CalendarEvent = {
      id: `custom-${Date.now()}`,
      title: schedulingData.eventTitle,
      description: schedulingData.message,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      timeZone: schedulingData.timeZone,
      meetingUrl: `https://meet.google.com/new`, // Generate meeting URL
      attendees: [
        {
          email: schedulingData.attendeeEmail,
          name: schedulingData.attendeeName,
          responseStatus: 'needsAction',
        },
      ],
      status: 'confirmed',
    }

    await this.saveMeetingToDatabase(event, config)
    return event
  }

  // Helper methods
  private generateMockAvailability(
    startDate: string,
    endDate: string,
    duration: number
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // Skip weekends for mock data
      if (d.getDay() === 0 || d.getDay() === 6) continue

      // Generate slots from 9 AM to 5 PM
      const daySlots = this.generateDaySlots(d, '09:00', '17:00', duration, 15)
      slots.push(...daySlots)
    }

    return slots
  }

  private generateDaySlots(
    date: Date,
    startTime: string,
    endTime: string,
    duration: number,
    bufferTime: number
  ): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = []
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    if (
      startHour === undefined ||
      startMinute === undefined ||
      endHour === undefined ||
      endMinute === undefined
    ) {
      return slots
    }

    const startDateTime = new Date(date)
    startDateTime.setHours(startHour, startMinute, 0, 0)

    const endDateTime = new Date(date)
    endDateTime.setHours(endHour, endMinute, 0, 0)

    const slotDuration = duration + bufferTime

    for (
      let current = new Date(startDateTime);
      current < endDateTime;
      current.setMinutes(current.getMinutes() + slotDuration)
    ) {
      const slotEnd = new Date(current.getTime() + duration * 60000)

      if (slotEnd <= endDateTime) {
        slots.push({
          startTime: current.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true,
        })
      }
    }

    return slots
  }

  private async saveMeetingToDatabase(
    event: CalendarEvent,
    config: CalendarConfig
  ) {
    try {
      // Save to webhook_events table for now
      await this.supabase.from('webhook_events').insert({
        source: 'calendar',
        event_type: 'meeting_scheduled',
        event_id: event.id,
        event_data: {
          ...event,
          provider: config.provider,
        } as any,
        processed: false,
      })
    } catch (error) {
      console.error('Error saving meeting to database:', error)
    }
  }

  private parseGoogleEvent(googleEvent: any): CalendarEvent {
    return {
      id: googleEvent.id,
      title: googleEvent.summary,
      description: googleEvent.description,
      startTime: googleEvent.start.dateTime,
      endTime: googleEvent.end.dateTime,
      timeZone: googleEvent.start.timeZone,
      location: googleEvent.location,
      meetingUrl: googleEvent.hangoutLink,
      attendees: (googleEvent.attendees || []).map((attendee: any) => ({
        email: attendee.email,
        name: attendee.displayName || attendee.email,
        responseStatus: attendee.responseStatus,
      })),
      status: googleEvent.status,
    }
  }

  private parseGoogleAvailability(
    data: any,
    config: CalendarConfig
  ): AvailabilitySlot[] {
    // Parse Google Calendar freebusy response
    // This is a simplified implementation
    return []
  }

  private async getGoogleAccessToken(): Promise<string> {
    // In production, implement OAuth token refresh
    return 'mock-access-token'
  }

  private async cancelGoogleMeeting(eventId: string): Promise<boolean> {
    // Implement Google Calendar event cancellation
    return true
  }

  private async cancelCalendlyMeeting(eventId: string): Promise<boolean> {
    // Implement Calendly event cancellation
    return true
  }

  private async cancelCustomMeeting(eventId: string): Promise<boolean> {
    // Implement custom event cancellation
    return true
  }

  private async getGoogleMeetingDetails(
    eventId: string
  ): Promise<CalendarEvent | null> {
    // Implement Google Calendar event retrieval
    return null
  }

  private async getCalendlyMeetingDetails(
    eventId: string
  ): Promise<CalendarEvent | null> {
    // Implement Calendly event retrieval
    return null
  }

  private async getCustomMeetingDetails(
    eventId: string
  ): Promise<CalendarEvent | null> {
    // Implement custom event retrieval
    return null
  }

  private async initializeOutlook() {
    // Implement Outlook calendar integration
    return { success: false, error: 'Outlook integration not implemented' }
  }
}

export const calendarIntegration = new CalendarIntegration()
