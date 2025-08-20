'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { OnboardingSession, StepInstance } from '@/types/onboarding-kits'
import { 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  Calendar,
  MessageSquare,
  FileText,
  CreditCard
} from 'lucide-react'

interface SessionDashboardProps {
  onSessionSelect: (session: OnboardingSession) => void
}

export function SessionDashboard({ onSessionSelect }: SessionDashboardProps) {
  const [sessions, setSessions] = useState<OnboardingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'assigned_to_me'>('all')

  useEffect(() => {
    fetchSessions()
  }, [filter])

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        if (filter === 'assigned_to_me') {
          params.append('assigned_to_me', 'true')
        } else {
          params.append('status', filter)
        }
      }

      const response = await fetch(`/api/onboarding/sessions?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Play className="h-4 w-4 text-blue-600" />
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepTypeIcon = (stepType: string) => {
    switch (stepType) {
      case 'form': return <FileText className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'calendar': return <Calendar className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'completed', 'assigned_to_me'] as const).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption)}
          >
            {filterOption === 'assigned_to_me' ? 'Assigned to Me' : 
             filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSessionSelect(session)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{session.client_name}</CardTitle>
                  <CardDescription className="mt-1">
                    {session.kit?.name}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(session.status)}>
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{session.client_email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(session.started_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{session.progress_percentage}%</span>
                  </div>
                  <Progress value={session.progress_percentage} className="h-2" />
                </div>

                {session.step_instances && session.step_instances.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Recent Steps:</h4>
                    <div className="space-y-1">
                      {session.step_instances.slice(0, 3).map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-xs">
                          {getStepStatusIcon(step.status)}
                          {getStepTypeIcon(step.step?.step_type || '')}
                          <span className="flex-1">{step.step?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {step.assigned_to}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {session.due_date && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Due: {new Date(session.due_date).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {session.assigned_user?.full_name || 'Unassigned'}
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            No onboarding sessions found.
          </div>
        </div>
      )}
    </div>
  )
}