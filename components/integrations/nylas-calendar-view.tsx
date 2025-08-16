'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, Plus } from 'lucide-react'

interface NylasCalendarViewProps {
  accountId: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  location?: string
  when: {
    start_time: number
    end_time: number
  }
  participants: Array<{
    name: string
    email: string
    status: string
  }>
  status: string
}

export function NylasCalendarView({ accountId }: NylasCalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [accountId])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/integrations/nylas/calendar?account_id=${accountId}&action=events`)
      const data = await response.json()
      if (data.success) {
        setEvents(data.data.events)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  if (loading) {
    return <div className="text-center p-8">Loading calendar...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{event.title}</h3>
                <Badge variant="outline">{event.status}</Badge>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(event.when.start_time)}
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.participants.length} participants
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}