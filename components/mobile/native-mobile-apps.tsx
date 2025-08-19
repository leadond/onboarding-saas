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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Upload,
  Play,
  Pause,
  Settings,
  Bell,
  Camera,
  Fingerprint,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Star,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Crown,
  Award,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Code,
  Palette,
  Layout,
  Image,
  Video,
  Mic,
  Share,
  Heart,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Shield,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react'

interface MobileApp {
  id: string
  platform: 'ios' | 'android'
  name: string
  version: string
  build_number: string
  status: 'published' | 'review' | 'development' | 'testing'
  store_url?: string
  bundle_id: string
  last_updated: string
  downloads: number
  rating: number
  reviews_count: number
  size_mb: number
  min_os_version: string
  features: string[]
  screenshots: string[]
  release_notes: string
}

interface AppAnalytics {
  platform: 'ios' | 'android'
  daily_active_users: number
  monthly_active_users: number
  session_duration: number
  retention_rate: {
    day_1: number
    day_7: number
    day_30: number
  }
  crash_rate: number
  app_store_rating: number
  completion_rate: number
  offline_usage: number
}

interface PushNotification {
  id: string
  title: string
  message: string
  type: 'onboarding_reminder' | 'progress_update' | 'completion_celebration' | 'feature_announcement'
  target_audience: 'all' | 'new_users' | 'inactive_users' | 'specific_segment'
  scheduled_at?: string
  sent_at?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  delivery_stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }
  platforms: ('ios' | 'android')[]
}

interface MobileFeature {
  id: string
  name: string
  description: string
  status: 'available' | 'coming_soon' | 'beta'
  platforms: ('ios' | 'android')[]
  usage_stats: {
    adoption_rate: number
    user_satisfaction: number
    support_tickets: number
  }
  icon: string
}

// Mock data
const mockMobileApps: MobileApp[] = [
  {
    id: '1',
    platform: 'ios',
    name: 'Onboard Hero',
    version: '2.1.0',
    build_number: '210',
    status: 'published',
    store_url: 'https://apps.apple.com/app/onboardkit/id123456789',
    bundle_id: 'com.onboardkit.ios',
    last_updated: '2024-08-10T00:00:00Z',
    downloads: 45678,
    rating: 4.8,
    reviews_count: 1234,
    size_mb: 67.2,
    min_os_version: '14.0',
    features: ['Offline Mode', 'Biometric Auth', 'Push Notifications', 'Camera Integration', 'Dark Mode'],
    screenshots: ['/screenshots/ios-1.png', '/screenshots/ios-2.png', '/screenshots/ios-3.png'],
    release_notes: 'Bug fixes and performance improvements. Added new onboarding templates and enhanced offline capabilities.'
  },
  {
    id: '2',
    platform: 'android',
    name: 'Onboard Hero',
    version: '2.0.8',
    build_number: '208',
    status: 'published',
    store_url: 'https://play.google.com/store/apps/details?id=com.onboardkit.android',
    bundle_id: 'com.onboardkit.android',
    last_updated: '2024-08-08T00:00:00Z',
    downloads: 78923,
    rating: 4.6,
    reviews_count: 2156,
    size_mb: 72.8,
    min_os_version: '8.0',
    features: ['Offline Mode', 'Fingerprint Auth', 'Push Notifications', 'Camera Integration', 'Material Design'],
    screenshots: ['/screenshots/android-1.png', '/screenshots/android-2.png', '/screenshots/android-3.png'],
    release_notes: 'Updated Material Design components. Improved performance and added support for Android 14.'
  }
]

const mockAnalytics: AppAnalytics[] = [
  {
    platform: 'ios',
    daily_active_users: 12456,
    monthly_active_users: 45678,
    session_duration: 8.5,
    retention_rate: {
      day_1: 78.5,
      day_7: 45.2,
      day_30: 23.8
    },
    crash_rate: 0.12,
    app_store_rating: 4.8,
    completion_rate: 89.3,
    offline_usage: 34.7
  },
  {
    platform: 'android',
    daily_active_users: 18923,
    monthly_active_users: 78923,
    session_duration: 7.8,
    retention_rate: {
      day_1: 72.1,
      day_7: 41.8,
      day_30: 21.4
    },
    crash_rate: 0.18,
    app_store_rating: 4.6,
    completion_rate: 85.7,
    offline_usage: 42.3
  }
]

const mockNotifications: PushNotification[] = [
  {
    id: '1',
    title: 'Complete Your Onboarding',
    message: 'You\'re almost done! Complete the remaining steps to get started.',
    type: 'onboarding_reminder',
    target_audience: 'inactive_users',
    scheduled_at: '2024-08-15T10:00:00Z',
    status: 'scheduled',
    delivery_stats: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0
    },
    platforms: ['ios', 'android']
  },
  {
    id: '2',
    title: 'Congratulations! 🎉',
    message: 'You\'ve successfully completed your onboarding process!',
    type: 'completion_celebration',
    target_audience: 'all',
    sent_at: '2024-08-14T15:30:00Z',
    status: 'sent',
    delivery_stats: {
      sent: 15678,
      delivered: 15234,
      opened: 8945,
      clicked: 3456
    },
    platforms: ['ios', 'android']
  },
  {
    id: '3',
    title: 'New Features Available',
    message: 'Check out the latest features in your Onboard Hero app!',
    type: 'feature_announcement',
    target_audience: 'all',
    sent_at: '2024-08-12T09:00:00Z',
    status: 'sent',
    delivery_stats: {
      sent: 24567,
      delivered: 23890,
      opened: 12456,
      clicked: 5678
    },
    platforms: ['ios', 'android']
  }
]

const mockFeatures: MobileFeature[] = [
  {
    id: '1',
    name: 'Offline Mode',
    description: 'Complete onboarding steps without internet connection',
    status: 'available',
    platforms: ['ios', 'android'],
    usage_stats: {
      adoption_rate: 67.8,
      user_satisfaction: 4.6,
      support_tickets: 12
    },
    icon: 'WifiOff'
  },
  {
    id: '2',
    name: 'Biometric Authentication',
    description: 'Secure login with fingerprint or face recognition',
    status: 'available',
    platforms: ['ios', 'android'],
    usage_stats: {
      adoption_rate: 84.2,
      user_satisfaction: 4.8,
      support_tickets: 8
    },
    icon: 'Fingerprint'
  },
  {
    id: '3',
    name: 'Camera Integration',
    description: 'Capture documents and photos directly in the app',
    status: 'available',
    platforms: ['ios', 'android'],
    usage_stats: {
      adoption_rate: 56.3,
      user_satisfaction: 4.4,
      support_tickets: 23
    },
    icon: 'Camera'
  },
  {
    id: '4',
    name: 'AR Document Scanner',
    description: 'Advanced document scanning with augmented reality',
    status: 'beta',
    platforms: ['ios'],
    usage_stats: {
      adoption_rate: 23.1,
      user_satisfaction: 4.2,
      support_tickets: 45
    },
    icon: 'Eye'
  },
  {
    id: '5',
    name: 'Voice Commands',
    description: 'Navigate and complete forms using voice commands',
    status: 'coming_soon',
    platforms: ['ios', 'android'],
    usage_stats: {
      adoption_rate: 0,
      user_satisfaction: 0,
      support_tickets: 0
    },
    icon: 'Mic'
  }
]

export function NativeMobileApps() {
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android' | 'all'>('all')
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
      case 'sent':
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'review':
      case 'scheduled':
      case 'beta':
        return 'bg-blue-100 text-blue-800'
      case 'development':
      case 'testing':
      case 'draft':
      case 'coming_soon':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
      case 'sent':
      case 'available':
        return CheckCircle
      case 'review':
      case 'scheduled':
      case 'beta':
        return Clock
      case 'development':
      case 'testing':
      case 'draft':
      case 'coming_soon':
        return AlertTriangle
      case 'failed':
        return XCircle
      default:
        return Clock
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return '🍎'
      case 'android': return '🤖'
      default: return '📱'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB} MB`
  }

  const totalDownloads = mockMobileApps.reduce((sum, app) => sum + app.downloads, 0)
  const avgRating = mockMobileApps.reduce((sum, app) => sum + app.rating, 0) / mockMobileApps.length
  const totalDAU = mockAnalytics.reduce((sum, analytics) => sum + analytics.daily_active_users, 0)
  const avgCompletionRate = mockAnalytics.reduce((sum, analytics) => sum + analytics.completion_rate, 0) / mockAnalytics.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Smartphone className="h-8 w-8 mr-3 text-blue-600" />
            Native Mobile Applications
          </h1>
          <p className="text-gray-600">
            Manage iOS and Android apps with offline capabilities and native features.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Code className="h-4 w-4 mr-2" />
            Developer Portal
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload Build
          </Button>
          <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
            <DialogTrigger asChild>
              <Button>
                <Bell className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Push Notification</DialogTitle>
                <DialogDescription>
                  Send a push notification to your mobile app users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Notification Title</Label>
                  <Input placeholder="Enter notification title" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Enter notification message" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding_reminder">Onboarding Reminder</SelectItem>
                        <SelectItem value="progress_update">Progress Update</SelectItem>
                        <SelectItem value="completion_celebration">Completion Celebration</SelectItem>
                        <SelectItem value="feature_announcement">Feature Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="new_users">New Users</SelectItem>
                        <SelectItem value="inactive_users">Inactive Users</SelectItem>
                        <SelectItem value="specific_segment">Specific Segment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="ios" defaultChecked />
                      <Label htmlFor="ios">iOS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="android" defaultChecked />
                      <Label htmlFor="android">Android</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Schedule (optional)</Label>
                  <Input type="datetime-local" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
                  Cancel
                </Button>
                <Button>Send Notification</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mobile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Total Downloads
            </CardTitle>
            <div className="text-2xl font-bold">{formatNumber(totalDownloads)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Avg. Rating
            </CardTitle>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              App store rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Daily Active Users
            </CardTitle>
            <div className="text-2xl font-bold">{formatNumber(totalDAU)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Completion Rate
            </CardTitle>
            <div className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Mobile onboarding
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="apps" className="space-y-6">
        <TabsList>
          <TabsTrigger value="apps">Mobile Apps</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="notifications">Push Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="space-y-6">
          {/* Mobile Apps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockMobileApps.map((app) => {
              const StatusIcon = getStatusIcon(app.status)
              
              return (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{getPlatformIcon(app.platform)}</div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{app.name}</span>
                            <Badge className={getStatusColor(app.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {app.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Version {app.version} ({app.build_number}) • {app.platform.toUpperCase()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold">{app.rating}</span>
                        </div>
                        <div className="text-xs text-gray-500">{formatNumber(app.reviews_count)} reviews</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Downloads</div>
                          <div className="font-bold text-green-600">{formatNumber(app.downloads)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Size</div>
                          <div className="font-medium">{formatFileSize(app.size_mb)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Min OS Version</div>
                          <div className="font-medium">{app.min_os_version}+</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Last Updated</div>
                          <div className="font-medium">{formatDate(app.last_updated)}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Features</div>
                        <div className="flex flex-wrap gap-1">
                          {app.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Release Notes</div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {app.release_notes}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {app.store_url && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View in Store
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          New Build
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Mobile Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockAnalytics.map((analytics) => (
              <Card key={analytics.platform} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-2xl">{getPlatformIcon(analytics.platform)}</span>
                    <span>{analytics.platform.toUpperCase()} Analytics</span>
                  </CardTitle>
                  <CardDescription>Performance metrics and user engagement data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Daily Active Users</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatNumber(analytics.daily_active_users)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Monthly Active Users</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatNumber(analytics.monthly_active_users)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Session Duration</div>
                        <div className="text-2xl font-bold">{analytics.session_duration}m</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                        <div className="text-2xl font-bold text-purple-600">{analytics.completion_rate}%</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">User Retention</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Day 1</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={analytics.retention_rate.day_1} className="w-20 h-2" />
                            <span className="text-sm font-medium">{analytics.retention_rate.day_1}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Day 7</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={analytics.retention_rate.day_7} className="w-20 h-2" />
                            <span className="text-sm font-medium">{analytics.retention_rate.day_7}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Day 30</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={analytics.retention_rate.day_30} className="w-20 h-2" />
                            <span className="text-sm font-medium">{analytics.retention_rate.day_30}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Crash Rate</div>
                        <div className="font-medium text-red-600">{analytics.crash_rate}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">App Store Rating</div>
                        <div className="font-medium flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          {analytics.app_store_rating}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Offline Usage</div>
                        <div className="font-medium">{analytics.offline_usage}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          {/* Mobile Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFeatures.map((feature) => {
              const StatusIcon = getStatusIcon(feature.status)
              
              return (
                <Card key={feature.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {feature.icon === 'WifiOff' && <WifiOff className="h-5 w-5 text-blue-600" />}
                          {feature.icon === 'Fingerprint' && <Fingerprint className="h-5 w-5 text-blue-600" />}
                          {feature.icon === 'Camera' && <Camera className="h-5 w-5 text-blue-600" />}
                          {feature.icon === 'Eye' && <Eye className="h-5 w-5 text-blue-600" />}
                          {feature.icon === 'Mic' && <Mic className="h-5 w-5 text-blue-600" />}
                        </div>
                        <div>
                          <CardTitle className="text-base">{feature.name}</CardTitle>
                          <div className="flex items-center space-x-1 mt-1">
                            {feature.platforms.map((platform, index) => (
                              <span key={index} className="text-lg">
                                {getPlatformIcon(platform)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(feature.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {feature.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">{feature.description}</p>
                      
                      {feature.status !== 'coming_soon' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Adoption Rate</div>
                              <div className="font-bold text-green-600">{feature.usage_stats.adoption_rate}%</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Satisfaction</div>
                              <div className="font-medium flex items-center">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                {feature.usage_stats.user_satisfaction}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <div className="text-gray-600">Support Tickets</div>
                            <div className="font-medium">{feature.usage_stats.support_tickets}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        {feature.status === 'beta' && (
                          <Button size="sm" variant="outline">
                            <Flag className="h-4 w-4 mr-2" />
                            Feedback
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Push Notifications */}
          <div className="space-y-6">
            {mockNotifications.map((notification) => {
              const StatusIcon = getStatusIcon(notification.status)
              
              return (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{notification.title}</span>
                            <Badge className={getStatusColor(notification.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {notification.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>"{notification.message}"</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {notification.platforms.map((platform, index) => (
                          <span key={index} className="text-lg">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Type</div>
                          <div className="font-medium capitalize">{notification.type.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Audience</div>
                          <div className="font-medium capitalize">{notification.target_audience.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">
                            {notification.status === 'scheduled' ? 'Scheduled' : 'Sent'}
                          </div>
                          <div className="font-medium">
                            {notification.scheduled_at && formatDateTime(notification.scheduled_at)}
                            {notification.sent_at && formatDateTime(notification.sent_at)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Platforms</div>
                          <div className="font-medium">{notification.platforms.join(', ').toUpperCase()}</div>
                        </div>
                      </div>

                      {notification.status === 'sent' && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-3">Delivery Statistics</div>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {formatNumber(notification.delivery_stats.sent)}
                              </div>
                              <div className="text-xs text-gray-600">Sent</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {formatNumber(notification.delivery_stats.delivered)}
                              </div>
                              <div className="text-xs text-gray-600">Delivered</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">
                                {formatNumber(notification.delivery_stats.opened)}
                              </div>
                              <div className="text-xs text-gray-600">Opened</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">
                                {formatNumber(notification.delivery_stats.clicked)}
                              </div>
                              <div className="text-xs text-gray-600">Clicked</div>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Delivery Rate</span>
                              <span className="font-medium">
                                {((notification.delivery_stats.delivered / notification.delivery_stats.sent) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Open Rate</span>
                              <span className="font-medium">
                                {((notification.delivery_stats.opened / notification.delivery_stats.delivered) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Click Rate</span>
                              <span className="font-medium">
                                {((notification.delivery_stats.clicked / notification.delivery_stats.opened) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        {notification.status === 'sent' && (
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}