export interface Workflow {
  id: string
  name: string
  description?: string
  organization_id: string
  created_by: string
  status: 'active' | 'inactive' | 'draft'
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  conditions: WorkflowCondition[]
  settings: WorkflowSettings
  created_at: string
  updated_at: string
  last_run: string | null
  run_count: number
  success_rate: number
}

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  config: Record<string, any>
  enabled: boolean
}

export type TriggerType = 
  | 'kit_created'
  | 'kit_completed'
  | 'kit_abandoned'
  | 'client_invited'
  | 'client_signed_up'
  | 'step_completed'
  | 'document_signed'
  | 'payment_received'
  | 'schedule_based'
  | 'webhook'
  | 'manual'

export interface WorkflowAction {
  id: string
  type: ActionType
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
  enabled: boolean
  delay?: number // in minutes
  retry_config?: RetryConfig
}

export type ActionType =
  | 'send_email'
  | 'send_sms'
  | 'create_task'
  | 'assign_user'
  | 'update_status'
  | 'add_tag'
  | 'create_calendar_event'
  | 'send_slack_message'
  | 'webhook_call'
  | 'conditional_branch'
  | 'wait'
  | 'custom_script'

export interface WorkflowCondition {
  id: string
  field: string
  operator: ConditionOperator
  value: any
  logical_operator?: 'AND' | 'OR'
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'
  | 'in_list'
  | 'not_in_list'

export interface WorkflowSettings {
  max_runs_per_day?: number
  timezone: string
  notification_settings: {
    on_success: boolean
    on_failure: boolean
    recipients: string[]
  }
  execution_settings: {
    parallel_execution: boolean
    max_concurrent_runs: number
    timeout_minutes: number
  }
}

export interface RetryConfig {
  max_attempts: number
  delay_minutes: number
  exponential_backoff: boolean
}

export interface WorkflowRun {
  id: string
  workflow_id: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  trigger_data: Record<string, any>
  started_at: string
  completed_at?: string
  error_message?: string
  steps: WorkflowRunStep[]
}

export interface WorkflowRunStep {
  id: string
  action_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  started_at?: string
  completed_at?: string
  error_message?: string
  output_data?: Record<string, any>
  retry_count: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  workflow: Omit<Workflow, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at' | 'last_run' | 'run_count' | 'success_rate'>
  preview_image?: string
  is_premium: boolean
}

export interface AutomationRule {
  id: string
  name: string
  description?: string
  organization_id: string
  workflow_id: string
  enabled: boolean
  conditions: WorkflowCondition[]
  schedule?: ScheduleConfig
  created_at: string
  updated_at: string
}

export interface ScheduleConfig {
  type: 'once' | 'recurring'
  start_date: string
  end_date?: string
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval?: number
  days_of_week?: number[] // 0-6, Sunday = 0
  time_of_day: string // HH:MM format
}

// Predefined action configurations
export const ACTION_CONFIGS: Record<ActionType, {
  name: string
  description: string
  icon: string
  category: string
  fields: ActionField[]
}> = {
  send_email: {
    name: 'Send Email',
    description: 'Send an email to specified recipients',
    icon: 'Mail',
    category: 'Communication',
    fields: [
      { name: 'to', type: 'email', required: true, label: 'To' },
      { name: 'subject', type: 'text', required: true, label: 'Subject' },
      { name: 'body', type: 'textarea', required: true, label: 'Message' },
      { name: 'template_id', type: 'select', required: false, label: 'Template' }
    ]
  },
  send_sms: {
    name: 'Send SMS',
    description: 'Send an SMS message',
    icon: 'MessageSquare',
    category: 'Communication',
    fields: [
      { name: 'to', type: 'phone', required: true, label: 'Phone Number' },
      { name: 'message', type: 'textarea', required: true, label: 'Message' }
    ]
  },
  create_task: {
    name: 'Create Task',
    description: 'Create a new task',
    icon: 'CheckSquare',
    category: 'Task Management',
    fields: [
      { name: 'title', type: 'text', required: true, label: 'Task Title' },
      { name: 'description', type: 'textarea', required: false, label: 'Description' },
      { name: 'assignee', type: 'user_select', required: false, label: 'Assignee' },
      { name: 'due_date', type: 'date', required: false, label: 'Due Date' },
      { name: 'priority', type: 'select', required: false, label: 'Priority', options: ['low', 'medium', 'high'] }
    ]
  },
  assign_user: {
    name: 'Assign User',
    description: 'Assign a user to a kit or task',
    icon: 'UserPlus',
    category: 'User Management',
    fields: [
      { name: 'user_id', type: 'user_select', required: true, label: 'User' },
      { name: 'role', type: 'select', required: false, label: 'Role', options: ['owner', 'editor', 'viewer'] }
    ]
  },
  update_status: {
    name: 'Update Status',
    description: 'Update the status of a kit or task',
    icon: 'RefreshCw',
    category: 'Status Management',
    fields: [
      { name: 'status', type: 'select', required: true, label: 'New Status', options: ['draft', 'active', 'completed', 'archived'] }
    ]
  },
  add_tag: {
    name: 'Add Tag',
    description: 'Add tags to a kit or client',
    icon: 'Tag',
    category: 'Organization',
    fields: [
      { name: 'tags', type: 'tag_select', required: true, label: 'Tags' }
    ]
  },
  create_calendar_event: {
    name: 'Create Calendar Event',
    description: 'Create a calendar event',
    icon: 'Calendar',
    category: 'Scheduling',
    fields: [
      { name: 'title', type: 'text', required: true, label: 'Event Title' },
      { name: 'start_time', type: 'datetime', required: true, label: 'Start Time' },
      { name: 'end_time', type: 'datetime', required: true, label: 'End Time' },
      { name: 'attendees', type: 'email_list', required: false, label: 'Attendees' },
      { name: 'description', type: 'textarea', required: false, label: 'Description' }
    ]
  },
  send_slack_message: {
    name: 'Send Slack Message',
    description: 'Send a message to a Slack channel',
    icon: 'MessageCircle',
    category: 'Communication',
    fields: [
      { name: 'channel', type: 'text', required: true, label: 'Channel' },
      { name: 'message', type: 'textarea', required: true, label: 'Message' }
    ]
  },
  webhook_call: {
    name: 'Webhook Call',
    description: 'Make an HTTP request to an external service',
    icon: 'Globe',
    category: 'Integration',
    fields: [
      { name: 'url', type: 'url', required: true, label: 'URL' },
      { name: 'method', type: 'select', required: true, label: 'Method', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { name: 'headers', type: 'key_value', required: false, label: 'Headers' },
      { name: 'body', type: 'textarea', required: false, label: 'Request Body' }
    ]
  },
  conditional_branch: {
    name: 'Conditional Branch',
    description: 'Branch workflow based on conditions',
    icon: 'GitBranch',
    category: 'Logic',
    fields: [
      { name: 'conditions', type: 'condition_builder', required: true, label: 'Conditions' }
    ]
  },
  wait: {
    name: 'Wait',
    description: 'Wait for a specified amount of time',
    icon: 'Clock',
    category: 'Timing',
    fields: [
      { name: 'duration', type: 'number', required: true, label: 'Duration (minutes)' }
    ]
  },
  custom_script: {
    name: 'Custom Script',
    description: 'Execute custom JavaScript code',
    icon: 'Code',
    category: 'Advanced',
    fields: [
      { name: 'script', type: 'code', required: true, label: 'JavaScript Code' }
    ]
  }
}

export interface ActionField {
  name: string
  type: 'text' | 'textarea' | 'email' | 'phone' | 'url' | 'number' | 'date' | 'datetime' | 'select' | 'user_select' | 'tag_select' | 'email_list' | 'key_value' | 'condition_builder' | 'code'
  required: boolean
  label: string
  placeholder?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}