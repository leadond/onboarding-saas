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

// Comprehensive database types that match the actual schema
export interface ClientProgress {
  id: string
  kit_id: string
  client_email: string
  client_name?: string
  current_step: number
  completed_steps: number[]
  status: string
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  time_spent?: number
  response_data?: Record<string, any>
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  role: string
  provider: string
  status: string
  created_at: string
  updated_at: string
}

export interface Kit {
  id: string
  user_id: string
  name: string
  slug: string
  description?: string
  brand_color?: string
  status: string
  created_at: string
  updated_at: string
  step_count?: number
  kit_steps?: KitStep[]
}

export interface KitStep {
  id: string
  kit_id: string
  title: string
  description?: string
  step_type: string
  step_order: number
  content: Record<string, any>
  is_required: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  session_id?: string
  created_at: string
}

export interface WebhookEvent {
  id: string
  source: string
  event_type: string
  event_id: string
  event_data: Record<string, any>
  processed: boolean
  processed_at?: string
  created_at: string
}

export interface SecurityLog {
  id: string
  event_type: string
  metadata: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface RateLimit {
  id: string
  key: string
  count: number
  reset_time: number
  updated_at: string
}

// Helper type for database operations
export type DatabaseTables = {
  client_progress: ClientProgress
  profiles: Profile
  kits: Kit
  kit_steps: KitStep
  audit_logs: AuditLog
  webhook_events: WebhookEvent
  security_logs: SecurityLog
  rate_limits: RateLimit
}

// Generic database row type
export type Tables<T extends keyof DatabaseTables> = DatabaseTables[T]