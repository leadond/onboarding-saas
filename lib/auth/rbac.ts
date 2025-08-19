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

import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// User context for RBAC
export interface UserContext {
  id: string
  email: string
  roles: string[]
  permissions: string[]
  organizationId: string | null
}

// Permission structure
export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
}

// Role structure
export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
}

// RBAC Manager class
export class RBACManager {
  private supabase = createClient()

  // Create user context from Supabase user
  async createUserContext(user: User): Promise<UserContext> {
    try {
      // Get user roles and permissions from database
      const { data: userRoles, error: rolesError } = await this.supabase
        .from('organization_members')
        .select(`
          role,
          organization_id,
          organizations!inner(id, name)
        `)
        .eq('user_id', user.id)

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
      }

      // For now, return basic context with fallback values
      return {
        id: user.id,
        email: user.email || '',
        roles: userRoles?.map(r => r.role) || ['user'],
        permissions: ['read'], // Default permissions
        organizationId: userRoles?.[0]?.organization_id || null,
      }
    } catch (error) {
      console.error('Error creating user context:', error)
      // Return minimal context on error
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
    try {
      // Simple permission check - in production this would be more sophisticated
      if (userContext.permissions.includes(permission)) {
        return true
      }

      // Check role-based permissions
      if (userContext.roles.includes('admin') || userContext.roles.includes('owner')) {
        return true
      }

      // Check specific permission in database
      const { data, error } = await this.supabase
        .from('role_permissions')
        .select(`
          permissions!inner(name)
        `)
        .in('role_id', userContext.roles)

      if (error) {
        console.error('Error checking permissions:', error)
        return false
      }

      return data?.some(rp => (rp.permissions as any)?.name === permission) || false
    } catch (error) {
      console.error('Error in hasPermission:', error)
      return false
    }
  }

  // Check if user has specific role
  hasRole(userContext: UserContext, role: string): boolean {
    return userContext.roles.includes(role)
  }

  // Check if user belongs to organization
  belongsToOrganization(userContext: UserContext, organizationId: string): boolean {
    return userContext.organizationId === organizationId
  }

  // Get user permissions for resource
  async getResourcePermissions(userContext: UserContext, resource: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('role_permissions')
        .select(`
          permissions!inner(name, resource, action)
        `)
        .in('role_id', userContext.roles)
        .eq('permissions.resource', resource)

      if (error) {
        console.error('Error fetching resource permissions:', error)
        return []
      }

      return data?.map(rp => (rp.permissions as any)?.action) || []
    } catch (error) {
      console.error('Error in getResourcePermissions:', error)
      return []
    }
  }

  // Middleware for protecting routes
  async requirePermission(userContext: UserContext, permission: string): Promise<boolean> {
    const hasPermission = await this.hasPermission(userContext, permission)
    if (!hasPermission) {
      throw new Error(`Access denied: Missing permission '${permission}'`)
    }
    return true
  }

  // Middleware for protecting organization resources
  requireOrganization(userContext: UserContext, organizationId: string): boolean {
    if (!this.belongsToOrganization(userContext, organizationId)) {
      throw new Error('Access denied: Not a member of this organization')
    }
    return true
  }

  // Additional methods for team access
  async canAccessTeam(userId: string, organizationId: string, teamId: string, action: string): Promise<boolean> {
    try {
      // Check if user is member of the organization
      const { data: orgMember, error: orgError } = await this.supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .single()

      if (orgError || !orgMember) {
        return false
      }

      // Check if user is member of the team
      const { data: teamMember, error: teamError } = await this.supabase
        .from('team_members')
        .select('role')
        .eq('user_id', userId)
        .eq('team_id', teamId)

      if (teamError && action !== 'read') {
        return false
      }

      // Organization owners and admins can access all teams
      if (orgMember.role === 'owner' || orgMember.role === 'admin') {
        return true
      }

      // Team members can read, team leads can manage
      if (teamMember) {
        if (action === 'read') return true
        if (action === 'manage' && teamMember[0]?.role === 'lead') return true
      }

      return false
    } catch (error) {
      console.error('Error checking team access:', error)
      return false
    }
  }

  // Log activity method
  async logActivity(userId: string, action: string, resourceType: string, resourceId: string, metadata: any = {}): Promise<void> {
    try {
      await this.supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata,
        })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
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
