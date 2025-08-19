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

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  created_at: string
  updated_at: string
  subscription_tier: 'starter' | 'professional' | 'enterprise'
  settings: OrganizationSettings
}

export interface OrganizationSettings {
  allow_team_creation: boolean
  max_teams: number
  max_members: number
  require_2fa: boolean
  session_timeout: number
  allowed_domains: string[]
  sso_enabled: boolean
}

export interface Team {
  id: string
  organization_id: string
  name: string
  description?: string
  color: string
  created_at: string
  updated_at: string
  created_by: string
  settings: TeamSettings
}

export interface TeamSettings {
  default_role: Role
  allow_guest_access: boolean
  require_approval: boolean
  auto_assign_kits: boolean
}

export interface TeamMember {
  id: string
  team_id: string
  user_id: string
  role: Role
  invited_by: string
  joined_at: string
  last_active: string
  status: 'active' | 'inactive' | 'pending' | 'suspended'
}

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  last_login: string
  is_verified: boolean
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationSettings
}

export interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  digest_frequency: 'daily' | 'weekly' | 'monthly' | 'never'
  mention_notifications: boolean
  assignment_notifications: boolean
}

export type Role = 'owner' | 'admin' | 'manager' | 'editor' | 'viewer' | 'guest'

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

export interface RolePermission {
  role: Role
  permissions: Permission[]
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 100,
  admin: 80,
  manager: 60,
  editor: 40,
  viewer: 20,
  guest: 10
}

export const DEFAULT_PERMISSIONS: RolePermission[] = [
  {
    role: 'owner',
    permissions: [
      { id: '1', name: 'organization.manage', description: 'Manage organization settings', resource: 'organization', action: 'manage' },
      { id: '2', name: 'team.create', description: 'Create teams', resource: 'team', action: 'create' },
      { id: '3', name: 'team.manage', description: 'Manage all teams', resource: 'team', action: 'manage' },
      { id: '4', name: 'user.invite', description: 'Invite users', resource: 'user', action: 'invite' },
      { id: '5', name: 'user.manage', description: 'Manage all users', resource: 'user', action: 'manage' },
      { id: '6', name: 'kit.create', description: 'Create kits', resource: 'kit', action: 'create' },
      { id: '7', name: 'kit.manage', description: 'Manage all kits', resource: 'kit', action: 'manage' },
      { id: '8', name: 'analytics.view', description: 'View analytics', resource: 'analytics', action: 'view' },
      { id: '9', name: 'billing.manage', description: 'Manage billing', resource: 'billing', action: 'manage' }
    ]
  },
  {
    role: 'admin',
    permissions: [
      { id: '2', name: 'team.create', description: 'Create teams', resource: 'team', action: 'create' },
      { id: '3', name: 'team.manage', description: 'Manage all teams', resource: 'team', action: 'manage' },
      { id: '4', name: 'user.invite', description: 'Invite users', resource: 'user', action: 'invite' },
      { id: '5', name: 'user.manage', description: 'Manage all users', resource: 'user', action: 'manage' },
      { id: '6', name: 'kit.create', description: 'Create kits', resource: 'kit', action: 'create' },
      { id: '7', name: 'kit.manage', description: 'Manage all kits', resource: 'kit', action: 'manage' },
      { id: '8', name: 'analytics.view', description: 'View analytics', resource: 'analytics', action: 'view' }
    ]
  },
  {
    role: 'manager',
    permissions: [
      { id: '4', name: 'user.invite', description: 'Invite users', resource: 'user', action: 'invite' },
      { id: '6', name: 'kit.create', description: 'Create kits', resource: 'kit', action: 'create' },
      { id: '10', name: 'kit.edit', description: 'Edit assigned kits', resource: 'kit', action: 'edit' },
      { id: '8', name: 'analytics.view', description: 'View analytics', resource: 'analytics', action: 'view' }
    ]
  },
  {
    role: 'editor',
    permissions: [
      { id: '6', name: 'kit.create', description: 'Create kits', resource: 'kit', action: 'create' },
      { id: '10', name: 'kit.edit', description: 'Edit assigned kits', resource: 'kit', action: 'edit' },
      { id: '11', name: 'analytics.view_own', description: 'View own analytics', resource: 'analytics', action: 'view_own' }
    ]
  },
  {
    role: 'viewer',
    permissions: [
      { id: '12', name: 'kit.view', description: 'View kits', resource: 'kit', action: 'view' },
      { id: '11', name: 'analytics.view_own', description: 'View own analytics', resource: 'analytics', action: 'view_own' }
    ]
  },
  {
    role: 'guest',
    permissions: [
      { id: '13', name: 'kit.view_assigned', description: 'View assigned kits only', resource: 'kit', action: 'view_assigned' }
    ]
  }
]

export interface ActivityLog {
  id: string
  organization_id: string
  team_id?: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  ip_address: string
  user_agent: string
  created_at: string
}

export interface Invitation {
  id: string
  organization_id: string
  team_id?: string
  email: string
  role: Role
  invited_by: string
  expires_at: string
  accepted_at?: string
  created_at: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
}