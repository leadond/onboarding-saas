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

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  role: string
  status: string
  avatar_url?: string
  provider?: string
  needs_setup?: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [companyUsers, setCompanyUsers] = useState<UserProfile[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Profile result:', result)
      
      if (result.success && result.data?.user) {
        setProfile(result.data.user)
        setIsAdmin(['global_admin', 'admin', 'super_admin'].includes(result.data.user.role))
        
        // If admin, fetch company users
        if (['admin', 'super_admin'].includes(result.data.user.role)) {
          fetchCompanyUsers()
        }
        
        // Check if user needs to complete setup
        if (result.data.user.needs_setup) {
          toast({
            title: 'Complete Your Profile',
            description: 'Please complete your profile setup to continue.',
          })
        }
      } else {
        throw new Error(result.error || 'Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: `Failed to load profile: ${error.message}`,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      
      if (!response.ok) {
        console.log('Admin users fetch failed:', response.status)
        return
      }
      
      const result = await response.json()
      
      if (result.success && result.data?.users) {
        setCompanyUsers(result.data.users)
      }
    } catch (error) {
      console.error('Error fetching company users:', error)
    }
  }

  const handleProfileSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      const targetUserId = selectedUserId || profile.id
      const response = await fetch(`/api/user/profile/${targetUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          company_name: profile.company_name,
          role: profile.role
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({ title: 'Profile updated successfully' })
        if (profile.needs_setup) {
          router.push('/dashboard')
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast({ title: 'Password updated successfully' })
    setLoading(false)
  }

  if (loading && !profile) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load profile data</p>
        </div>
      </div>
    )
  }

  const currentProfile = selectedUserId 
    ? companyUsers.find(u => u.id === selectedUserId) || profile
    : profile

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            {isAdmin && selectedUserId ? 'Manage user account settings' : 'Manage your account settings and preferences'}
          </p>
        </div>
        {profile.needs_setup && (
          <Badge variant="destructive">Setup Required</Badge>
        )}
      </div>

      {/* Admin User Selector */}
      {isAdmin && companyUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Company Users</CardTitle>
            <CardDescription>
              Select a user to manage their profile settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedUserId || profile.id} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user to manage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={profile.id}>My Profile</SelectItem>
                {companyUsers.filter(u => u.id !== profile.id).map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email} ({user.role}) {user.status === 'suspended' && '- SUSPENDED'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information and profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Avatar</Label>
              <div className="flex items-center space-x-4">
                {currentProfile.avatar_url ? (
                  <img 
                    src={currentProfile.avatar_url} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {currentProfile.full_name ? currentProfile.full_name.charAt(0).toUpperCase() : currentProfile.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast({ title: 'Error', description: 'File size must be less than 2MB', variant: 'destructive' })
                          return
                        }
                        
                        setSaving(true)
                        try {
                          const formData = new FormData()
                          formData.append('avatar', file)
                          
                          const response = await fetch('/api/user/avatar', {
                            method: 'POST',
                            body: formData
                          })
                          
                          const result = await response.json()
                          
                          if (result.success) {
                            toast({ title: 'Avatar updated successfully!' })
                            // Update profile with new avatar URL
                            if (profile) {
                              setProfile({...profile, avatar_url: result.data.avatar_url})
                            }
                          } else {
                            throw new Error(result.error)
                          }
                        } catch (error) {
                          toast({ title: 'Error', description: 'Failed to upload avatar', variant: 'destructive' })
                        } finally {
                          setSaving(false)
                        }
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    Upload New Avatar
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                name="name"
                autoComplete="name"
                value={currentProfile.full_name || ''}
                onChange={(e) => {
                  if (selectedUserId) {
                    setCompanyUsers(users => users.map(u => 
                      u.id === selectedUserId ? {...u, full_name: e.target.value} : u
                    ))
                  } else {
                    setProfile({...profile, full_name: e.target.value})
                  }
                }}
                placeholder="Enter full name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={currentProfile.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input 
                id="company"
                name="company"
                autoComplete="organization"
                value={currentProfile.company_name || ''}
                onChange={(e) => {
                  if (selectedUserId) {
                    setCompanyUsers(users => users.map(u => 
                      u.id === selectedUserId ? {...u, company_name: e.target.value} : u
                    ))
                  } else {
                    setProfile({...profile, company_name: e.target.value})
                  }
                }}
                placeholder="Enter company name" 
              />
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={currentProfile.role} 
                  onValueChange={(value) => {
                    if (selectedUserId) {
                      setCompanyUsers(users => users.map(u => 
                        u.id === selectedUserId ? {...u, role: value} : u
                      ))
                    } else {
                      setProfile({...profile, role: value})
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="super_user">Super User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    {profile?.role === 'global_admin' && (
                      <SelectItem value="global_admin">Global Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Badge variant={currentProfile.provider === 'google' ? 'default' : 'secondary'}>
                {currentProfile.provider === 'google' ? '🔗 Google Account' : '📧 Email Account'}
              </Badge>
              <Badge variant={currentProfile.status === 'active' ? 'success' : 'secondary'}>
                {currentProfile.status}
              </Badge>
              {currentProfile.provider === 'google' && (
                <Badge variant="outline">
                  OAuth Connected
                </Badge>
              )}
            </div>
            <div className="flex justify-between">
              <Button onClick={handleProfileSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  try {
                    const supabase = createClient()
                    await supabase.auth.signOut()
                    window.location.href = '/login'
                  } catch (error) {
                    console.error('Logout error:', error)
                  }
                }}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Authentication Method Display */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Authentication Method</span>
                <div className="flex items-center space-x-2">
                  {currentProfile.provider === 'google' ? (
                    <>
                      <div className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Google OAuth</span>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">@</span>
                      </div>
                      <span className="text-sm font-medium">Email & Password</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {currentProfile.provider === 'google' 
                  ? 'This account uses Google for authentication. Password changes must be done through Google.'
                  : 'This account uses email and password authentication.'
                }
              </p>
            </div>

            {/* Password fields only for non-Google users */}
            {currentProfile.provider !== 'google' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input 
                    id="current" 
                    name="current-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter current password" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input 
                    id="new" 
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input 
                    id="confirm" 
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password" 
                  />
                </div>
                <Button onClick={handlePasswordUpdate} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch 
                id="email-notif"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notif">Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <Switch 
                id="push-notif"
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing">Marketing Emails</Label>
                <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
              </div>
              <Switch 
                id="marketing"
                checked={notifications.marketing}
                onCheckedChange={(checked) => setNotifications({...notifications, marketing: checked})}
              />
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and billing information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Current Plan</span>
                <span className="text-green-600 font-medium">Pro Plan</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">$29/month • Next billing: Jan 15, 2024</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Change Plan</Button>
                <Button variant="outline" size="sm">View Invoices</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}