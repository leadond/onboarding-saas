'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  ArrowLeft, 
  Settings, 
  Save,
  Palette,
  Shield,
  BarChart3,
  Bell,
  Code,
  Search,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

type Kit = {
  id: string
  name: string
  slug: string
  status: string
}

type KitSettings = {
  basic: {
    name: string
    description: string
    slug: string
    status: string
  }
  branding: {
    logo_url: string
    primary_color: string
    secondary_color: string
    font_family: string
  }
  analytics: {
    enabled: boolean
  }
  notifications: {
    enabled: boolean
    email_notifications: string[]
    sms_notifications: boolean
    webhook_url: string
    webhook_events: string[]
  }
  security: {
    password_protected: boolean
    require_authentication: boolean
    allowed_domains: string[]
    session_timeout: number
    max_attempts: number
  }
  advanced: {
    custom_domain: string
    completion_redirect_url: string
    custom_css: string
    custom_js: string
  }
  seo: {
    meta_title: string
    meta_description: string
    social_image_url: string
  }
}

export default function KitSettingsPage({
  params,
}: {
  params: { kitId: string }
}) {
  const [kit, setKit] = useState<Kit | null>(null)
  const [settings, setSettings] = useState<KitSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/kits/${params.kitId}/settings`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch settings')
      }
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch settings')
      }
      
      setSettings(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchKit = async () => {
      try {
        const response = await fetch(`/api/kits/${params.kitId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch kit')
        }
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch kit')
        }
        setKit(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    fetchKit()
    fetchSettings()
  }, [params.kitId])

  const handleSaveSettings = async (section: keyof KitSettings) => {
    if (!settings) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const updateData: any = {}
      updateData[section] = settings[section]

      // Add password if provided for security section
      if (section === 'security' && passwordInput) {
        updateData.security = {
          ...updateData.security,
          password: passwordInput
        }
      }

      const response = await fetch(`/api/kits/${params.kitId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      const result = await response.json()
      
      setSuccess('Settings saved successfully!')
      setPasswordInput('')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (section: keyof KitSettings, field: string, value: any) => {
    if (!settings) return
    
    setSettings(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }))
  }

  const addArrayItem = (section: keyof KitSettings, field: string, value: string) => {
    if (!settings || !value.trim()) return
    
    const currentArray = (settings[section] as any)[field] || []
    if (!currentArray.includes(value.trim())) {
      updateSettings(section, field, [...currentArray, value.trim()])
    }
  }

  const removeArrayItem = (section: keyof KitSettings, field: string, index: number) => {
    if (!settings) return
    
    const currentArray = (settings[section] as any)[field] || []
    updateSettings(section, field, currentArray.filter((_: any, i: number) => i !== index))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error && !settings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/kits/${params.kitId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kit
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/kits/${kit?.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {kit?.name}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="h-8 w-8 mr-3" />
            Settings
          </h1>
          <p className="mt-2 text-gray-600">Configure your kit's behavior and appearance</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic details of your onboarding kit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Kit Name *
                </label>
                <Input
                  id="name"
                  value={settings?.basic.name || ''}
                  onChange={(e) => updateSettings('basic', 'name', e.target.value)}
                  placeholder="Enter kit name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={settings?.basic.description || ''}
                  onChange={(e) => updateSettings('basic', 'description', e.target.value)}
                  placeholder="Describe what this kit helps clients accomplish"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium">
                  URL Slug *
                </label>
                <Input
                  id="slug"
                  value={settings?.basic.slug || ''}
                  onChange={(e) => updateSettings('basic', 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="url-friendly-name"
                />
                <p className="text-xs text-gray-500">
                  Your kit will be available at: /kit/{settings?.basic.slug || 'your-slug'}
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('basic')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Basic Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Branding & Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your onboarding kit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="logo_url" className="text-sm font-medium">
                  Logo URL
                </label>
                <Input
                  id="logo_url"
                  type="url"
                  value={settings?.branding.logo_url || ''}
                  onChange={(e) => updateSettings('branding', 'logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="primary_color" className="text-sm font-medium">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={settings?.branding.primary_color || '#3b82f6'}
                      onChange={(e) => updateSettings('branding', 'primary_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings?.branding.primary_color || '#3b82f6'}
                      onChange={(e) => updateSettings('branding', 'primary_color', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="secondary_color" className="text-sm font-medium">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={settings?.branding.secondary_color || '#64748b'}
                      onChange={(e) => updateSettings('branding', 'secondary_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings?.branding.secondary_color || '#64748b'}
                      onChange={(e) => updateSettings('branding', 'secondary_color', e.target.value)}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="font_family" className="text-sm font-medium">
                  Font Family
                </label>
                <Select
                  value={settings?.branding.font_family || 'Inter'}
                  onValueChange={(value) => updateSettings('branding', 'font_family', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('branding')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Branding Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Settings */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics & Tracking
              </CardTitle>
              <CardDescription>
                Configure analytics and performance tracking for your kit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Enable Analytics</div>
                  <div className="text-sm text-gray-500">
                    Track client progress, completion rates, and performance metrics
                  </div>
                </div>
                <Switch
                  checked={settings?.analytics.enabled || false}
                  onCheckedChange={(checked) => updateSettings('analytics', 'enabled', checked)}
                />
              </div>

              {settings?.analytics.enabled && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Analytics Features</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Client progress tracking</li>
                    <li>• Step completion rates</li>
                    <li>• Time-to-completion metrics</li>
                    <li>• Conversion funnel analysis</li>
                    <li>• Export capabilities</li>
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('analytics')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Analytics Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications & Webhooks
              </CardTitle>
              <CardDescription>
                Configure how you receive updates about client progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Enable Notifications</div>
                  <div className="text-sm text-gray-500">
                    Receive updates when clients complete steps or finish the kit
                  </div>
                </div>
                <Switch
                  checked={settings?.notifications.enabled || false}
                  onCheckedChange={(checked) => updateSettings('notifications', 'enabled', checked)}
                />
              </div>

              {settings?.notifications.enabled && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Webhook URL</label>
                      <Input
                        type="url"
                        value={settings?.notifications.webhook_url || ''}
                        onChange={(e) => updateSettings('notifications', 'webhook_url', e.target.value)}
                        placeholder="https://your-app.com/webhooks/onboarding"
                      />
                      <p className="text-xs text-gray-500">
                        Receive real-time updates via HTTP POST requests
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Webhook Events</label>
                      <div className="space-y-2">
                        {['step_completed', 'kit_started', 'kit_completed', 'client_assigned'].map((event) => (
                          <div key={event} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={event}
                              checked={settings?.notifications.webhook_events?.includes(event) || false}
                              onChange={(e) => {
                                const events = settings?.notifications.webhook_events || []
                                if (e.target.checked) {
                                  updateSettings('notifications', 'webhook_events', [...events, event])
                                } else {
                                  updateSettings('notifications', 'webhook_events', events.filter(e => e !== event))
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={event} className="text-sm capitalize">
                              {event.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('notifications')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Access Control
              </CardTitle>
              <CardDescription>
                Configure security settings and access restrictions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Password Protection</div>
                  <div className="text-sm text-gray-500">
                    Require a password to access this kit
                  </div>
                </div>
                <Switch
                  checked={settings?.security.password_protected || false}
                  onCheckedChange={(checked) => updateSettings('security', 'password_protected', checked)}
                />
              </div>

              {settings?.security.password_protected && (
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Kit Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter new password (leave blank to keep current)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Timeout (seconds)</label>
                  <Input
                    type="number"
                    min="300"
                    max="86400"
                    value={settings?.security.session_timeout || 3600}
                    onChange={(e) => updateSettings('security', 'session_timeout', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    How long clients stay logged in (300-86400 seconds)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Login Attempts</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={settings?.security.max_attempts || 3}
                    onChange={(e) => updateSettings('security', 'max_attempts', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Number of failed attempts before temporary lockout
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('security')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Security Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Advanced settings for custom domains, redirects, and code injection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="custom_domain" className="text-sm font-medium">
                  Custom Domain
                </label>
                <Input
                  id="custom_domain"
                  value={settings?.advanced.custom_domain || ''}
                  onChange={(e) => updateSettings('advanced', 'custom_domain', e.target.value)}
                  placeholder="onboarding.yourdomain.com"
                />
                <p className="text-xs text-gray-500">
                  Use your own domain for this kit (requires DNS configuration)
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="completion_redirect_url" className="text-sm font-medium">
                  Completion Redirect URL
                </label>
                <Input
                  id="completion_redirect_url"
                  type="url"
                  value={settings?.advanced.completion_redirect_url || ''}
                  onChange={(e) => updateSettings('advanced', 'completion_redirect_url', e.target.value)}
                  placeholder="https://yourdomain.com/welcome"
                />
                <p className="text-xs text-gray-500">
                  Where to redirect clients after completing the kit
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="custom_css" className="text-sm font-medium">
                  Custom CSS
                </label>
                <Textarea
                  id="custom_css"
                  value={settings?.advanced.custom_css || ''}
                  onChange={(e) => updateSettings('advanced', 'custom_css', e.target.value)}
                  placeholder="/* Add your custom CSS here */"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="custom_js" className="text-sm font-medium">
                  Custom JavaScript
                </label>
                <Textarea
                  id="custom_js"
                  value={settings?.advanced.custom_js || ''}
                  onChange={(e) => updateSettings('advanced', 'custom_js', e.target.value)}
                  placeholder="// Add your custom JavaScript here"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  ⚠️ Use with caution. Invalid code may break your kit.
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSaveSettings('advanced')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Advanced Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}