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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, UserPlus, MoreHorizontal, Shield, User, Crown } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  company_name: string
  role: string
  status: string
  created_at: string
  last_sign_in_at?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // New state for Add User modal and form
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserFullName, setNewUserFullName] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')
  const [newUserCompanyName, setNewUserCompanyName] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Mock data for development
      const mockUsers: UserProfile[] = [
        {
          id: '1',
          email: 'leadond@gmail.com',
          full_name: 'Derrick Leadon',
          company_name: 'Dev App Hero',
          role: 'global_admin',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          last_sign_in_at: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          email: 'john.doe@example.com',
          full_name: 'John Doe',
          company_name: 'Example Corp',
          role: 'admin',
          status: 'active',
          created_at: '2024-01-16T09:00:00Z',
          last_sign_in_at: '2024-01-19T16:45:00Z'
        },
        {
          id: '3',
          email: 'jane.smith@demo.com',
          full_name: 'Jane Smith',
          company_name: 'Demo Inc',
          role: 'user',
          status: 'active',
          created_at: '2024-01-17T11:30:00Z',
          last_sign_in_at: '2024-01-18T13:20:00Z'
        },
        {
          id: '4',
          email: 'inactive@test.com',
          full_name: 'Inactive User',
          company_name: 'Test Company',
          role: 'user',
          status: 'inactive',
          created_at: '2024-01-10T08:00:00Z',
          last_sign_in_at: '2024-01-12T10:15:00Z'
        }
      ]
      
      setUsers(mockUsers)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'global_admin':
        return <Crown className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'global_admin':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'destructive'
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">👤 User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts, roles, and permissions across your organization.
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddUserModal(true)}>
          <UserPlus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-primary-600 font-semibold">👥 Total Users</CardDescription>
            <CardTitle className="text-3xl font-bold">{users.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-success-600 font-semibold">✅ Active Users</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-warning-600 font-semibold">🔧 Admins</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {users.filter(u => ['admin', 'global_admin'].includes(u.role)).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="text-destructive-600 font-semibold">⏸️ Inactive</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {users.filter(u => u.status === 'inactive').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Inactive accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{user.full_name}</h3>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Joined {formatDate(user.created_at)}
                    </p>
                    {user.last_sign_in_at && (
                      <p className="text-xs text-muted-foreground">
                        Last seen {formatDate(user.last_sign_in_at)}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Function to handle form submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)

    if (!newUserEmail || !newUserFullName) {
      setFormError('Email and full name are required.')
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newUserEmail,
          full_name: newUserFullName,
          role: newUserRole,
          company_name: newUserCompanyName || undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        setFormSuccess(data.data.message || 'User created successfully.')
        setNewUserEmail('')
        setNewUserFullName('')
        setNewUserRole('user')
        setNewUserCompanyName('')
        fetchUsers()
        setTimeout(() => {
          setShowAddUserModal(false)
          setFormSuccess('')
        }, 2000)
      } else {
        setFormError(data.error || 'Failed to create user.')
      }
    } catch (error) {
      setFormError('An error occurred while creating the user.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Existing UI */}
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">👤 User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage user accounts, roles, and permissions across your organization.
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setShowAddUserModal(true)}>
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-primary-600 font-semibold">👥 Total Users</CardDescription>
              <CardTitle className="text-3xl font-bold">{users.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-success-600 font-semibold">✅ Active Users</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {users.filter(u => u.status === 'active').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-warning-600 font-semibold">🔧 Admins</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {users.filter(u => ['admin', 'global_admin'].includes(u.role)).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Admin users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-destructive-600 font-semibold">⏸️ Inactive</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {users.filter(u => u.status === 'inactive').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Inactive accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {filteredUsers.length} of {users.length} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Joined {formatDate(user.created_at)}
                      </p>
                      {user.last_sign_in_at && (
                        <p className="text-xs text-muted-foreground">
                          Last seen {formatDate(user.last_sign_in_at)}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="global_admin">Global Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name (required for Global Admin)
                </label>
                <Input
                  id="companyName"
                  type="text"
                  value={newUserCompanyName}
                  onChange={(e) => setNewUserCompanyName(e.target.value)}
                  disabled={newUserRole !== 'global_admin'}
                  required={newUserRole === 'global_admin'}
                />
              </div>
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              {formSuccess && <p className="text-green-600 text-sm">{formSuccess}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddUserModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}