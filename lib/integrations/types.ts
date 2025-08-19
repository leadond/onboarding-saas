/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

export type IntegrationCategory = 
  | 'communication'
  | 'automation' 
  | 'crm'
  | 'email_marketing'
  | 'database'
  | 'workspace'
  | 'documents'
  | 'accounting'
  | 'support'
  | 'scheduling'
  | 'calendar'
  | 'analytics'
  | 'development'
  | 'project_management'
  | 'forms'
  | 'video'

export type AuthType = 'oauth2' | 'api_key' | 'basic'

export type IntegrationStatus = 'connected' | 'error' | 'syncing' | 'disconnected'

export interface IntegrationProvider {
  id: string
  name: string
  slug: string
  category: IntegrationCategory
  description: string
  icon_url?: string
  auth_type: AuthType
  base_url?: string
  documentation_url?: string
  is_active: boolean
  features: Record<string, boolean>
  created_at: string
  updated_at: string
}

export interface UserIntegration {
  id: string
  user_id: string
  provider_id: string
  provider_slug: string
  connection_name?: string
  is_active: boolean
  auth_data: Record<string, any> // encrypted
  settings: Record<string, any>
  metadata: Record<string, any>
  last_sync?: string
  sync_status: IntegrationStatus
  error_message?: string
  created_at: string
  updated_at: string
  
  // Joined data
  provider?: IntegrationProvider
}

export interface IntegrationEvent {
  id: string
  user_id: string
  integration_id: string
  event_type: 'sync' | 'webhook' | 'action' | 'error'
  event_data: Record<string, any>
  status: 'success' | 'error' | 'pending'
  error_message?: string
  created_at: string
}

export interface IntegrationWebhook {
  id: string
  provider_slug: string
  webhook_id?: string
  user_id: string
  integration_id: string
  endpoint_url: string
  secret?: string
  events: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope?: string
  state?: string
}

export interface IntegrationAction {
  type: string
  label: string
  description: string
  required_scopes?: string[]
  parameters?: Record<string, any>
}

export interface IntegrationTrigger {
  type: string
  label: string
  description: string
  webhook_events?: string[]
  polling_interval?: number
}

// Integration-specific interfaces
export interface SlackIntegration extends UserIntegration {
  settings: {
    default_channel?: string
    notification_types?: string[]
    mention_users?: boolean
  }
  metadata: {
    team_name?: string
    team_id?: string
    bot_user_id?: string
  }
}

export interface ZapierIntegration extends UserIntegration {
  settings: {
    webhook_url?: string
    trigger_events?: string[]
  }
}

export interface CalendlyIntegration extends UserIntegration {
  settings: {
    default_event_type?: string
    buffer_time?: number
    working_hours?: Record<string, any>
  }
  metadata: {
    organization?: string
    user_uri?: string
  }
}

// Action/Trigger types for different integrations
export type IntegrationActionType = 
  // Slack
  | 'slack.send_message'
  | 'slack.create_channel'
  | 'slack.invite_user'
  // Email
  | 'email.send_message'
  | 'email.add_to_list'
  // CRM
  | 'crm.create_contact'
  | 'crm.update_deal'
  // Calendar
  | 'calendar.create_event'
  | 'calendar.book_meeting'
  // Documents
  | 'document.send_for_signature'
  | 'document.create_from_template'

export type IntegrationTriggerType =
  // Client events
  | 'client.invited'
  | 'client.completed_step'
  | 'client.completed_onboarding'
  | 'client.stuck'
  // Document events  
  | 'document.signed'
  | 'document.declined'
  // Calendar events
  | 'meeting.booked'
  | 'meeting.completed'