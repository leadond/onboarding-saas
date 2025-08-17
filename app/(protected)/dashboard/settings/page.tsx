'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, AlertCircle, Eye, EyeOff, Camera, X } from 'lucide-react'

// Types
interface UserProfile {
  id: string
  firstName: string
  lastName: string
  fullName: string
  companyName: string
  email: string
  avatarUrl?: string
  phone?: string
  jobTitle?: string
  timezone?: string
  language?: string
  createdAt: string
  updatedAt: string
}

interface ProfileUpdateFormData {
  fullName: string
  companyName: string
  email: string
  avatarUrl: string
}

interface UpdatePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg ${
    type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
  }`}>
    {type === 'success' ? (
      <CheckCircle className="h-5 w-5 mr-2" />
    ) : (
      <AlertCircle className="h-5 w-5 mr-2" />
    )}
    <span>{message}</span>
    <button
      onClick={onClose}
      className="ml-4 text-gray-500 hover:text-gray-700"
    >
      ×
    </button>
  </div>
)

// Password Change Modal Component
const PasswordChangeModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdatePasswordFormData) => Promise<void>
  loading: boolean
}) => {
  const [passwordData, setPasswordData] = useState<UpdatePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePasswordChange = (field: keyof UpdatePasswordFormData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validatePasswords = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }
    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePasswords()) {
      await onSubmit(passwordData)
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setErrors({})
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Change Password</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className={errors.currentPassword ? 'border-red-300' : ''}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className={errors.newPassword ? 'border-red-300' : ''}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
          </div>

          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmNewPassword}
                onChange={(e) => handlePasswordChange('confirmNewPassword', e.target.value)}
                className={errors.confirmNewPassword ? 'border-red-300' : ''}
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmNewPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmNewPassword}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Settings Component
const SettingsPage: React.FC = () => {
  // Demo user data
  const [user, setUser] = useState<UserProfile>({
    id: 'demo-user',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    companyName: 'Acme Corp',
    email: 'john.doe@example.com',
    avatarUrl: '',
    phone: '+1 (555) 123-4567',
    jobTitle: 'CEO',
    timezone: 'America/New_York',
    language: 'en',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  })

  // Loading states
  const [updating, setUpdating] = useState(false)
  const [passwordUpdating, setPasswordUpdating] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileUpdateFormData>({
    fullName: user.fullName,
    companyName: user.companyName,
    email: user.email,
    avatarUrl: user.avatarUrl || '',
  })

  // Form validation errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  
  // UI state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Notification settings (stored in localStorage)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    clientCompletionAlerts: true,
    weeklyReports: false,
    marketingUpdates: false,
  })

  // Load user data and notification settings on mount
  useEffect(() => {
    const newProfileData: ProfileUpdateFormData = {
      fullName: user.fullName || '',
      companyName: user.companyName || '',
      email: user.email,
      avatarUrl: user.avatarUrl || '',
    }
    setProfileData(newProfileData)
    setHasUnsavedChanges(false)

    // Load notification settings from localStorage
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Failed to parse saved notifications:', error)
      }
    }
  }, [user])

  // Track form changes
  useEffect(() => {
    const hasChanges = 
      profileData.fullName !== user.fullName ||
      profileData.companyName !== user.companyName ||
      profileData.email !== user.email ||
      profileData.avatarUrl !== (user.avatarUrl || '')
    
    setHasUnsavedChanges(hasChanges)
  }, [profileData, user])

  const handleProfileChange = (field: keyof ProfileUpdateFormData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {}

    if (!profileData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    if (!profileData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!profileData.companyName.trim()) {
      errors.companyName = 'Company name is required'
    }

    setProfileErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileSubmit = async () => {
    if (!validateProfile()) {
      return
    }

    setUpdating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user state
      setUser(prev => ({
        ...prev,
        fullName: profileData.fullName,
        companyName: profileData.companyName,
        email: profileData.email,
        avatarUrl: profileData.avatarUrl,
        updatedAt: new Date().toISOString()
      }))
      
      setToast({ message: 'Profile updated successfully!', type: 'success' })
      setHasUnsavedChanges(false)
    } catch (error) {
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' })
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordUpdate = async (passwordData: UpdatePasswordFormData) => {
    setPasswordUpdating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setToast({ message: 'Password updated successfully!', type: 'success' })
      setShowPasswordModal(false)
    } catch (error) {
      setToast({ message: 'Failed to update password. Please try again.', type: 'error' })
    } finally {
      setPasswordUpdating(false)
    }
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key]
    }
    setNotifications(newNotifications)
    localStorage.setItem('notifications', JSON.stringify(newNotifications))
    setToast({ message: 'Notification settings updated!', type: 'success' })
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a storage service
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        handleProfileChange('avatarUrl', result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">
            Manage your account settings, preferences, and team configuration.
          </p>
        </div>
        <Button
          onClick={handleProfileSubmit}
          disabled={updating || !hasUnsavedChanges}
        >
          {updating ? (
            <>
              <LoadingSpinner className="h-4 w-4 mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatarUrl} />
                    <AvatarFallback className="text-lg">
                      {profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-50">
                    <Camera className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user.fullName}</h3>
                  <p className="text-gray-500">{user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.jobTitle || 'User'}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className={profileErrors.fullName ? 'border-red-300' : ''}
                  />
                  {profileErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={profileErrors.email ? 'border-red-300' : ''}
                  />
                  {profileErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={profileData.companyName}
                    onChange={(e) => handleProfileChange('companyName', e.target.value)}
                    placeholder="Enter your company name"
                    className={profileErrors.companyName ? 'border-red-300' : ''}
                  />
                  {profileErrors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.companyName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={user.phone || ''}
                    placeholder="Enter your phone number"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-gray-500">Last updated: Never</p>
                </div>
                <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Login Activity</h4>
                  <p className="text-sm text-gray-500">Review recent login attempts</p>
                </div>
                <Button variant="outline" disabled>
                  View Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={() => handleNotificationChange('emailNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Client Completion Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified when clients complete tasks</p>
                  </div>
                  <Switch
                    checked={notifications.clientCompletionAlerts}
                    onCheckedChange={() => handleNotificationChange('clientCompletionAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={() => handleNotificationChange('weeklyReports')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Updates</h4>
                    <p className="text-sm text-gray-500">Receive product updates and news</p>
                  </div>
                  <Switch
                    checked={notifications.marketingUpdates}
                    onCheckedChange={() => handleNotificationChange('marketingUpdates')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Preferences</CardTitle>
              <CardDescription>
                Customize your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={user.timezone} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={user.language} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4 text-red-600">Danger Zone</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h5 className="font-medium text-red-800">Delete Account</h5>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" disabled>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordUpdate}
        loading={passwordUpdating}
      />
    </div>
  )
}

export default SettingsPage