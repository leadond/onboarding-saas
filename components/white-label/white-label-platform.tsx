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
  Palette,
  Globe,
  Settings,
  Users,
  Code,
  Smartphone,
  Monitor,
  Download,
  Upload,
  Eye,
  Copy,
  Check,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Shield,
  Zap,
  Crown,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  BarChart3,
  Activity,
  Star,
  Award,
  Briefcase,
  Target,
  TrendingUp
} from 'lucide-react'

interface WhiteLabelTenant {
  id: string
  name: string
  domain: string
  custom_domain?: string
  status: 'active' | 'pending' | 'suspended' | 'trial'
  plan: 'starter' | 'professional' | 'enterprise'
  created_at: string
  last_active: string
  branding: {
    logo_url?: string
    primary_color: string
    secondary_color: string
    font_family: string
    custom_css?: string
  }
  settings: {
    allow_custom_domain: boolean
    enable_api_access: boolean
    max_users: number
    max_clients: number
    features: string[]
  }
  metrics: {
    total_users: number
    active_users: number
    total_clients: number
    monthly_revenue: number
    completion_rate: number
  }
  contact: {
    name: string
    email: string
    phone?: string
    company: string
  }
}

interface WhiteLabelTemplate {
  id: string
  name: string
  description: string
  category: 'business' | 'agency' | 'enterprise' | 'startup'
  preview_url: string
  features: string[]
  customization_level: 'basic' | 'advanced' | 'complete'
  price: number
  popular: boolean
}

// Mock data
const mockTenants: WhiteLabelTenant[] = [
  {
    id: '1',
    name: 'Acme Consulting',
    domain: 'acme-consulting.onboardhero.com',
    custom_domain: 'onboarding.acmeconsulting.com',
    status: 'active',
    plan: 'enterprise',
    created_at: '2024-06-15T00:00:00Z',
    last_active: '2024-08-14T15:30:00Z',
    branding: {
      logo_url: '/logos/acme-logo.png',
      primary_color: '#2563eb',
      secondary_color: '#64748b',
      font_family: 'Inter'
    },
    settings: {
      allow_custom_domain: true,
      enable_api_access: true,
      max_users: 100,
      max_clients: 1000,
      features: ['custom_branding', 'api_access', 'sso', 'analytics', 'white_label_mobile']
    },
    metrics: {
      total_users: 45,
      active_users: 38,
      total_clients: 234,
      monthly_revenue: 12500,
      completion_rate: 89.5
    },
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@acmeconsulting.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Consulting LLC'
    }
  },
  {
    id: '2',
    name: 'Digital Marketing Pro',
    domain: 'digitalmarketing-pro.onboardhero.com',
    status: 'active',
    plan: 'professional',
    created_at: '2024-07-01T00:00:00Z',
    last_active: '2024-08-14T09:15:00Z',
    branding: {
      primary_color: '#059669',
      secondary_color: '#6b7280',
      font_family: 'Roboto'
    },
    settings: {
      allow_custom_domain: false,
      enable_api_access: true,
      max_users: 25,
      max_clients: 500,
      features: ['custom_branding', 'api_access', 'analytics']
    },
    metrics: {
      total_users: 12,
      active_users: 10,
      total_clients: 89,
      monthly_revenue: 4500,
      completion_rate: 92.1
    },
    contact: {
      name: 'Mike Chen',
      email: 'mike@digitalmarketingpro.com',
      company: 'Digital Marketing Pro'
    }
  },
  {
    id: '3',
    name: 'StartupLaunch',
    domain: 'startup-launch.onboardhero.com',
    status: 'trial',
    plan: 'starter',
    created_at: '2024-08-01T00:00:00Z',
    last_active: '2024-08-13T18:45:00Z',
    branding: {
      primary_color: '#dc2626',
      secondary_color: '#9ca3af',
      font_family: 'Poppins'
    },
    settings: {
      allow_custom_domain: false,
      enable_api_access: false,
      max_users: 5,
      max_clients: 100,
      features: ['custom_branding']
    },
    metrics: {
      total_users: 3,
      active_users: 2,
      total_clients: 15,
      monthly_revenue: 0,
      completion_rate: 78.3
    },
    contact: {
      name: 'Alex Rodriguez',
      email: 'alex@startupla.com',
      company: 'StartupLaunch Inc'
    }
  }
]

const mockTemplates: WhiteLabelTemplate[] = [
  {
    id: '1',
    name: 'Professional Services',
    description: 'Clean, professional design perfect for consulting firms and service providers',
    category: 'business',
    preview_url: '/templates/professional-services.png',
    features: ['Custom branding', 'Client portal', 'Document management', 'Progress tracking'],
    customization_level: 'advanced',
    price: 299,
    popular: true
  },
  {
    id: '2',
    name: 'Digital Agency',
    description: 'Modern, creative design tailored for digital agencies and marketing firms',
    category: 'agency',
    preview_url: '/templates/digital-agency.png',
    features: ['Portfolio showcase', 'Project timelines', 'Team collaboration', 'Client feedback'],
    customization_level: 'complete',
    price: 499,
    popular: true
  },
  {
    id: '3',
    name: 'Enterprise Corporate',
    description: 'Sophisticated design for large enterprises with complex onboarding needs',
    category: 'enterprise',
    preview_url: '/templates/enterprise-corporate.png',
    features: ['SSO integration', 'Advanced analytics', 'Multi-department workflows', 'Compliance tracking'],
    customization_level: 'complete',
    price: 799,
    popular: false
  },
  {
    id: '4',
    name: 'Startup Minimal',
    description: 'Simple, clean design perfect for startups and small businesses',
    category: 'startup',
    preview_url: '/templates/startup-minimal.png',
    features: ['Quick setup', 'Essential features', 'Mobile optimized', 'Basic analytics'],
    customization_level: 'basic',
    price: 99,
    popular: false
  }
]

export function WhiteLabelPlatform() {
  const [selectedTenant, setSelectedTenant] = useState<WhiteLabelTenant | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'professional': return 'bg-blue-100 text-blue-800'
      case 'starter': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyToClipboard = (text: string, domain: string) => {
    navigator.clipboard.writeText(text)
    setCopiedDomain(domain)
    setTimeout(() => setCopiedDomain(null), 2000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const totalRevenue = mockTenants.reduce((sum, tenant) => sum + tenant.metrics.monthly_revenue, 0)
  const activeTenants = mockTenants.filter(t => t.status === 'active').length
  const totalUsers = mockTenants.reduce((sum, tenant) => sum + tenant.metrics.total_users, 0)
  const avgCompletionRate = mockTenants.reduce((sum, tenant) => sum + tenant.metrics.completion_rate, 0) / mockTenants.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Crown className="h-8 w-8 mr-3 text-yellow-600" />
            White-Label Platform
          </h1>
          <p className="text-gray-600">
            Manage your white-label partners and customize their branded experiences.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>White-Label Templates</DialogTitle>
                <DialogDescription>
                  Choose from our professionally designed templates for your partners
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            {template.name}
                            {template.popular && (
                              <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{formatCurrency(template.price)}</div>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <Monitor className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={
                            template.customization_level === 'complete' ? 'bg-green-100 text-green-800' :
                            template.customization_level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {template.customization_level} customization
                          </Badge>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tenant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New White-Label Tenant</DialogTitle>
                <DialogDescription>
                  Set up a new branded instance for your partner
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Partner Name</Label>
                  <Input placeholder="Enter partner company name" />
                </div>
                <div className="space-y-2">
                  <Label>Subdomain</Label>
                  <div className="flex">
                    <Input placeholder="partner-name" />
                    <span className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r text-sm text-gray-600">
                      .onboardhero.com
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter - $99/month</SelectItem>
                      <SelectItem value="professional">Professional - $299/month</SelectItem>
                      <SelectItem value="enterprise">Enterprise - $799/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} - {formatCurrency(template.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button>Create Tenant</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Active Tenants
            </CardTitle>
            <div className="text-2xl font-bold">{activeTenants}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockTenants.length - activeTenants} pending/trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Monthly Revenue
            </CardTitle>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Avg. Completion Rate
            </CardTitle>
            <div className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Platform average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-6">
          {/* Tenants List */}
          <div className="space-y-6">
            {mockTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          <span>{tenant.name}</span>
                          <Badge className={getStatusColor(tenant.status)}>
                            {tenant.status}
                          </Badge>
                          <Badge className={getPlanColor(tenant.plan)}>
                            {tenant.plan}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-1">
                          <span>{tenant.domain}</span>
                          {tenant.custom_domain && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">{tenant.custom_domain}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(tenant.custom_domain || tenant.domain, tenant.domain)}
                      >
                        {copiedDomain === tenant.domain ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy URL
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2" />
                          {tenant.contact.email}
                        </div>
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-2" />
                          {tenant.contact.company}
                        </div>
                        {tenant.contact.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-2" />
                            {tenant.contact.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Usage</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{tenant.metrics.total_users} users ({tenant.metrics.active_users} active)</div>
                        <div>{tenant.metrics.total_clients} clients</div>
                        <div>{tenant.metrics.completion_rate}% completion rate</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Revenue</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(tenant.metrics.monthly_revenue)}
                        </div>
                        <div>Monthly recurring</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                      <div className="flex flex-wrap gap-1">
                        {tenant.settings.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                        {tenant.settings.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tenant.settings.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                    <div>Created: {formatDate(tenant.created_at)}</div>
                    <div>Last active: {formatDate(tenant.last_active)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      {template.name}
                      {template.popular && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="text-lg font-bold">{formatCurrency(template.price)}</div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <Monitor className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={
                        template.customization_level === 'complete' ? 'bg-green-100 text-green-800' :
                        template.customization_level === 'advanced' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {template.customization_level}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Use
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly recurring revenue from white-label partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Revenue analytics chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tenant Growth</CardTitle>
                <CardDescription>New tenant acquisitions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Growth analytics chart would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure global white-label platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-approve new tenants</Label>
                    <p className="text-sm text-gray-600">Automatically activate new tenant requests</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow custom domains</Label>
                    <p className="text-sm text-gray-600">Enable tenants to use their own domains</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable API access</Label>
                    <p className="text-sm text-gray-600">Allow tenants to access platform APIs</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Require SSL certificates</Label>
                    <p className="text-sm text-gray-600">Enforce HTTPS for all tenant domains</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}