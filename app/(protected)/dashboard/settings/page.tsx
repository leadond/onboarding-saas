'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/use-user'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  profileUpdateSchema,
  updatePasswordSchema,
  type ProfileUpdateFormData,
  type UpdatePasswordFormData,
} from '@/lib/validations/auth'
import { Eye, EyeOff, AlertCircle, CheckCircle, User } from 'lucide-react'

// Toast notification component (simple implementation)
const Toast = ({
  message,
  type,
  onClose
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) => (
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const validation = updatePasswordSchema.safeParse(passwordData)
    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        newErrors[error.path[0] as string] = error.message
      })
      setErrors(newErrors)
      return
    }

    await onSubmit(passwordData)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    })
    setErrors({})
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                className={errors.currentPassword ? 'border-red-500' : ''}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({
                  ...prev,
                  current: !prev.current
                }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-600">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                className={errors.newPassword ? 'border-red-500' : ''}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({
                  ...prev,
                  new: !prev.new
                }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmNewPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirmNewPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData(prev => ({
                  ...prev,
                  confirmNewPassword: e.target.value
                }))}
                className={errors.confirmNewPassword ? 'border-red-500' : ''}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({
                  ...prev,
                  confirm: !prev.confirm
                }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <p className="text-sm text-red-600">{errors.confirmNewPassword}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
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

export default function SettingsPage() {
  const { user, updateProfile, updatePassword, updating, error, clearError } = useUser()
  const { signOut } = useAuth()

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileUpdateFormData>({
    fullName: '',
    companyName: '',
    email: '',
    avatarUrl: '',
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
    if (user) {
      const newProfileData: ProfileUpdateFormData = {
        fullName: user.fullName || '',
        companyName: user.companyName || '',
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      }
      setProfileData(newProfileData)
      setHasUnsavedChanges(false)
    }

    // Load notification settings from localStorage
    const savedNotifications = localStorage.getItem('notifications')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Error loading notification settings:', error)
      }
    }
  }, [user])

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  // Handle profile form changes
  const handleProfileChange = (field: keyof ProfileUpdateFormData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    // Clear error for this field
    if (profileErrors[field]) {
      setProfileErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErrors({})
    clearError()

    const validation = profileUpdateSchema.safeParse(profileData)
    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.errors.forEach((error) => {
        newErrors[error.path[0] as string] = error.message
      })
      setProfileErrors(newErrors)
      return
    }

    const result = await updateProfile(profileData)
    if (result.success) {
      showToast('Profile updated successfully!', 'success')
      setHasUnsavedChanges(false)
    } else {
      showToast(result.error || 'Failed to update profile', 'error')
    }
  }

  // Handle password change
  const handlePasswordChange = async (data: UpdatePasswordFormData) => {
    const result = await updatePassword(data)
    if (result.success) {
      showToast('Password updated successfully!', 'success')
      setShowPasswordModal(false)
    } else {
      showToast(result.error || 'Failed to update password', 'error')
    }
  }

  // Handle notification changes
  const handleNotificationChange = (key: keyof typeof notifications, checked: boolean) => {
    const newNotifications = { ...notifications, [key]: checked }
    setNotifications(newNotifications)
    localStorage.setItem('notifications', JSON.stringify(newNotifications))
    showToast('Notification preferences saved!', 'success')
  }

  // Clear user error when component mounts
  useEffect(() => {
    if (error) {
      showToast(error, 'error')
      clearError()
    }
  }, [error, clearError])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
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
          disabled={!hasUnsavedChanges || updating}
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

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Full Name *
                </label>
                <Input
                  id="firstName"
                  value={profileData.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  placeholder="John Doe"
                  className={profileErrors.fullName ? 'border-red-500' : ''}
                  disabled={updating}
                />
                {profileErrors.fullName && (
                  <p className="text-sm text-red-600">{profileErrors.fullName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-medium">
                  Company
                </label>
                <Input
                  id="company"
                  value={profileData.companyName}
                  onChange={(e) => handleProfileChange('companyName', e.target.value)}
                  placeholder="Acme Corp"
                  className={profileErrors.companyName ? 'border-red-500' : ''}
                  disabled={updating}
                />
                {profileErrors.companyName && (
                  <p className="text-sm text-red-600">{profileErrors.companyName}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className={profileErrors.email ? 'border-red-500' : ''}
                  disabled={updating}
                />
                {profileErrors.email && (
                  <p className="text-sm text-red-600">{profileErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="avatar" className="text-sm font-medium">
                  Avatar URL
                </label>
                <Input
                  id="avatar"
                  type="url"
                  value={profileData.avatarUrl}
                  onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className={profileErrors.avatarUrl ? 'border-red-500' : ''}
                  disabled={updating}
                />
                {profileErrors.avatarUrl && (
                  <p className="text-sm text-red-600">{profileErrors.avatarUrl}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Keep your account secure with a strong password
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                disabled={updating}
              >
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" disabled>
                Enable 2FA
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h3 className="font-medium">Active Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your active login sessions
                </p>
              </div>
              <Button variant="outline" disabled>
                View Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your onboarding kits
                </p>
              </div>
              <Checkbox
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) =>
                  handleNotificationChange('emailNotifications', checked as boolean)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Client Completion Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Get notified when clients complete onboarding steps
                </p>
              </div>
              <Checkbox
                checked={notifications.clientCompletionAlerts}
                onCheckedChange={(checked) =>
                  handleNotificationChange('clientCompletionAlerts', checked as boolean)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Weekly Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Receive weekly analytics and performance reports
                </p>
              </div>
              <Checkbox
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) =>
                  handleNotificationChange('weeklyReports', checked as boolean)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Marketing Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Stay updated with new features and product announcements
                </p>
              </div>
              <Checkbox
                checked={notifications.marketingUpdates}
                onCheckedChange={(checked) =>
                  handleNotificationChange('marketingUpdates', checked as boolean)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Invite team members and manage permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input placeholder="Enter email address" className="flex-1" />
            <Button disabled>
              Send Invite
            </Button>
          </div>
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.fullName || user.email} (You)</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Owner
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect OnboardKit with your favorite tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded bg-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DS</span>
                </div>
                <div>
                  <h3 className="font-medium">DocuSign</h3>
                  <p className="text-xs text-muted-foreground">Digital signatures</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Connect
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ZM</span>
                </div>
                <div>
                  <h3 className="font-medium">Zoom</h3>
                  <p className="text-xs text-muted-foreground">Video meetings</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Connect
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded bg-green-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <div>
                  <h3 className="font-medium">Slack</h3>
                  <p className="text-xs text-muted-foreground">Team communication</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Connect
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ST</span>
                </div>
                <div>
                  <h3 className="font-medium">Stripe</h3>
                  <p className="text-xs text-muted-foreground">Payment processing</p>
                </div>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled>
                Connected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" disabled>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
        loading={updating}
      />
    </div>
  )
}