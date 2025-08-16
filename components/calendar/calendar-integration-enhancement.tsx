'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  Users,
  Star,
  MapPin,
  Video,
  Phone,
  Mail,
  Link,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Share,
  Bell,
  Zap,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
  Globe,
  Building,
  User,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarClock,
  Repeat,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'

interface CalendarProvider {
  id: string
  name: string
  type: 'google' | 'outlook' | 'apple' | 'caldav' | 'exchange'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  account_email: string
  last_sync: string
  sync_frequency: 'real_time' | 'hourly' | 'daily'
  calendars_count: number
  events_synced: number
  permissions: string[]
  features: string[]
  icon: string
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  timezone: string
  location?: string
  meeting_url?: string
  attendees: Array<{
    email: string
    name: string
    status: 'accepted' | 'declined' | 'tentative' | 'pending'
    type: 'required' | 'optional'
  }>
  onboarding_context: {
    client_id: string
    client_name: string
    onboarding_step: string
    workflow_id: string
    completion_percentage: number
  }
  event_type: 'onboarding_kickoff' | 'document_review' | 'training_session' | 'milestone_meeting' | 'follow_up'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
  created_by: string
  calendar_provider: string
  recurring: boolean
  reminder_settings: {
    email: number[]
    popup: number[]
    sms?: number[]
  }
}

interface CalendarIntegration {
  id: string
  name: string
  description: string
  provider: string
  status: 'active' | 'inactive' | 'error'
  auto_scheduling: boolean
  conflict_detection: boolean
  buffer_time: number
  working_hours: {
    start: string
    end: string
    days: string[]
    timezone: string
  }
  meeting_types: Array<{
    name: string
    duration: number
    description: string
    location_type: 'in_person' | 'video' | 'phone'
    auto_create: boolean
  }>
  usage_stats: {
    events_created: number
    meetings_scheduled: number
    completion_rate: number
    no_show_rate: number
  }
}

interface CalendarTemplate {
  id: string
  name: string
  description: string
  event_type: string
  duration: number
  template_content: {
    title_template: string
    description_template: string
    location_template?: string
    attendee_instructions: string
  }
  variables: string[]
  usage_count: number
  rating: number
  created_by: string
  is_public: boolean
}

// Mock data
const mockCalendarProviders: CalendarProvider[] = [
  {
    id: '1',
    name: 'Google Calendar',
    type: 'google',
    status: 'connected',
    account_email: 'admin@onboardkit.com',
    last_sync: '2024-08-14T15:30:00Z',
    sync_frequency: 'real_time',
    calendars_count: 5,
    events_synced: 1247,
    permissions: ['read', 'write', 'delete'],
    features: ['Two-way sync', 'Conflict detection', 'Auto-scheduling', 'Meeting rooms'],
    icon: '📅'
  },
  {
    id: '2',
    name: 'Microsoft Outlook',
    type: 'outlook',
    status: 'connected',
    account_email: 'team@onboardkit.com',
    last_sync: '2024-08-14T15:25:00Z',
    sync_frequency: 'hourly',
    calendars_count: 3,
    events_synced: 892,
    permissions: ['read', 'write'],
    features: ['Exchange integration', 'Teams meetings', 'Shared calendars'],
    icon: '📆'
  },
  {
    id: '3',
    name: 'Apple Calendar',
    type: 'apple',
    status: 'disconnected',
    account_email: 'mobile@onboardkit.com',
    last_sync: '2024-08-12T10:00:00Z',
    sync_frequency: 'daily',
    calendars_count: 2,
    events_synced: 234,
    permissions: ['read'],
    features: ['iCloud sync', 'iOS integration'],
    icon: '🍎'
  }
]

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Onboarding Kickoff - Acme Corp',
    description: 'Initial onboarding meeting to review process and timeline',
    start_time: '2024-08-15T10:00:00Z',
    end_time: '2024-08-15T11:00:00Z',
    timezone: 'America/New_York',
    location: 'Conference Room A',
    meeting_url: 'https://meet.google.com/abc-defg-hij',
    attendees: [
      { email: 'john@acmecorp.com', name: 'John Smith', status: 'accepted', type: 'required' },
      { email: 'sarah@onboardkit.com', name: 'Sarah Johnson', status: 'accepted', type: 'required' },
      { email: 'mike@acmecorp.com', name: 'Mike Davis', status: 'tentative', type: 'optional' }
    ],
    onboarding_context: {
      client_id: 'client_123',
      client_name: 'Acme Corp',
      onboarding_step: 'Initial Setup',
      workflow_id: 'workflow_456',
      completion_percentage: 15
    },
    event_type: 'onboarding_kickoff',
    status: 'scheduled',
    created_by: 'sarah@onboardkit.com',
    calendar_provider: 'google',
    recurring: false,
    reminder_settings: {
      email: [1440, 60], // 24 hours, 1 hour
      popup: [15, 5]     // 15 minutes, 5 minutes
    }
  },
  {
    id: '2',
    title: 'Document Review Session - TechStart Inc',
    description: 'Review and sign onboarding documents and contracts',
    start_time: '2024-08-15T14:00:00Z',
    end_time: '2024-08-15T15:30:00Z',
    timezone: 'America/Los_Angeles',
    meeting_url: 'https://teams.microsoft.com/l/meetup-join/xyz',
    attendees: [
      { email: 'alex@techstart.com', name: 'Alex Chen', status: 'accepted', type: 'required' },
      { email: 'legal@onboardkit.com', name: 'Legal Team', status: 'accepted', type: 'required' }
    ],
    onboarding_context: {
      client_id: 'client_789',
      client_name: 'TechStart Inc',
      onboarding_step: 'Document Signing',
      workflow_id: 'workflow_789',
      completion_percentage: 65
    },
    event_type: 'document_review',
    status: 'scheduled',
    created_by: 'legal@onboardkit.com',
    calendar_provider: 'outlook',
    recurring: false,
    reminder_settings: {
      email: [60, 15],
      popup: [10]
    }
  },
  {
    id: '3',
    title: 'Weekly Training Session',
    description: 'Recurring training session for new client onboarding best practices',
    start_time: '2024-08-16T09:00:00Z',
    end_time: '2024-08-16T10:00:00Z',
    timezone: 'UTC',
    meeting_url: 'https://zoom.us/j/123456789',
    attendees: [
      { email: 'team@onboardkit.com', name: 'OnboardKit Team', status: 'accepted', type: 'required' }
    ],
    onboarding_context: {
      client_id: 'training',
      client_name: 'Internal Training',
      onboarding_step: 'Team Training',
      workflow_id: 'training_workflow',
      completion_percentage: 100
    },
    event_type: 'training_session',
    status: 'scheduled',
    created_by: 'admin@onboardkit.com',
    calendar_provider: 'google',
    recurring: true,
    reminder_settings: {
      email: [60],
      popup: [15]
    }
  }
]

const mockIntegrations: CalendarIntegration[] = [
  {
    id: '1',
    name: 'Auto-Scheduling Engine',
    description: 'Automatically schedule onboarding meetings based on availability',
    provider: 'google',
    status: 'active',
    auto_scheduling: true,
    conflict_detection: true,
    buffer_time: 15,
    working_hours: {
      start: '09:00',
      end: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'America/New_York'
    },
    meeting_types: [
      { name: 'Kickoff Meeting', duration: 60, description: 'Initial onboarding meeting', location_type: 'video', auto_create: true },
      { name: 'Document Review', duration: 90, description: 'Review and sign documents', location_type: 'video', auto_create: true },
      { name: 'Training Session', duration: 45, description: 'Product training', location_type: 'video', auto_create: false }
    ],
    usage_stats: {
      events_created: 234,
      meetings_scheduled: 189,
      completion_rate: 92.3,
      no_show_rate: 7.8
    }
  }
]

const mockTemplates: CalendarTemplate[] = [
  {
    id: '1',
    name: 'Onboarding Kickoff Meeting',
    description: 'Standard template for initial client onboarding meetings',
    event_type: 'onboarding_kickoff',
    duration: 60,
    template_content: {
      title_template: 'Onboarding Kickoff - {CLIENT_NAME}',
      description_template: 'Welcome to OnboardKit! This meeting will cover:\n\n• Overview of the onboarding process\n• Timeline and milestones\n• Required documents and information\n• Next steps\n\nPlease come prepared with any questions about the process.',
      location_template: 'Video Conference',
      attendee_instructions: 'Please join the meeting 5 minutes early to test your audio/video setup.'
    },
    variables: ['CLIENT_NAME', 'TIMELINE', 'CONTACT_PERSON'],
    usage_count: 156,
    rating: 4.8,
    created_by: 'OnboardKit Team',
    is_public: true
  },
  {
    id: '2',
    name: 'Document Review Session',
    description: 'Template for document review and signing meetings',
    event_type: 'document_review',
    duration: 90,
    template_content: {
      title_template: 'Document Review - {CLIENT_NAME}',
      description_template: 'Document review session for {CLIENT_NAME}\n\nAgenda:\n• Review all onboarding documents\n• Digital signature process\n• Q&A session\n• Next steps discussion\n\nDocuments to review:\n{DOCUMENT_LIST}',
      attendee_instructions: 'Please review the documents sent via email before the meeting.'
    },
    variables: ['CLIENT_NAME', 'DOCUMENT_LIST', 'DEADLINE'],
    usage_count: 89,
    rating: 4.6,
    created_by: 'Legal Team',
    is_public: true
  }
]

export function CalendarIntegrationEnhancement() {
  const [selectedProvider, setSelectedProvider] = useState<CalendarProvider | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'scheduled':
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'syncing':
      case 'in_progress':
      case 'tentative':
        return 'bg-blue-100 text-blue-800'
      case 'disconnected':
      case 'inactive':
      case 'pending':
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
      case 'cancelled':
      case 'declined':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
      case 'scheduled':
      case 'completed':
      case 'accepted':
        return CheckCircle
      case 'syncing':
      case 'in_progress':
        return RefreshCw
      case 'disconnected':
      case 'inactive':
      case 'pending':
      case 'tentative':
      case 'rescheduled':
        return AlertTriangle
      case 'error':
      case 'cancelled':
      case 'declined':
        return XCircle
      default:
        return Clock
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDuration = (start: string, end: string) => {
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime.getTime() - startTime.getTime()
    const diffMins = Math.round(diffMs / 60000)
    return `${diffMins} min`
  }

  const filteredEvents = mockCalendarEvents.filter(event => 
    selectedEventType === 'all' || event.event_type === selectedEventType
  )

  const totalEvents = mockCalendarEvents.length
  const upcomingEvents = mockCalendarEvents.filter(e => new Date(e.start_time) > new Date()).length
  const connectedProviders = mockCalendarProviders.filter(p => p.status === 'connected').length
  const totalSynced = mockCalendarProviders.reduce((sum, p) => sum + p.events_synced, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-blue-600" />
            Calendar Integration Enhancement
          </h1>
          <p className="text-gray-600">
            Deep integration with Google Calendar, Outlook, and other calendar providers for seamless scheduling.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Sync Settings
          </Button>
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Onboarding Meeting</DialogTitle>
                <DialogDescription>
                  Create a new calendar event for client onboarding
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding_kickoff">Onboarding Kickoff</SelectItem>
                        <SelectItem value="document_review">Document Review</SelectItem>
                        <SelectItem value="training_session">Training Session</SelectItem>
                        <SelectItem value="milestone_meeting">Milestone Meeting</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Use template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kickoff">Onboarding Kickoff Meeting</SelectItem>
                        <SelectItem value="document">Document Review Session</SelectItem>
                        <SelectItem value="custom">Custom Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Meeting title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Meeting description and agenda" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date & Time</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Attendees</Label>
                  <Input placeholder="Enter email addresses separated by commas" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Video Conference</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Calendar Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calendar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="outlook">Microsoft Outlook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                  Cancel
                </Button>
                <Button>Schedule Meeting</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              Total Events
            </CardTitle>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Connected Providers
            </CardTitle>
            <div className="text-2xl font-bold">{connectedProviders}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockCalendarProviders.length - connectedProviders} disconnected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Events Synced
            </CardTitle>
            <div className="text-2xl font-bold">{totalSynced.toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all calendars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Completion Rate
            </CardTitle>
            <div className="text-2xl font-bold">92.3%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Meeting attendance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Calendar Providers</TabsTrigger>
          <TabsTrigger value="events">Scheduled Events</TabsTrigger>
          <TabsTrigger value="templates">Event Templates</TabsTrigger>
          <TabsTrigger value="integrations">Auto-Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* Calendar Providers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockCalendarProviders.map((provider) => {
              const StatusIcon = getStatusIcon(provider.status)
              
              return (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{provider.icon}</div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{provider.name}</span>
                            <Badge className={getStatusColor(provider.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {provider.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{provider.account_email}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          {provider.calendars_count} calendars
                        </div>
                        <div className="text-xs text-gray-500">
                          {provider.events_synced.toLocaleString()} events
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Last Sync</div>
                          <div className="font-medium">{formatDateTime(provider.last_sync)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Sync Frequency</div>
                          <div className="font-medium capitalize">{provider.sync_frequency.replace('_', ' ')}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Permissions</div>
                        <div className="flex flex-wrap gap-1">
                          {provider.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Features</div>
                        <div className="flex flex-wrap gap-1">
                          {provider.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {provider.status === 'connected' ? (
                          <>
                            <Button size="sm" variant="outline">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync Now
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                          </>
                        ) : (
                          <Button size="sm">
                            <Link className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          {/* Scheduled Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scheduled Events</CardTitle>
                  <CardDescription>Upcoming onboarding meetings and appointments</CardDescription>
                </div>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="onboarding_kickoff">Kickoff Meetings</SelectItem>
                    <SelectItem value="document_review">Document Reviews</SelectItem>
                    <SelectItem value="training_session">Training Sessions</SelectItem>
                    <SelectItem value="milestone_meeting">Milestone Meetings</SelectItem>
                    <SelectItem value="follow_up">Follow-ups</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const StatusIcon = getStatusIcon(event.status)
                  
                  return (
                    <Card key={event.id} className="hover:shadow-sm transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base flex items-center space-x-3">
                                <span>{event.title}</span>
                                <Badge className={getStatusColor(event.status)}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {event.status}
                                </Badge>
                                {event.recurring && (
                                  <Badge variant="outline" className="text-xs">
                                    <Repeat className="h-3 w-3 mr-1" />
                                    Recurring
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>{event.description}</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatDate(event.start_time)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTime(event.start_time)} - {formatTime(event.end_time)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Duration</div>
                              <div className="font-medium">{getDuration(event.start_time, event.end_time)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Timezone</div>
                              <div className="font-medium">{event.timezone}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Provider</div>
                              <div className="font-medium capitalize">{event.calendar_provider}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Created By</div>
                              <div className="font-medium">{event.created_by}</div>
                            </div>
                          </div>

                          {event.location && (
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.meeting_url && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Video className="h-4 w-4 text-gray-400" />
                              <a href={event.meeting_url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                Join Meeting
                              </a>
                            </div>
                          )}

                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Onboarding Context</div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Client:</span> {event.onboarding_context.client_name}
                                </div>
                                <div>
                                  <span className="text-gray-600">Step:</span> {event.onboarding_context.onboarding_step}
                                </div>
                                <div>
                                  <span className="text-gray-600">Progress:</span> {event.onboarding_context.completion_percentage}%
                                </div>
                                <div>
                                  <span className="text-gray-600">Workflow:</span> {event.onboarding_context.workflow_id}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Attendees ({event.attendees.length})
                            </div>
                            <div className="space-y-1">
                              {event.attendees.map((attendee, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-3 w-3 text-gray-400" />
                                    <span>{attendee.name}</span>
                                    <span className="text-gray-500">({attendee.email})</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {attendee.type}
                                    </Badge>
                                    <Badge className={getStatusColor(attendee.status)}>
                                      {attendee.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in Calendar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Event Templates */}
          <div className="space-y-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CalendarPlus className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          <span>{template.name}</span>
                          <Badge variant="outline">{template.duration} min</Badge>
                          {template.is_public && (
                            <Badge className="bg-green-100 text-green-800">Public</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{template.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">{template.usage_count} uses</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Event Type</div>
                        <div className="font-medium capitalize">{template.event_type.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Created By</div>
                        <div className="font-medium">{template.created_by}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Title Template</div>
                      <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                        {template.template_content.title_template}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Description Template</div>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        {template.template_content.description_template}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Variables</div>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-mono">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm">
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Auto-Scheduling Integration */}
          {mockIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span>{integration.name}</span>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {integration.usage_stats.completion_rate}%
                    </div>
                    <div className="text-xs text-gray-500">completion rate</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Events Created</div>
                      <div className="text-lg font-bold">{integration.usage_stats.events_created}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Meetings Scheduled</div>
                      <div className="text-lg font-bold">{integration.usage_stats.meetings_scheduled}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">No-Show Rate</div>
                      <div className="text-lg font-bold text-red-600">{integration.usage_stats.no_show_rate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Buffer Time</div>
                      <div className="text-lg font-bold">{integration.buffer_time} min</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Working Hours</div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Hours:</span> {integration.working_hours.start} - {integration.working_hours.end}
                        </div>
                        <div>
                          <span className="text-gray-600">Timezone:</span> {integration.working_hours.timezone}
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Days:</span> {integration.working_hours.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-3">Meeting Types</div>
                    <div className="space-y-2">
                      {integration.meeting_types.map((type, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{type.name}</div>
                            <div className="text-xs text-gray-500">{type.description}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {type.duration} min
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {type.location_type}
                            </Badge>
                            {type.auto_create && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Auto-create
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch checked={integration.auto_scheduling} />
                      <Label>Auto-scheduling enabled</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={integration.conflict_detection} />
                      <Label>Conflict detection</Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}