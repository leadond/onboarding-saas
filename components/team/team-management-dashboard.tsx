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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Users,
  Plus,
  Settings,
  Shield,
  Activity,
  Mail,
  MoreHorizontal,
  Crown,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter
} from 'lucide-react'
import { Organization, Team, TeamMember, User, Role, ActivityLog, Invitation } from '@/lib/types/team'

// Mock data for demonstration
const mockOrganization: Organization = {
  id: '1',
  name: 'Acme Corporation',
  slug: 'acme-corp',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-08-15T00:00:00Z',
  subscription_tier: 'enterprise',
  settings: {
    allow_team_creation: true,
    max_teams: 50,
    max_members: 500,
    require_2fa: true,
    session_timeout: 8,
    allowed_domains: ['acme.com', 'acme.co'],
    sso_enabled: true
  }
}

const mockTeams: Team[] = [
  {
    id: '1',
    organization_id: '1',
    name: 'Marketing Team',
    description: 'Client onboarding for marketing campaigns',
    color: '#3b82f6',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-08-10T00:00:00Z',
    created_by: '1',
    settings: {
      default_role: 'editor',
      allow_guest_access: true,
      require_approval: false,
      auto_assign_kits: true
    }
  },
  {
    id: '2',
    organization_id: '1',
    name: 'Sales Team',
    description: 'Customer onboarding workflows',
    color: '#10b981',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-08-12T00:00:00Z',
    created_by: '1',
    settings: {
      default_role: 'viewer',
      allow_guest_access: false,
      require_approval: true,
      auto_assign_kits: false
    }
  },
  {
    id: '3',
    organization_id: '1',
    name: 'Customer Success',
    description: 'Post-sale client onboarding',
    color: '#f59e0b',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-08-14T00:00:00Z',
    created_by: '2',
    settings: {
      default_role: 'editor',
      allow_guest_access: true,
      require_approval: false,
      auto_assign_kits: true
    }
  }
]

const mockMembers: TeamMember[] = [
  {
    id: '1',
    team_id: '1',
    user_id: '1',
    role: 'owner',
    invited_by: '1',
    joined_at: '2024-01-15T00:00:00Z',
    last_active: '2024-08-15T02:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    team_id: '1',
    user_id: '2',
    role: 'admin',
    invited_by: '1',
    joined_at: '2024-01-20T00:00:00Z',
    last_active: '2024-08-14T18:45:00Z',
    status: 'active'
  },
  {
    id: '3',
    team_id: '1',
    user_id: '3',
    role: 'editor',
    invited_by: '2',
    joined_at: '2024-02-01T00:00:00Z',
    last_active: '2024-08-15T01:15:00Z',
    status: 'active'
  },
  {
    id: '4',
    team_id: '2',
    user_id: '4',
    role: 'manager',
    invited_by: '1',
    joined_at: '2024-02-15T00:00:00Z',
    last_active: '2024-08-14T16:20:00Z',
    status: 'active'
  }
]

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@acme.com',
    full_name: 'John Smith',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2024-08-15T02:30:00Z',
    is_verified: true,
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
      notifications: {
        email_notifications: true,
        push_notifications: true,
        digest_frequency: 'daily',
        mention_notifications: true,
        assignment_notifications: true
      }
    }
  },
  {
    id: '2',
    email: 'sarah@acme.com',
    full_name: 'Sarah Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    created_at: '2024-01-10T00:00:00Z',
    last_login: '2024-08-14T18:45:00Z',
    is_verified: true,
    preferences: {
      theme: 'dark',
      language: 'en',
      timezone: 'America/Los_Angeles',
      notifications: {
        email_notifications: true,
        push_notifications: false,
        digest_frequency: 'weekly',
        mention_notifications: true,
        assignment_notifications: true
      }
    }
  },
  {
    id: '3',
    email: 'mike@acme.com',
    full_name: 'Mike Chen',
    created_at: '2024-01-25T00:00:00Z',
    last_login: '2024-08-15T01:15:00Z',
    is_verified: true,
    preferences: {
      theme: 'system',
      language: 'en',
      timezone: 'America/Chicago',
      notifications: {
        email_notifications: false,
        push_notifications: true,
        digest_frequency: 'never',
        mention_notifications: true,
        assignment_notifications: false
      }
    }
  },
  {
    id: '4',
    email: 'lisa@acme.com',
    full_name: 'Lisa Rodriguez',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    created_at: '2024-02-10T00:00:00Z',
    last_login: '2024-08-14T16:20:00Z',
    is_verified: true,
    preferences: {
      theme: 'light',
      language: 'es',
      timezone: 'America/Denver',
      notifications: {
        email_notifications: true,
        push_notifications: true,
        digest_frequency: 'daily',
        mention_notifications: true,
        assignment_notifications: true
      }
    }
  }
]

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    organization_id: '1',
    team_id: '1',
    user_id: '2',
    action: 'member.invited',
    resource_type: 'team_member',
    resource_id: '3',
    details: { email: 'mike@acme.com', role: 'editor' },
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    created_at: '2024-08-14T10:30:00Z'
  },
  {
    id: '2',
    organization_id: '1',
    team_id: '2',
    user_id: '1',
    action: 'team.created',
    resource_type: 'team',
    resource_id: '2',
    details: { name: 'Sales Team' },
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0...',
    created_at: '2024-08-14T09:15:00Z'
  },
  {
    id: '3',
    organization_id: '1',
    user_id: '3',
    action: 'kit.created',
    resource_type: 'kit',
    resource_id: '15',
    details: { name: 'New Client Onboarding v2' },
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0...',
    created_at: '2024-08-14T08:45:00Z'
  }
]

const ROLE_COLORS: Record<Role, string> = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  editor: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
  guest: 'bg-yellow-100 text-yellow-800'
}

const ROLE_ICONS: Record<Role, any> = {
  owner: Crown,
  admin: Shield,
  manager: UserCheck,
  editor: Users,
  viewer: Users,
  guest: UserX
}

export function TeamManagementDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(mockTeams[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('viewer')

  const filteredMembers = mockMembers
    .filter(member => 
      !selectedTeam || member.team_id === selectedTeam.id
    )
    .filter(member => {
      const user = mockUsers.find(u => u.id === member.user_id)
      const matchesSearch = !searchTerm || 
        user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || member.role === roleFilter
      return matchesSearch && matchesRole
    })

  const getUserById = (userId: string) => mockUsers.find(u => u.id === userId)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Active now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const handleInviteMember = () => {
    // In a real implementation, this would call an API
    console.log('Inviting member:', { email: inviteEmail, role: inviteRole, teamId: selectedTeam?.id })
    setShowInviteDialog(false)
    setInviteEmail('')
    setInviteRole('viewer')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">
            Manage teams, members, and permissions across your organization.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {selectedTeam?.name || 'your organization'}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: Role) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Teams</CardTitle>
            <div className="text-2xl font-bold">{mockTeams.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockOrganization.settings.max_teams - mockTeams.length} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Members</CardTitle>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockOrganization.settings.max_members - mockUsers.length} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Members</CardTitle>
            <div className="text-2xl font-bold">
              {mockMembers.filter(m => m.status === 'active').length}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockMembers.filter(m => m.status === 'pending').length} pending invites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Subscription</CardTitle>
            <div className="text-2xl font-bold capitalize">{mockOrganization.subscription_tier}</div>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">
              {mockOrganization.settings.sso_enabled ? 'SSO Enabled' : 'SSO Disabled'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTeams.map((team) => (
              <Card key={team.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="h-4 w-4 mr-2" />
                          Manage Members
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{team.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {mockMembers.filter(m => m.team_id === team.id).length} members
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedTeam(team)}
                    >
                      View Team
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={(value: Role | 'all') => setRoleFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={selectedTeam?.id || 'all'} 
              onValueChange={(value) => {
                if (value === 'all') {
                  setSelectedTeam(null)
                } else {
                  setSelectedTeam(mockTeams.find(t => t.id === value) || null)
                }
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {mockTeams.map(team => (
                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {filteredMembers.length} members
                {selectedTeam && ` in ${selectedTeam.name}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => {
                  const user = getUserById(member.user_id)
                  const RoleIcon = ROLE_ICONS[member.role]
                  
                  if (!user) return null

                  return (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{user.full_name}</h4>
                            {member.role === 'owner' && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={ROLE_COLORS[member.role]}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {member.role}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatLastActive(member.last_active)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Activity Log
              </CardTitle>
              <CardDescription>
                Recent team and organization activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivityLogs.map((log) => {
                  const user = getUserById(log.user_id)
                  const team = mockTeams.find(t => t.id === log.team_id)
                  
                  return (
                    <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {user ? getInitials(user.full_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{user?.full_name}</span>
                          <span className="text-sm text-gray-600">{log.action.replace('.', ' ')}</span>
                          {team && (
                            <Badge variant="outline" className="text-xs">
                              {team.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {JSON.stringify(log.details)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Configure team collaboration and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Team Management</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Allow team creation</Label>
                      <Badge variant={mockOrganization.settings.allow_team_creation ? 'default' : 'secondary'}>
                        {mockOrganization.settings.allow_team_creation ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Maximum teams</Label>
                      <span className="text-sm">{mockOrganization.settings.max_teams}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Maximum members</Label>
                      <span className="text-sm">{mockOrganization.settings.max_members}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Security</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Require 2FA</Label>
                      <Badge variant={mockOrganization.settings.require_2fa ? 'default' : 'secondary'}>
                        {mockOrganization.settings.require_2fa ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Session timeout</Label>
                      <span className="text-sm">{mockOrganization.settings.session_timeout}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>SSO</Label>
                      <Badge variant={mockOrganization.settings.sso_enabled ? 'default' : 'secondary'}>
                        {mockOrganization.settings.sso_enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Allowed Domains</h4>
                <div className="flex flex-wrap gap-2">
                  {mockOrganization.settings.allowed_domains.map((domain, index) => (
                    <Badge key={index} variant="outline">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
