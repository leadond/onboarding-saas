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

'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Users,
  Plus,
  Settings,
  MoreHorizontal,
  Crown,
  User,
  Mail,
  Calendar,
  Activity,
  Shield,
  Edit,
  Trash2,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'

interface Team {
  id: string
  name: string
  description: string
  color: string
  team_lead: {
    id: string
    email: string
    full_name: string
  } | null
  member_count: number
  user_role: 'lead' | 'member' | null
  user_status: 'active' | 'inactive' | null
  created_at: string
  updated_at: string
}

interface TeamMember {
  id: string
  user: {
    id: string
    email: string
    full_name: string
    avatar_url?: string
  }
  role: 'lead' | 'member'
  status: 'active' | 'inactive'
  added_by: {
    id: string
    email: string
    full_name: string
  }
  added_at: string
}

interface Organization {
  id: string
  name: string
  role: string
}

interface TeamManagementDashboardProps {
  organizationId: string
  organization: Organization
  currentUserId: string
}

export function TeamManagementDashboard({ 
  organizationId, 
  organization, 
  currentUserId 
}: TeamManagementDashboardProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  // Form states
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#0066cc',
    team_lead_id: ''
  })

  const [newMember, setNewMember] = useState({
    user_id: '',
    role: 'member' as 'lead' | 'member'
  })

  useEffect(() => {
    fetchTeams()
  }, [organizationId])

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id)
    }
  }, [selectedTeam])

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/teams`, {
        headers: {
          'X-Organization-ID': organizationId
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTeams(result.data)
        
        // Select first team by default
        if (result.data.length > 0 && !selectedTeam) {
          setSelectedTeam(result.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeamMembers = async (teamId: string) => {
    setMembersLoading(true)
    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/teams/${teamId}/members`, {
        headers: {
          'X-Organization-ID': organizationId
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTeamMembers(result.data.members)
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error)
    } finally {
      setMembersLoading(false)
    }
  }

  const createTeam = async () => {
    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': organizationId
        },
        body: JSON.stringify(newTeam)
      })

      if (response.ok) {
        const result = await response.json()
        setTeams([...teams, result.data])
        setShowCreateDialog(false)
        setNewTeam({ name: '', description: '', color: '#0066cc', team_lead_id: '' })
        
        // Select the new team
        setSelectedTeam(result.data)
      }
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  const addTeamMember = async () => {
    if (!selectedTeam) return

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Organization-ID': organizationId
        },
        body: JSON.stringify(newMember)
      })

      if (response.ok) {
        const result = await response.json()
        setTeamMembers([...teamMembers, result.data])
        setShowAddMemberDialog(false)
        setNewMember({ user_id: '', role: 'member' })
        
        // Update team member count
        setTeams(teams.map(team => 
          team.id === selectedTeam.id 
            ? { ...team, member_count: team.member_count + 1 }
            : team
        ))
      }
    } catch (error) {
      console.error('Failed to add team member:', error)
    }
  }

  const removeTeamMember = async (memberId: string) => {
    if (!selectedTeam) return

    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/teams/${selectedTeam.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'X-Organization-ID': organizationId
        }
      })

      if (response.ok) {
        setTeamMembers(teamMembers.filter(member => member.id !== memberId))
        setShowDeleteDialog(null)
        
        // Update team member count
        setTeams(teams.map(team => 
          team.id === selectedTeam.id 
            ? { ...team, member_count: team.member_count - 1 }
            : team
        ))
      }
    } catch (error) {
      console.error('Failed to remove team member:', error)
    }
  }

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const canManageTeams = organization.role === 'owner' || organization.role === 'admin' || organization.role === 'manager'
  const canManageMembers = selectedTeam?.user_role === 'lead' || canManageTeams

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Team Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Manage teams and collaborate with your organization members
          </p>
        </div>
        {canManageTeams && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        )}
      </div>

      {/* Teams Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card 
            key={team.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTeam?.id === team.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedTeam(team)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: team.color }}
                  />
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </div>
                {team.user_role === 'lead' && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {team.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {team.member_count} member{team.member_count !== 1 ? 's' : ''}
                  </span>
                </div>
                {team.team_lead && (
                  <div className="flex items-center space-x-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {team.team_lead.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Lead</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Details */}
      {selectedTeam && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: selectedTeam.color }}
                />
                <div>
                  <CardTitle>{selectedTeam.name}</CardTitle>
                  <CardDescription>{selectedTeam.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {canManageMembers && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddMemberDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {canManageTeams && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Team
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Team
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="members" className="w-full">
              <TabsList>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members" className="space-y-4">
                {/* Search and Filter */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="lead">Leads</SelectItem>
                      <SelectItem value="member">Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Members List */}
                {membersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.user.avatar_url} />
                            <AvatarFallback>
                              {member.user.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{member.user.full_name}</span>
                              {member.role === 'lead' && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{member.user.email}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Added {new Date(member.added_at).toLocaleDateString()}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={member.role === 'lead' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                          {canManageMembers && member.user.id !== currentUserId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {member.status === 'active' ? (
                                    <>
                                      <EyeOff className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => setShowDeleteDialog(member.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="activity">
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4" />
                  <p>Team activity will be displayed here</p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>Team settings will be displayed here</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team to organize your organization members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                placeholder="Enter team description"
              />
            </div>
            <div>
              <Label htmlFor="team-color">Team Color</Label>
              <Input
                id="team-color"
                type="color"
                value={newTeam.color}
                onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createTeam} disabled={!newTeam.name}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a member to {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-email">Member Email</Label>
              <Input
                id="member-email"
                value={newMember.user_id}
                onChange={(e) => setNewMember({ ...newMember, user_id: e.target.value })}
                placeholder="Enter member email or ID"
              />
            </div>
            <div>
              <Label htmlFor="member-role">Role</Label>
              <Select 
                value={newMember.role} 
                onValueChange={(value: 'lead' | 'member') => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="lead">Team Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addTeamMember} disabled={!newMember.user_id}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => showDeleteDialog && removeTeamMember(showDeleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
