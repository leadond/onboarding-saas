'use client'

import React from 'react'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Plus,
  Crown,
  User,
  Mail,
  Calendar,
  Settings,
  Activity
} from 'lucide-react'

interface SimpleTeam {
  id: string
  name: string
  description: string
  color: string
  memberCount: number
  role: 'lead' | 'member' | null
  createdAt: string
}

interface SimpleTeamMember {
  id: string
  name: string
  email: string
  role: 'lead' | 'member'
  joinedAt: string
}

export function SimpleTeamDashboard() {
  const [teams, setTeams] = useState<SimpleTeam[]>([])
  const [selectedTeam, setSelectedTeam] = useState<SimpleTeam | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })

  const mockMembers: SimpleTeamMember[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'lead',
      joinedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'member',
      joinedAt: '2024-01-16'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'member',
      joinedAt: '2024-01-18'
    },
    {
      id: '4',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      role: 'member',
      joinedAt: '2024-01-20'
    }
  ]

  // Fetch teams from API
  const fetchTeams = async () => {
    try {
      setLoading(true)
      
      // For now, directly use the API mock data instead of making network calls
      // This avoids authentication issues during development
      setTimeout(() => {
        const mockTeams = [
          {
            id: '1',
            name: 'Development Team',
            description: 'Frontend and backend development',
            color: '#10B981',
            memberCount: 3,
            role: 'lead' as const,
            createdAt: '2024-01-15T00:00:00.000Z'
          },
          {
            id: '2',
            name: 'Design Team',
            description: 'UI/UX design and branding',
            color: '#3B82F6',
            memberCount: 2,
            role: 'member' as const,
            createdAt: '2024-01-10T00:00:00.000Z'
          },
          {
            id: '3',
            name: 'Marketing Team',
            description: 'Content creation and marketing campaigns',
            color: '#F59E0B',
            memberCount: 4,
            role: null,
            createdAt: '2024-01-20T00:00:00.000Z'
          }
        ]
        setTeams(mockTeams)
        setSelectedTeam(mockTeams[0])
        setLoading(false)
      }, 1000) // Simulate loading time
    } catch (error) {
      console.error('Error fetching teams:', error)
      setLoading(false)
    }
  }

  // Create a new team
  const createTeam = async () => {
    if (!newTeam.name.trim()) return

    try {
      setCreating(true)
      
      // Simulate API call with timeout
      setTimeout(() => {
        const createdTeam: SimpleTeam = {
          id: Date.now().toString(),
          name: newTeam.name.trim(),
          description: newTeam.description.trim(),
          color: newTeam.color,
          memberCount: 1,
          role: 'lead',
          createdAt: new Date().toISOString()
        }
        
        setTeams([createdTeam, ...teams])
        setSelectedTeam(createdTeam)
        setShowCreateDialog(false)
        setNewTeam({ name: '', description: '', color: '#3B82F6' })
        setCreating(false)
      }, 1500) // Simulate network delay
    } catch (error) {
      console.error('Error creating team:', error)
      setCreating(false)
    }
  }

  // Load teams on component mount
  React.useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Collaboration</h2>
          <p className="text-muted-foreground">
            Manage teams and collaborate with your organization members
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Teams Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                    <div className="h-4 bg-gray-300 rounded w-24" />
                  </div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-full mt-2" />
                <div className="h-3 bg-gray-300 rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-300 rounded" />
                    <div className="h-3 bg-gray-300 rounded w-16" />
                  </div>
                  <div className="h-5 bg-gray-300 rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first team to collaborate with your organization members.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                  {team.role === 'lead' && (
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
                      {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Badge variant={team.role === 'lead' ? 'default' : team.role === 'member' ? 'secondary' : 'outline'}>
                    {team.role || 'Not a member'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                <Badge variant={selectedTeam.role === 'lead' ? 'default' : 'secondary'}>
                  {selectedTeam.role === 'lead' ? 'Team Lead' : selectedTeam.role === 'member' ? 'Member' : 'Not a member'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                <div className="space-y-3">
                  {mockMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{member.name}</span>
                            {member.role === 'lead' && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={member.role === 'lead' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">{selectedTeam.memberCount}</p>
                        <p className="text-sm text-muted-foreground">Total Members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-muted-foreground">Active Kits</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-2xl font-bold">8</p>
                        <p className="text-sm text-muted-foreground">Integrations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              <div className="flex items-center space-x-2">
                <Input
                  id="team-color"
                  type="color"
                  value={newTeam.color}
                  onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={newTeam.color}
                  onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={createTeam} disabled={!newTeam.name.trim() || creating}>
              {creating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
