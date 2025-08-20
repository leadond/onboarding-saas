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

// Re-export everything from unified client
export { 
  createClient, 
  createServerSupabaseClient as createServerClient,
  getSupabaseClient 
} from './unified'

// Re-export types
export type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/supabase'