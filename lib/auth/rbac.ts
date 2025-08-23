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

import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

// User context for RBAC
export interface UserContext {
  id: string
  email: string
  roles: string[]
  permissions: string[]
  organizationId: string | null
}

// RBAC Manager class
export class RBACManager {
  private supabase: any = null

  // Create user context from Supabase user
  async createUserContext(user: User): Promise<UserContext> {
    try {
      return {
        id: user.id,
        email: user.email || '',
        roles: ['user'],
        permissions: ['read'],
        organizationId: null,
      }
    } catch (error) {
      console.error('Error creating user context:', error)
      return {
        id: user.id,
        email: user.email || '',
        roles: ['user'],
        permissions: ['read'],
        organizationId: null,
      }
    }
  }

  // Check if user has specific permission
  async hasPermission(userContext: UserContext, permission: string): Promise<boolean> {
    return userContext.permissions.includes(permission)
  }

  // Check if user has specific role
  hasRole(userContext: UserContext, role: string): boolean {
    return userContext.roles.includes(role)
  }

  // Check if user belongs to organization
  belongsToOrganization(userContext: UserContext, organizationId: string): boolean {
    return userContext.organizationId === organizationId
  }
}

// Export singleton instance
export const rbacManager = new RBACManager()

// Helper functions for common checks
export const checkPermission = (userContext: UserContext, permission: string) =>
  rbacManager.hasPermission(userContext, permission)

export const checkRole = (userContext: UserContext, role: string) =>
  rbacManager.hasRole(userContext, role)

export const checkOrganization = (userContext: UserContext, organizationId: string) =>
  rbacManager.belongsToOrganization(userContext, organizationId)