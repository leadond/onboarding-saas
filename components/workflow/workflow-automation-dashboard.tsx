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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Workflow,
  WorkflowTemplate,
  WorkflowRun,
  ACTION_CONFIGS,
  ActionType,
  TriggerType
} from '@/lib/types/workflow'
import { AdvancedWorkflowBuilder } from './advanced-workflow-builder'
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  GitBranch,
  Mail,
  MessageSquare,
  CheckSquare,
  UserPlus,
  RefreshCw,
  Tag,
  Calendar,
  MessageCircle,
  Globe,
  Code,
  Search,
  Filter,
  TrendingUp,
  Users,
  Timer
} from 'lucide-react'

// Mock data
const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'New Client Welcome Sequence',
    description: 'Automated welcome emails and task creation for new clients',
    organization_id: '1',
    created_by: '1',
    status: 'active',
    trigger: {
      id: 't1',
      type: 'client_signed_up',
      config: {},
      enabled: true
    },
    actions: [
      {
        id: 'a1',
        type: 'send_email',
        name: 'Welcome Email',
        config: {
          template_id: 'welcome_template',
          subject: 'Welcome to {{company_name}}!',
          delay: 0
        },
        position: { x: 100, y: 100 },
        enabled: true
      },
      {
        id: 'a2',
        type: 'create_task',
        name: 'Setup Call Task',
        config: {
          title: 'Schedule setup call with {{client_name}}',
          assignee: 'auto',
          due_date: '+3 days'
        },
        position: { x: 300, y: 100 },
        enabled: true,
        delay: 60
      }
    ],
    conditions: [],
    settings: {
      timezone: 'America/New_York',
      notification_settings: {
        on_success: true,
        on_failure: true,
        recipients: ['admin@company.com']
      },
      execution_settings: {
        parallel_execution: false,
        max_concurrent_runs: 5,
        timeout_minutes: 30
      }
    },
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-14T00:00:00Z',
    last_run: '2024-08-15T02:30:00Z',
    run_count: 47,
    success_rate: 95.7
  },
  {
    id: '2',
    name: 'Kit Completion Follow-up',
    description: 'Send follow-up emails and create satisfaction survey',
    organization_id: '1',
    created_by: '2',
    status: 'active',
    trigger: {
      id: 't2',
      type: 'kit_completed',
      config: {},
      enabled: true
    },
    actions: [
      {
        id: 'a3',
        type: 'send_email',
        name: 'Completion Email',
        config: {
          template_id: 'completion_template',
          subject: 'Congratulations on completing your onboarding!'
        },
        position: { x: 100, y: 100 },
        enabled: true
      },
      {
        id: 'a4',
        type: 'create_task',
        name: 'Send Survey',
        config: {
          title: 'Send satisfaction survey to {{client_name}}',
          assignee: 'customer_success_team'
        },
        position: { x: 300, y: 100 },
        enabled: true,
        delay: 1440 // 24 hours
      }
    ],
    conditions: [],
    settings: {
      timezone: 'America/New_York',
      notification_settings: {
        on_success: false,
        on_failure: true,
        recipients: ['support@company.com']
      },
      execution_settings: {
        parallel_execution: true,
        max_concurrent_runs: 10,
        timeout_minutes: 15
      }
    },
    created_at: '2024-08-05T00:00:00Z',
    updated_at: '2024-08-12T00:00:00Z',
    last_run: '2024-08-14T18:45:00Z',
    run_count: 23,
    success_rate: 100
  },
  {
    id: '3',
    name: 'Abandoned Kit Recovery',
    description: 'Re-engage clients who haven\'t completed their onboarding',
    organization_id: '1',
    created_by: '1',
    status: 'inactive',
    trigger: {
      id: 't3',
      type: 'kit_abandoned',
      config: { days_inactive: 7 },
      enabled: false
    },
    actions: [
      {
        id: 'a5',
        type: 'send_email',
        name: 'Reminder Email',
        config: {
          template_id: 'reminder_template',
          subject: 'Complete your onboarding - we\'re here to help!'
        },
        position: { x: 100, y: 100 },
        enabled: true
      },
      {
        id: 'a6',
        type: 'assign_user',
        name: 'Assign Account Manager',
        config: {
          user_id: 'account_manager',
          role: 'editor'
        },
        position: { x: 300, y: 100 },
        enabled: true,
        delay: 2880 // 48 hours
      }
    ],
    conditions: [],
    settings: {
      timezone: 'America/New_York',
      notification_settings: {
        on_success: true,
        on_failure: true,
        recipients: ['sales@company.com']
      },
      execution_settings: {
        parallel_execution: false,
        max_concurrent_runs: 3,
        timeout_minutes: 45
      }
    },
    created_at: '2024-07-20T00:00:00Z',
    updated_at: '2024-08-10T00:00:00Z',
    last_run: null,
    success_rate: 0,
    run_count: 0
  }
]

const mockWorkflowRuns: WorkflowRun[] = [
  {
    id: '1',
    workflow_id: '1',
    status: 'completed',
    trigger_data: { client_id: '123', client_name: 'John Doe', company_name: 'Acme Corp' },
    started_at: '2024-08-15T02:30:00Z',
    completed_at: '2024-08-15T02:32:15Z',
    steps: [
      {
        id: 's1',
        action_id: 'a1',
        status: 'completed',
        started_at: '2024-08-15T02:30:00Z',
        completed_at: '2024-08-15T02:30:45Z',
        retry_count: 0
      },
      {
        id: 's2',
        action_id: 'a2',
        status: 'completed',
        started_at: '2024-08-15T02:31:00Z',
        completed_at: '2024-08-15T02:32:15Z',
        retry_count: 0
      }
    ]
  },
  {
    id: '2',
    workflow_id: '2',
    status: 'running',
    trigger_data: { client_id: '456', client_name: 'Jane Smith', kit_id: '789' },
    started_at: '2024-08-15T02:45:00Z',
    steps: [
      {
        id: 's3',
        action_id: 'a3',
        status: 'completed',
        started_at: '2024-08-15T02:45:00Z',
        completed_at: '2024-08-15T02:45:30Z',
        retry_count: 0
      },
      {
        id: 's4',
        action_id: 'a4',
        status: 'pending',
        retry_count: 0
      }
    ]
  },
  {
    id: '3',
    workflow_id: '1',
    status: 'failed',
    trigger_data: { client_id: '789', client_name: 'Bob Johnson', company_name: 'Tech Inc' },
    started_at: '2024-08-14T15:20:00Z',
    completed_at: '2024-08-14T15:21:30Z',
    error_message: 'Email service unavailable',
    steps: [
      {
        id: 's5',
        action_id: 'a1',
        status: 'failed',
        started_at: '2024-08-14T15:20:00Z',
        completed_at: '2024-08-14T15:21:30Z',
        error_message: 'SMTP connection timeout',
        retry_count: 3
      }
    ]
  }
]

const mockTemplates: WorkflowTemplate[] = [
  {
    id: '1',
    name: 'Client Onboarding Sequence',
    description: 'Complete client onboarding automation with welcome emails, task creation, and follow-ups',
    category: 'Client Management',
    tags: ['onboarding', 'email', 'tasks'],
    workflow: {
      name: 'Client Onboarding Sequence',
      description: 'Complete client onboarding automation',
      status: 'draft',
      trigger: {
        id: 't1',
        type: 'client_signed_up',
        config: {},
        enabled: true
      },
      actions: [],
      conditions: [],
      settings: {
        timezone: 'America/New_York',
        notification_settings: {
          on_success: true,
          on_failure: true,
          recipients: []
        },
        execution_settings: {
          parallel_execution: false,
          max_concurrent_runs: 5,
          timeout_minutes: 30
        }
      }
    },
    is_premium: false
  },
  {
    id: '2',
    name: 'Payment Follow-up',
    description: 'Automated payment reminders and follow-up sequences',
    category: 'Billing',
    tags: ['payment', 'reminders', 'billing'],
    workflow: {
      name: 'Payment Follow-up',
      description: 'Automated payment reminders',
      status: 'draft',
      trigger: {
        id: 't2',
        type: 'payment_received',
        config: {},
        enabled: true
      },
      actions: [],
      conditions: [],
      settings: {
        timezone: 'America/New_York',
        notification_settings: {
          on_success: false,
          on_failure: true,
          recipients: []
        },
        execution_settings: {
          parallel_execution: true,
          max_concurrent_runs: 10,
          timeout_minutes: 15
        }
      }
    },
    is_premium: true
  }
]

const TRIGGER_CONFIGS: Record<TriggerType, { name: string; description: string; icon: any }> = {
  kit_created: { name: 'Kit Created', description: 'When a new kit is created', icon: Plus },
  kit_completed: { name: 'Kit Completed', description: 'When a kit is completed', icon: CheckCircle },
  kit_abandoned: { name: 'Kit Abandoned', description: 'When a kit is abandoned', icon: XCircle },
  client_invited: { name: 'Client Invited', description: 'When a client is invited', icon: Mail },
  client_signed_up: { name: 'Client Signed Up', description: 'When a client signs up', icon: UserPlus },
  step_completed: { name: 'Step Completed', description: 'When a step is completed', icon: CheckSquare },
  document_signed: { name: 'Document Signed', description: 'When a document is signed', icon: CheckCircle },
  payment_received: { name: 'Payment Received', description: 'When payment is received', icon: CheckCircle },
  schedule_based: { name: 'Schedule Based', description: 'Based on a schedule', icon: Clock },
  webhook: { name: 'Webhook', description: 'External webhook trigger', icon: Globe },
  manual: { name: 'Manual', description: 'Manually triggered', icon: Play }
}

const ACTION_ICONS: Record<ActionType, any> = {
  send_email: Mail,
  send_sms: MessageSquare,
  create_task: CheckSquare,
  assign_user: UserPlus,
  update_status: RefreshCw,
  add_tag: Tag,
  create_calendar_event: Calendar,
  send_slack_message: MessageCircle,
  webhook_call: Globe,
  conditional_branch: GitBranch,
  wait: Clock,
  custom_script: Code
}

export function WorkflowAutomationDashboard() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredWorkflows = mockWorkflows.filter(workflow => {
    const matchesSearch = !searchTerm || 
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'inactive': return Pause
      case 'draft': return AlertCircle
      case 'completed': return CheckCircle
      case 'running': return Activity
      case 'failed': return XCircle
      case 'cancelled': return XCircle
      default: return AlertCircle
    }
  }

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 60) return `${diffSeconds}s`
    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `${diffMinutes}m ${diffSeconds % 60}s`
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours}h ${diffMinutes % 60}m`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflow Automation</h1>
          <p className="text-gray-600">
            Create and manage automated workflows to streamline your processes.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>
                  Start from scratch or choose from our pre-built templates.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <Tabs defaultValue="templates">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="scratch">From Scratch</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="templates" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {mockTemplates.map((template) => (
                        <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                              {template.is_premium && (
                                <Badge variant="secondary">Premium</Badge>
                              )}
                            </div>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {template.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Button size="sm">Use Template</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="scratch" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="workflow-name">Workflow Name</Label>
                        <Input id="workflow-name" placeholder="Enter workflow name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workflow-description">Description</Label>
                        <Input id="workflow-description" placeholder="Describe what this workflow does" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trigger-type">Trigger</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TRIGGER_CONFIGS).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button>Create Workflow</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Active Workflows
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockWorkflows.filter(w => w.status === 'active').length}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockWorkflows.filter(w => w.status === 'inactive').length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Total Runs
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockWorkflows.reduce((sum, w) => sum + w.run_count, 0)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockWorkflowRuns.filter(r => r.status === 'running').length} currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Success Rate
            </CardTitle>
            <div className="text-2xl font-bold">
              {Math.round(mockWorkflows.reduce((sum, w) => sum + w.success_rate, 0) / mockWorkflows.length)}%
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockWorkflowRuns.filter(r => r.status === 'failed').length} failed runs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Timer className="h-4 w-4 mr-2" />
              Avg. Runtime
            </CardTitle>
            <div className="text-2xl font-bold">2.3m</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Fastest: 45s
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="runs">Recent Runs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workflows List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkflows.map((workflow) => {
              const StatusIcon = getStatusIcon(workflow.status)
              const TriggerIcon = TRIGGER_CONFIGS[workflow.trigger.type]?.icon || Zap
              
              return (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <TriggerIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {workflow.description}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Play className="h-4 w-4 mr-2" />
                            Run Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="h-4 w-4 mr-2" />
                            View Runs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            {workflow.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(workflow.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {workflow.status}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {workflow.actions.length} actions
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4" />
                          <span>{workflow.run_count} runs</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{workflow.success_rate}% success</span>
                        </div>
                        {workflow.last_run && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {new Date(workflow.last_run).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Actions:</span>
                        <div className="flex space-x-1">
                          {workflow.actions.slice(0, 4).map((action) => {
                            const ActionIcon = ACTION_ICONS[action.type]
                            return (
                              <div
                                key={action.id}
                                className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"
                                title={action.name}
                              >
                                <ActionIcon className="h-3 w-3 text-gray-600" />
                              </div>
                            )
                          })}
                          {workflow.actions.length > 4 && (
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                              +{workflow.actions.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="runs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Runs</CardTitle>
              <CardDescription>
                Latest executions across all workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkflowRuns.map((run) => {
                  const workflow = mockWorkflows.find(w => w.id === run.workflow_id)
                  const StatusIcon = getStatusIcon(run.status)
                  
                  return (
                    <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-5 w-5 ${
                            run.status === 'completed' ? 'text-green-600' :
                            run.status === 'running' ? 'text-blue-600' :
                            run.status === 'failed' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                          <Badge className={getStatusColor(run.status)}>
                            {run.status}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-medium">{workflow?.name}</h4>
                          <p className="text-sm text-gray-600">
                            Started {new Date(run.started_at).toLocaleString()}
                          </p>
                          {run.error_message && (
                            <p className="text-sm text-red-600 mt-1">
                              Error: {run.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatDuration(run.started_at, run.completed_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {run.steps.filter(s => s.status === 'completed').length}/{run.steps.length} steps
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.is_premium && (
                      <Badge variant="secondary">Premium</Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{template.category}</span>
                      <Button size="sm">Use Template</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedWorkflowBuilder />
        </TabsContent>
      </Tabs>
    </div>
  )
}
