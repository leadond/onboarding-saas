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

import { createServerSupabaseClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Unified client that works in both server and client contexts
export class UnifiedSupabaseClient {
  private client: SupabaseClient<Database> | null = null
  private isServer: boolean

  constructor() {
    this.isServer = typeof window === 'undefined'
  }

  async getClient(): Promise<SupabaseClient<Database>> {
    if (this.client) {
      return this.client
    }

    if (this.isServer) {
      this.client = await createServerClient()
    } else {
      this.client = createBrowserClient()
    }

    return this.client
  }

  // Convenience methods that automatically handle client creation
  async from(table: string) {
    const client = await this.getClient()
    return client.from(table)
  }

  async auth() {
    const client = await this.getClient()
    return client.auth
  }

  async storage() {
    const client = await this.getClient()
    return client.storage
  }
}

// Export singleton instances
export const unifiedSupabase = new UnifiedSupabaseClient()

// Helper function for quick access
export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  return unifiedSupabase.getClient()
}

// Legacy compatibility - gradually replace these
export { createServerClient, createBrowserClient }