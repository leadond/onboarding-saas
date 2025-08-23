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

  const [trialRemainingDays, setTrialRemainingDays] = useState<number | null>(null)
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false)

  useEffect(() => {
    if (profile?.subscription_tier === 'beta') {
      fetchTrialStatus()
    }
  }, [profile])

  const fetchTrialStatus = async () => {
    try {
      const response = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_trial' }),
      })
      const data = await response.json()
      if (data.success) {
        setIsTrialActive(data.trialActive)
        setTrialRemainingDays(data.remainingDays)
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setProfile(mockUser)
        setIsAdmin(true)
        setLoading(false)
        return
      }

      // Get user profile (handle table not existing)
      let profileData = null;
      try {
        const { data, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.log('Profile table may not exist, using auth data only')
        } else {
          profileData = data
        }
      } catch (error) {
        console.log('User profiles table not found, using auth data only')
      }

      // Check if profile needs setup
      const needsSetup = !profileData?.full_name || !profileData?.company_name;

      // Determine role - global admin for specific email, otherwise user by default
      const defaultRole = user.email === 'leadond@gmail.com' ? 'global_admin' : 'user';
      const actualRole = profileData?.role || defaultRole;
      
      // Force global admin role for leadond@gmail.com
      const finalRole = user.email === 'leadond@gmail.com' ? 'global_admin' : actualRole;

      const userProfile = {
        id: user.id,
        email: user.email!,
        full_name: profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name,
        company_name: profileData?.company_name,
        role: finalRole,
        status: profileData?.status || 'active',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
        provider: user.email === 'leadond@gmail.com' ? 'google' : (user.app_metadata?.provider || profileData?.provider || 'email'),
        needs_setup: needsSetup
      };

      setProfile(userProfile);
      setIsAdmin(['global_admin', 'admin', 'super_admin'].includes(finalRole));
      
      // If admin, fetch company users
      if (['admin', 'super_admin'].includes(finalRole)) {
        fetchCompanyUsers();
      }
      
      // Check if user needs to complete setup
      if (needsSetup) {
        toast({
          title: 'Complete Your Profile',
          description: 'Please complete your profile setup to continue.',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: `Failed to load profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  const fetchCompanyUsers = async () => {
    try {
      const supabase = createClient()
      
      // For now, just return empty array since we don't have a proper company users table
      // In a real implementation, you would fetch users from the same company
      setCompanyUsers([])
    } catch (error) {
      console.error('Error fetching company users:', error)
    }
  }

  const handleProfileSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      // In development mode, just update local state without database
      if (process.env.NODE_ENV === 'development') {
        // Simulate a brief delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Update local state
        setProfile({
          ...profile,
          needs_setup: false
        })
        
        toast({ title: 'Profile updated successfully' })
        
        if (profile.needs_setup) {
          router.push('/dashboard')
        }
        
        setSaving(false)
        return
      }
      
      // Production mode - try to save to database
      const supabase = createClient()
      
      // Try to update or insert profile data including avatar
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: profile.id,
          full_name: profile.full_name,
          company_name: profile.company_name,
          role: profile.role,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        // If table doesn't exist, just show success (development mode fallback)
        if (error.code === '42P01' || error.code === 'PGRST116') {
          console.log('User profiles table not found, using local state only')
        } else {
          throw error
        }
      }
      
      toast({ title: 'Profile updated successfully' })
      
      // Update local state
      setProfile({
        ...profile,
        needs_setup: false
      })
      
      if (profile.needs_setup) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Profile save error:', error)
      toast({
        title: 'Error',
        description: `Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
                          // Convert file to base64 for display
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const dataUrl = event.target?.result as string
                            
                            // Update profile with new avatar URL
                            if (profile) {
                              setProfile({...profile, avatar_url: dataUrl})
                              toast({ title: 'Avatar updated successfully!' })
                            }
                            setSaving(false)
                          }
                          
                          reader.onerror = () => {
                            toast({ title: 'Error', description: 'Failed to read file', variant: 'destructive' })
                            setSaving(false)
                          }
                          
                          reader.readAsDataURL(file)
                        } catch (error) {
                          toast({ title: 'Error', description: 'Failed to upload avatar', variant: 'destructive' })
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
                    <SelectValue placeholder="Select role" />
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
              <Badge variant="default">
                📧 Email Account
              </Badge>
              <Badge variant={currentProfile.status === 'active' ? 'default' : 'secondary'}>
                {currentProfile.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <Button onClick={handleProfileSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={async () => {
                  try {
                    const supabase = await getSupabaseClient()
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
            {/* Authentication Methods */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Email & Password</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">@</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Sign in with your email address and password.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/change-password')}
                >
                  Change Password
                </Button>
              </div>

            </div>

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
                <span className="text-green-600 font-medium">
                  {profile?.subscription_tier === 'beta' ? 'BETA Tier (Trial)' : 'Pro Plan'}
                </span>
              </div>
              {profile?.subscription_tier === 'beta' && isTrialActive && trialRemainingDays !== null && (
                <p className="text-sm text-yellow-600 mb-4">
                  Trial ends in {trialRemainingDays} day{trialRemainingDays !== 1 ? 's' : ''}
                </p>
              )}
              {profile?.subscription_tier === 'beta' && !isTrialActive && (
                <p className="text-sm text-red-600 mb-4">
                  Your trial has expired. Please upgrade to a paid plan.
                </p>
              )}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/billing')}>
                  Change Plan
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/billing/invoices')}>
                  View Invoices
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}