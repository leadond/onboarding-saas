/*
 * Database Types Migration Helper
 * This file helps migrate from the old database types to the new unified types
 */

// Re-export the new types for easy migration
export type { 
  ClientProgress,
  Profile,
  Kit,
  KitStep,
  AuditLog,
  WebhookEvent,
  SecurityLog,
  RateLimit,
  DatabaseTables,
  Tables
} from '@/types/database'

// Legacy compatibility - gradually replace these imports
export type { Database } from '@/types/supabase'