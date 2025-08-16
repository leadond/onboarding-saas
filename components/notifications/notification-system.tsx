'use client'

import React from 'react'

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
  Bell,
  BellRing,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Users,
  User,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
  Zap,
  Globe,
  Calendar,
  Filter,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Megaphone,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Phone,
  Slack,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Chrome,
  Globe as Firefox,
  Globe as Safari
} from 'lucide-react'

interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook' | 'slack' | 'teams'
  status: 'active' | 'inactive' | 'error' | 'testing'
  provider: string
  configuration: Record<string, any>
  delivery_stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
  }
  last_used: string
  cost_per_message: number
}

interface NotificationTemplate {
  id: string
  name: string
  description: string
  type: 'welcome' | 'reminder' | 'milestone' | 'alert' | 'marketing' | 'system'
  channels: string[]
  subject_template: string
  content_template: string
  variables: string[]
  personalization: boolean
  scheduling: {
    immediate: boolean
    delay_minutes?: number
    optimal_time: boolean
    timezone_aware: boolean
  }
  targeting: {
    audience: 'all' | 'segment' | 'individual'
    conditions: Array<{
      field: string
      operator: string
      value: string
    }>
  }
  usage_stats: {
    sent_count: number
    open_rate: number
    click_rate: number
    conversion_rate: number
  }
  created_by: string
  created_at: string
  is_active: boolean
}

interface NotificationCampaign {
  id: string
  name: string
  description: string
  template_id: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  channels: string[]
  target_audience: {
    type: 'all_users' | 'client_segment' | 'workflow_stage' | 'custom_list'
    criteria: Record<string, any>
    estimated_reach: number
  }
  schedule: {
    send_immediately: boolean
    scheduled_at?: string
    timezone: string
    recurring: boolean
    frequency?: 'daily' | 'weekly' | 'monthly'
  }
  content: {
    subject: string
    message: string
    call_to_action?: {
      text: string
      url: string
    }
    personalization_data: Record<string, string>
  }
  delivery_stats: {
    total_sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
  created_by: string
  created_at: string
  sent_at?: string
}

interface NotificationRule {
  id: string
  name: string
  description: string
  trigger: {
    event: 'user_signup' | 'workflow_start' | 'step_completed' | 'deadline_approaching' | 'task_overdue' | 'milestone_reached'
    conditions: Array<{
      field: string
      operator: string
      value: string
    }>
  }
  actions: Array<{
    type: 'send_notification' | 'create_task' | 'update_status' | 'webhook'
    template_id?: string
    channels?: string[]
    delay_minutes?: number
    configuration: Record<string, any>
  }>
  is_active: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_by: string
  created_at: string
  last_triggered?: string
  trigger_count: number
}

// Mock data
const mockChannels: NotificationChannel[] = [
  {
    id: '1',
    name: 'Primary Email',
    type: 'email',
    status: 'active',
    provider: 'SendGrid',
    configuration: {
      api_key: 'sg_***',
      from_email: 'notifications@onboardkit.com',
      from_name: 'OnboardKit'
    },
    delivery_stats: {
      sent: 15678,
      delivered: 15234,
      opened: 8945,
      clicked: 3456,
      failed: 444
    },
    last_used: '2024-08-14T15:30:00Z',
    cost_per_message: 0.0012
  },
  {
    id: '2',
    name: 'SMS Notifications',
    type: 'sms',
    status: 'active',
    provider: 'Twilio',
    configuration: {
      account_sid: 'AC***',
      auth_token: '***',
      from_number: '+1234567890'
    },
    delivery_stats: {
      sent: 3456,
      delivered: 3398,
      opened: 3398, // SMS is considered opened when delivered
      clicked: 892,
      failed: 58
    },
    last_used: '2024-08-14T14:20:00Z',
    cost_per_message: 0.0075
  },
  {
    id: '3',
    name: 'Push Notifications',
    type: 'push',
    status: 'active',
    provider: 'Firebase',
    configuration: {
      server_key: 'AAAA***',
      project_id: 'onboardkit-app'
    },
    delivery_stats: {
      sent: 8923,
      delivered: 8456,
      opened: 4567,
      clicked: 2134,
      failed: 467
    },
    last_used: '2024-08-14T16:45:00Z',
    cost_per_message: 0.0001
  },
  {
    id: '4',
    name: 'In-App Notifications',
    type: 'in_app',
    status: 'active',
    provider: 'Internal',
    configuration: {
      retention_days: 30,
      max_per_user: 50
    },
    delivery_stats: {
      sent: 12456,
      delivered: 12456,
      opened: 9876,
      clicked: 5432,
      failed: 0
    },
    last_used: '2024-08-14T16:50:00Z',
    cost_per_message: 0.0000
  },
  {
    id: '5',
    name: 'Slack Integration',
    type: 'slack',
    status: 'active',
    provider: 'Slack',
    configuration: {
      webhook_url: 'https://hooks.slack.com/services/***',
      channel: '#onboarding-alerts'
    },
    delivery_stats: {
      sent: 567,
      delivered: 567,
      opened: 567,
      clicked: 234,
      failed: 0
    },
    last_used: '2024-08-14T12:15:00Z',
    cost_per_message: 0.0000
  }
]

const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    description: 'Welcome message sent to new clients when they start onboarding',
    type: 'welcome',
    channels: ['email', 'in_app'],
    subject_template: 'Welcome to {COMPANY_NAME}, {CLIENT_NAME}!',
    content_template: 'Hi {CLIENT_NAME},\n\nWelcome to {COMPANY_NAME}! We\'re excited to help you get started.\n\nYour onboarding journey begins now. Here\'s what to expect:\n\n• Step 1: Complete your profile\n• Step 2: Review and sign documents\n• Step 3: Schedule your kickoff meeting\n\nIf you have any questions, don\'t hesitate to reach out to your account manager: {ACCOUNT_MANAGER}\n\nBest regards,\nThe {COMPANY_NAME} Team',
    variables: ['CLIENT_NAME', 'COMPANY_NAME', 'ACCOUNT_MANAGER', 'NEXT_STEPS'],
    personalization: true,
    scheduling: {
      immediate: true,
      optimal_time: false,
      timezone_aware: true
    },
    targeting: {
      audience: 'individual',
      conditions: [
        { field: 'onboarding_status', operator: 'equals', value: 'started' }
      ]
    },
    usage_stats: {
      sent_count: 234,
      open_rate: 78.5,
      click_rate: 34.2,
      conversion_rate: 89.1
    },
    created_by: 'Marketing Team',
    created_at: '2024-07-15T00:00:00Z',
    is_active: true
  },
  {
    id: '2',
    name: 'Document Reminder',
    description: 'Reminder for clients to complete pending document submissions',
    type: 'reminder',
    channels: ['email', 'sms', 'push'],
    subject_template: 'Action Required: Complete Your Documents',
    content_template: 'Hi {CLIENT_NAME},\n\nWe noticed you have {PENDING_COUNT} pending documents that need your attention:\n\n{DOCUMENT_LIST}\n\nPlease complete these by {DEADLINE} to keep your onboarding on track.\n\n[Complete Documents]({DOCUMENT_URL})\n\nNeed help? Contact us at {SUPPORT_EMAIL}',
    variables: ['CLIENT_NAME', 'PENDING_COUNT', 'DOCUMENT_LIST', 'DEADLINE', 'DOCUMENT_URL', 'SUPPORT_EMAIL'],
    personalization: true,
    scheduling: {
      immediate: false,
      delay_minutes: 1440, // 24 hours
      optimal_time: true,
      timezone_aware: true
    },
    targeting: {
      audience: 'segment',
      conditions: [
        { field: 'pending_documents', operator: 'greater_than', value: '0' },
        { field: 'days_since_last_activity', operator: 'greater_than', value: '2' }
      ]
    },
    usage_stats: {
      sent_count: 456,
      open_rate: 65.3,
      click_rate: 42.1,
      conversion_rate: 67.8
    },
    created_by: 'Operations Team',
    created_at: '2024-07-20T00:00:00Z',
    is_active: true
  },
  {
    id: '3',
    name: 'Milestone Celebration',
    description: 'Congratulatory message when clients reach important milestones',
    type: 'milestone',
    channels: ['email', 'in_app', 'push'],
    subject_template: '🎉 Congratulations! You\'ve reached {MILESTONE_NAME}',
    content_template: 'Fantastic work, {CLIENT_NAME}!\n\nYou\'ve successfully completed {MILESTONE_NAME} in your onboarding journey. You\'re now {COMPLETION_PERCENTAGE}% complete!\n\n🎯 What\'s next:\n{NEXT_STEPS}\n\n📊 Your progress:\n• Completed: {COMPLETED_STEPS}\n• Remaining: {REMAINING_STEPS}\n• Estimated completion: {ESTIMATED_COMPLETION}\n\nKeep up the great work!\n\nThe {COMPANY_NAME} Team',
    variables: ['CLIENT_NAME', 'MILESTONE_NAME', 'COMPLETION_PERCENTAGE', 'NEXT_STEPS', 'COMPLETED_STEPS', 'REMAINING_STEPS', 'ESTIMATED_COMPLETION', 'COMPANY_NAME'],
    personalization: true,
    scheduling: {
      immediate: true,
      optimal_time: false,
      timezone_aware: true
    },
    targeting: {
      audience: 'individual',
      conditions: [
        { field: 'milestone_reached', operator: 'equals', value: 'true' }
      ]
    },
    usage_stats: {
      sent_count: 189,
      open_rate: 89.4,
      click_rate: 56.7,
      conversion_rate: 94.2
    },
    created_by: 'Customer Success Team',
    created_at: '2024-07-25T00:00:00Z',
    is_active: true
  }
]

const mockCampaigns: NotificationCampaign[] = [
  {
    id: '1',
    name: 'Q3 Feature Announcement',
    description: 'Announce new features released in Q3 2024',
    template_id: '4',
    status: 'sent',
    channels: ['email', 'in_app'],
    target_audience: {
      type: 'all_users',
      criteria: { active: true },
      estimated_reach: 2456
    },
    schedule: {
      send_immediately: false,
      scheduled_at: '2024-08-01T10:00:00Z',
      timezone: 'America/New_York',
      recurring: false
    },
    content: {
      subject: 'Exciting New Features Now Available!',
      message: 'We\'re thrilled to announce several new features that will enhance your onboarding experience...',
      call_to_action: {
        text: 'Explore New Features',
        url: 'https://onboardkit.com/features'
      },
      personalization_data: {}
    },
    delivery_stats: {
      total_sent: 2456,
      delivered: 2398,
      opened: 1567,
      clicked: 789,
      bounced: 58,
      unsubscribed: 12
    },
    created_by: 'marketing@onboardkit.com',
    created_at: '2024-07-28T00:00:00Z',
    sent_at: '2024-08-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Inactive User Re-engagement',
    description: 'Re-engage users who haven\'t been active in the last 30 days',
    template_id: '5',
    status: 'scheduled',
    channels: ['email', 'push'],
    target_audience: {
      type: 'client_segment',
      criteria: { 
        last_activity: '30_days_ago',
        onboarding_status: 'incomplete'
      },
      estimated_reach: 345
    },
    schedule: {
      send_immediately: false,
      scheduled_at: '2024-08-16T14:00:00Z',
      timezone: 'UTC',
      recurring: true,
      frequency: 'weekly'
    },
    content: {
      subject: 'We miss you! Let\'s get your onboarding back on track',
      message: 'It looks like you haven\'t been active lately. We\'re here to help you complete your onboarding...',
      call_to_action: {
        text: 'Continue Onboarding',
        url: 'https://app.onboardkit.com/continue'
      },
      personalization_data: {}
    },
    delivery_stats: {
      total_sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0
    },
    created_by: 'growth@onboardkit.com',
    created_at: '2024-08-14T00:00:00Z'
  }
]

const mockRules: NotificationRule[] = [
  {
    id: '1',
    name: 'Welcome New Clients',
    description: 'Send welcome notification when a new client starts onboarding',
    trigger: {
      event: 'workflow_start',
      conditions: [
        { field: 'workflow_type', operator: 'equals', value: 'client_onboarding' }
      ]
    },
    actions: [
      {
        type: 'send_notification',
        template_id: '1',
        channels: ['email', 'in_app'],
        delay_minutes: 0,
        configuration: {}
      }
    ],
    is_active: true,
    priority: 'medium',
    created_by: 'admin@onboardkit.com',
    created_at: '2024-07-15T00:00:00Z',
    last_triggered: '2024-08-14T15:30:00Z',
    trigger_count: 234
  },
  {
    id: '2',
    name: 'Document Deadline Alert',
    description: 'Alert when document submission deadline is approaching',
    trigger: {
      event: 'deadline_approaching',
      conditions: [
        { field: 'document_type', operator: 'equals', value: 'required' },
        { field: 'days_until_deadline', operator: 'equals', value: '2' }
      ]
    },
    actions: [
      {
        type: 'send_notification',
        template_id: '2',
        channels: ['email', 'sms'],
        delay_minutes: 0,
        configuration: {}
      },
      {
        type: 'create_task',
        configuration: {
          assignee: 'account_manager',
          title: 'Follow up on pending documents',
          priority: 'high'
        }
      }
    ],
    is_active: true,
    priority: 'high',
    created_by: 'operations@onboardkit.com',
    created_at: '2024-07-20T00:00:00Z',
    last_triggered: '2024-08-14T10:15:00Z',
    trigger_count: 89
  },
  {
    id: '3',
    name: 'Milestone Celebration',
    description: 'Celebrate when clients reach important milestones',
    trigger: {
      event: 'milestone_reached',
      conditions: [
        { field: 'milestone_type', operator: 'in', value: 'major,completion' }
      ]
    },
    actions: [
      {
        type: 'send_notification',
        template_id: '3',
        channels: ['email', 'in_app', 'push'],
        delay_minutes: 5,
        configuration: {}
      }
    ],
    is_active: true,
    priority: 'medium',
    created_by: 'success@onboardkit.com',
    created_at: '2024-07-25T00:00:00Z',
    last_triggered: '2024-08-14T14:45:00Z',
    trigger_count: 156
  }
]

export function NotificationSystem() {
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showCampaignDialog, setShowCampaignDialog] = useState(false)
  const [showRuleDialog, setShowRuleDialog] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'sent':
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
      case 'sending':
      case 'testing':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
      case 'paused':
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'sent':
      case 'delivered':
        return CheckCircle
      case 'scheduled':
      case 'sending':
      case 'testing':
        return Clock
      case 'draft':
      case 'paused':
      case 'inactive':
        return Pause
      case 'error':
      case 'cancelled':
      case 'failed':
        return XCircle
      default:
        return AlertTriangle
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail
      case 'sms': return MessageSquare
      case 'push': return Smartphone
      case 'in_app': return Monitor
      case 'slack': return MessageSquare
      case 'webhook': return Zap
      default: return Bell
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount)
  }

  const totalSent = mockChannels.reduce((sum, channel) => sum + channel.delivery_stats.sent, 0)
  const totalDelivered = mockChannels.reduce((sum, channel) => sum + channel.delivery_stats.delivered, 0)
  const totalOpened = mockChannels.reduce((sum, channel) => sum + channel.delivery_stats.opened, 0)
  const activeChannels = mockChannels.filter(c => c.status === 'active').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="h-8 w-8 mr-3 text-blue-600" />
            Notification System
          </h1>
          <p className="text-gray-600">
            Comprehensive in-app, email, and SMS notification management for enhanced user engagement.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Global Settings
          </Button>
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Notification Template</DialogTitle>
                <DialogDescription>
                  Create a reusable template for your notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input placeholder="Enter template name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject Template</Label>
                  <Input placeholder="Email subject with {VARIABLES}" />
                </div>
                <div className="space-y-2">
                  <Label>Content Template</Label>
                  <Textarea placeholder="Message content with {VARIABLES}" rows={6} />
                </div>
                <div className="space-y-2">
                  <Label>Channels</Label>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email" defaultChecked />
                      <Label htmlFor="email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="sms" />
                      <Label htmlFor="sms">SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="push" />
                      <Label htmlFor="push">Push</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="in_app" defaultChecked />
                      <Label htmlFor="in_app">In-App</Label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="personalization" />
                    <Label htmlFor="personalization">Enable personalization</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="optimal_time" />
                    <Label htmlFor="optimal_time">Optimal send time</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                  Cancel
                </Button>
                <Button>Create Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Total Sent
            </CardTitle>
            <div className="text-2xl font-bold">{formatNumber(totalSent)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all channels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Delivery Rate
            </CardTitle>
            <div className="text-2xl font-bold">
              {((totalDelivered / totalSent) * 100).toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {formatNumber(totalDelivered)} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Open Rate
            </CardTitle>
            <div className="text-2xl font-bold">
              {((totalOpened / totalDelivered) * 100).toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {formatNumber(totalOpened)} opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Active Channels
            </CardTitle>
            <div className="text-2xl font-bold">{activeChannels}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockChannels.length - activeChannels} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          {/* Notification Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockChannels.map((channel) => {
              const StatusIcon = getStatusIcon(channel.status)
              const ChannelIcon = getChannelIcon(channel.type)
              const deliveryRate = (channel.delivery_stats.delivered / channel.delivery_stats.sent) * 100
              const openRate = (channel.delivery_stats.opened / channel.delivery_stats.delivered) * 100
              
              return (
                <Card key={channel.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <ChannelIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{channel.name}</span>
                            <Badge className={getStatusColor(channel.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {channel.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {channel.provider} • {formatCurrency(channel.cost_per_message)} per message
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {deliveryRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">delivery rate</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Messages Sent</div>
                          <div className="text-lg font-bold">{formatNumber(channel.delivery_stats.sent)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Open Rate</div>
                          <div className="text-lg font-bold text-blue-600">{openRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Delivered</div>
                          <div className="text-lg font-bold text-green-600">{formatNumber(channel.delivery_stats.delivered)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Failed</div>
                          <div className="text-lg font-bold text-red-600">{formatNumber(channel.delivery_stats.failed)}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Delivery Performance</span>
                          <span className="font-medium">{deliveryRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={deliveryRate} className="h-2" />
                      </div>

                      <div className="text-sm text-gray-500">
                        Last used: {formatDateTime(channel.last_used)}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Notification Templates */}
          <div className="space-y-6">
            {mockTemplates.map((template) => {
              const StatusIcon = template.is_active ? CheckCircle : XCircle
              
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{template.name}</span>
                            <Badge variant="outline" className="capitalize">
                              {template.type}
                            </Badge>
                            <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {template.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {template.usage_stats.sent_count}
                        </div>
                        <div className="text-xs text-gray-500">times used</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Open Rate</div>
                          <div className="font-bold text-green-600">{template.usage_stats.open_rate}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Click Rate</div>
                          <div className="font-bold text-blue-600">{template.usage_stats.click_rate}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Conversion Rate</div>
                          <div className="font-bold text-purple-600">{template.usage_stats.conversion_rate}%</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Channels</div>
                        <div className="flex flex-wrap gap-1">
                          {template.channels.map((channel, index) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize">
                              {channel.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Subject Template</div>
                        <div className="bg-gray-50 p-2 rounded text-sm font-mono">
                          {template.subject_template}
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

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Created By</div>
                          <div className="font-medium">{template.created_by}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Created</div>
                          <div className="font-medium">{formatDate(template.created_at)}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
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
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Notification Campaigns */}
          <div className="space-y-6">
            {mockCampaigns.map((campaign) => {
              const StatusIcon = getStatusIcon(campaign.status)
              const deliveryRate = campaign.delivery_stats.total_sent > 0 
                ? (campaign.delivery_stats.delivered / campaign.delivery_stats.total_sent) * 100 
                : 0
              const openRate = campaign.delivery_stats.delivered > 0 
                ? (campaign.delivery_stats.opened / campaign.delivery_stats.delivered) * 100 
                : 0
              
              return (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Megaphone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{campaign.name}</span>
                            <Badge className={getStatusColor(campaign.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {campaign.status}
                            </Badge>
                            {campaign.schedule.recurring && (
                              <Badge variant="outline" className="text-xs">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {formatNumber(campaign.target_audience.estimated_reach)}
                        </div>
                        <div className="text-xs text-gray-500">target reach</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaign.status === 'sent' && (
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {formatNumber(campaign.delivery_stats.total_sent)}
                            </div>
                            <div className="text-xs text-gray-600">Sent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {formatNumber(campaign.delivery_stats.delivered)}
                            </div>
                            <div className="text-xs text-gray-600">Delivered</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {formatNumber(campaign.delivery_stats.opened)}
                            </div>
                            <div className="text-xs text-gray-600">Opened</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {formatNumber(campaign.delivery_stats.clicked)}
                            </div>
                            <div className="text-xs text-gray-600">Clicked</div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Target Audience</div>
                          <div className="font-medium capitalize">{campaign.target_audience.type.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Created By</div>
                          <div className="font-medium">{campaign.created_by}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">
                            {campaign.status === 'sent' ? 'Sent At' : 'Scheduled For'}
                          </div>
                          <div className="font-medium">
                            {campaign.sent_at && formatDateTime(campaign.sent_at)}
                            {campaign.schedule.scheduled_at && !campaign.sent_at && formatDateTime(campaign.schedule.scheduled_at)}
                            {campaign.schedule.send_immediately && 'Immediate'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Created</div>
                          <div className="font-medium">{formatDate(campaign.created_at)}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Channels</div>
                        <div className="flex flex-wrap gap-1">
                          {campaign.channels.map((channel, index) => (
                            <Badge key={index} variant="outline" className="text-xs capitalize">
                              {channel.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Content Preview</div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-sm mb-1">{campaign.content.subject}</div>
                          <div className="text-sm text-gray-600">
                            {campaign.content.message.substring(0, 150)}...
                          </div>
                        </div>
                      </div>

                      {campaign.status === 'sent' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Delivery Rate</span>
                            <span className="font-medium">{deliveryRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={deliveryRate} className="h-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span>Open Rate</span>
                            <span className="font-medium">{openRate.toFixed(1)}%</span>
                          </div>
                          <Progress value={openRate} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        {campaign.status === 'draft' && (
                          <Button size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Send Now
                          </Button>
                        )}
                        {campaign.status === 'scheduled' && (
                          <Button size="sm" variant="outline">
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                        {campaign.status === 'sent' && (
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
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

        <TabsContent value="rules" className="space-y-6">
          {/* Automation Rules */}
          <div className="space-y-6">
            {mockRules.map((rule) => {
              const StatusIcon = rule.is_active ? CheckCircle : XCircle
              const priorityColor = {
                low: 'bg-gray-100 text-gray-800',
                medium: 'bg-blue-100 text-blue-800',
                high: 'bg-orange-100 text-orange-800',
                urgent: 'bg-red-100 text-red-800'
              }[rule.priority]
              
              return (
                <Card key={rule.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Zap className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{rule.name}</span>
                            <Badge className={rule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge className={priorityColor}>
                              {rule.priority}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{rule.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">
                          {formatNumber(rule.trigger_count)}
                        </div>
                        <div className="text-xs text-gray-500">triggers</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Trigger Event</div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-sm capitalize mb-1">
                            {rule.trigger.event.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-gray-600">
                            Conditions: {rule.trigger.conditions.length} rule{rule.trigger.conditions.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Actions ({rule.actions.length})</div>
                        <div className="space-y-2">
                          {rule.actions.map((action, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <div className="font-medium text-sm capitalize">
                                  {action.type.replace('_', ' ')}
                                </div>
                                {action.template_id && (
                                  <div className="text-xs text-gray-500">
                                    Template: {mockTemplates.find(t => t.id === action.template_id)?.name}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {action.channels?.map((channel, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {channel}
                                  </Badge>
                                ))}
                                {action.delay_minutes && action.delay_minutes > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {action.delay_minutes}m delay
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Created By</div>
                          <div className="font-medium">{rule.created_by}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Created</div>
                          <div className="font-medium">{formatDate(rule.created_at)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Last Triggered</div>
                          <div className="font-medium">
                            {rule.last_triggered ? formatDateTime(rule.last_triggered) : 'Never'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total Triggers</div>
                          <div className="font-medium">{formatNumber(rule.trigger_count)}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Rule
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-2" />
                          Test Rule
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
