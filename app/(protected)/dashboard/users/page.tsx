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

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  role: string
  status: string
  provider?: string
  last_sign_in?: string
  created_at?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', full_name: '', company_name: '', role: 'user' })
  const [saving, setSaving] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')

  useEffect(() => {
    fetchUsers()
    fetchCurrentUserRole()
  }, [])

  const fetchCurrentUserRole = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const result = await response.json()
      
      if (result.success && result.data?.user) {
        setCurrentUserRole(result.data.user.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const result = await response.json()
      
      if (result.success && result.data?.users) {
        setUsers(result.data.users)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'
    
    try {
      const response = await fetch('/api/admin/suspend-user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      })
      
      if (response.ok) {
        toast({ title: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully` })
        fetchUsers()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' })
    }
  }

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({ 
          title: 'Password reset successfully', 
          description: `New password: ${result.data.newPassword}`,
          duration: 10000
        })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset password', variant: 'destructive' })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString()
  }

  if (loading) {
    return <div className="p-8">Loading users...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <Button onClick={() => setShowCreateUser(true)}>
          Create New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Company</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Last Sign In</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Badge variant={user.provider === 'google' ? 'default' : 'secondary'} className="text-xs">
                            {user.provider === 'google' ? 'Google' : 'Email'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{user.company_name || 'No company'}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{formatDate(user.last_sign_in)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendUser(user.id, user.status)}
                        >
                          {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetPassword(user.id, user.email)}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-email">Email</Label>
                <Input 
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@company.com"
                />
              </div>
              <div>
                <Label htmlFor="new-name">Full Name</Label>
                <Input 
                  id="new-name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              {/* Only show company field for global admin */}
              {currentUserRole === 'global_admin' && (
                <div>
                  <Label htmlFor="new-company">Company Name</Label>
                  <Input 
                    id="new-company"
                    value={newUser.company_name}
                    onChange={(e) => setNewUser({...newUser, company_name: e.target.value})}
                    placeholder="Company Name"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="new-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="super_user">Super User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button 
                onClick={async () => {
                  try {
                    setSaving(true)
                    const response = await fetch('/api/admin/create-user', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newUser)
                    })
                    
                    const result = await response.json()
                    
                    if (result.success) {
                      toast({ 
                        title: 'User created successfully', 
                        description: `Email: ${newUser.email} | Password: ${result.data.tempPassword}`,
                        duration: 10000
                      })
                      setShowCreateUser(false)
                      setNewUser({ email: '', full_name: '', company_name: '', role: 'user' })
                      fetchUsers()
                    } else {
                      throw new Error(result.error)
                    }
                  } catch (error) {
                    toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' })
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving || !newUser.email || !newUser.full_name}
              >
                {saving ? 'Creating...' : 'Create User'}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}