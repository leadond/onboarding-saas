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
  Shield,
  Key,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Building,
  Globe,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Zap,
  Crown,
  Award,
  Target,
  Fingerprint,
  Database,
  Server,
  Cloud
} from 'lucide-react'

interface SSOProvider {
  id: string
  name: string
  type: 'saml' | 'oauth' | 'oidc' | 'ldap'
  status: 'active' | 'inactive' | 'pending' | 'error'
  domain: string
  entity_id?: string
  sso_url?: string
  certificate?: string
  client_id?: string
  client_secret?: string
  discovery_url?: string
  created_at: string
  last_sync: string
  users_count: number
  success_rate: number
  configuration: {
    auto_provision: boolean
    default_role: string
    attribute_mapping: Record<string, string>
    group_mapping: Record<string, string>
    session_timeout: number
    force_authn: boolean
  }
  organization: {
    name: string
    domain: string
    contact_email: string
    admin_name: string
  }
}

interface SSOSession {
  id: string
  user_id: string
  user_email: string
  provider_id: string
  provider_name: string
  login_time: string
  last_activity: string
  ip_address: string
  user_agent: string
  location: string
  status: 'active' | 'expired' | 'terminated'
  session_duration: number
}

interface SSOAuditLog {
  id: string
  event_type: 'login_success' | 'login_failure' | 'logout' | 'config_change' | 'user_provision' | 'session_timeout'
  user_email?: string
  provider_name: string
  timestamp: string
  ip_address: string
  user_agent: string
  details: string
  risk_level: 'low' | 'medium' | 'high'
}

// Mock data
const mockSSOProviders: SSOProvider[] = [
  {
    id: '1',
    name: 'Acme Corp Active Directory',
    type: 'saml',
    status: 'active',
    domain: 'acmecorp.com',
    entity_id: 'https://acmecorp.com/adfs/services/trust',
    sso_url: 'https://adfs.acmecorp.com/adfs/ls/',
    created_at: '2024-06-15T00:00:00Z',
    last_sync: '2024-08-14T15:30:00Z',
    users_count: 245,
    success_rate: 98.7,
    configuration: {
      auto_provision: true,
      default_role: 'user',
      attribute_mapping: {
        'email': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        'first_name': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        'last_name': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'
      },
      group_mapping: {
        'admin': 'CN=Onboard Hero Admins,OU=Groups,DC=acmecorp,DC=com',
        'manager': 'CN=Onboard Hero Managers,OU=Groups,DC=acmecorp,DC=com'
      },
      session_timeout: 480,
      force_authn: false
    },
    organization: {
      name: 'Acme Corporation',
      domain: 'acmecorp.com',
      contact_email: 'it-admin@acmecorp.com',
      admin_name: 'John Smith'
    }
  },
  {
    id: '2',
    name: 'TechStart Okta',
    type: 'oauth',
    status: 'active',
    domain: 'techstart.com',
    client_id: 'okta_client_123456',
    discovery_url: 'https://techstart.okta.com/.well-known/openid_configuration',
    created_at: '2024-07-01T00:00:00Z',
    last_sync: '2024-08-14T12:15:00Z',
    users_count: 89,
    success_rate: 99.2,
    configuration: {
      auto_provision: true,
      default_role: 'user',
      attribute_mapping: {
        'email': 'email',
        'first_name': 'given_name',
        'last_name': 'family_name'
      },
      group_mapping: {
        'admin': 'Onboard Hero_Admins',
        'user': 'Onboard Hero_Users'
      },
      session_timeout: 360,
      force_authn: false
    },
    organization: {
      name: 'TechStart Inc',
      domain: 'techstart.com',
      contact_email: 'admin@techstart.com',
      admin_name: 'Sarah Johnson'
    }
  },
  {
    id: '3',
    name: 'Global Enterprises Azure AD',
    type: 'oidc',
    status: 'pending',
    domain: 'globalent.com',
    client_id: 'azure_app_789012',
    discovery_url: 'https://login.microsoftonline.com/globalent.com/v2.0/.well-known/openid_configuration',
    created_at: '2024-08-10T00:00:00Z',
    last_sync: '2024-08-10T00:00:00Z',
    users_count: 0,
    success_rate: 0,
    configuration: {
      auto_provision: false,
      default_role: 'user',
      attribute_mapping: {
        'email': 'email',
        'first_name': 'given_name',
        'last_name': 'family_name'
      },
      group_mapping: {},
      session_timeout: 480,
      force_authn: true
    },
    organization: {
      name: 'Global Enterprises',
      domain: 'globalent.com',
      contact_email: 'sso-admin@globalent.com',
      admin_name: 'Mike Chen'
    }
  }
]

const mockSSOSessions: SSOSession[] = [
  {
    id: '1',
    user_id: 'user_123',
    user_email: 'john.doe@acmecorp.com',
    provider_id: '1',
    provider_name: 'Acme Corp Active Directory',
    login_time: '2024-08-14T09:00:00Z',
    last_activity: '2024-08-14T15:30:00Z',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'New York, US',
    status: 'active',
    session_duration: 390
  },
  {
    id: '2',
    user_id: 'user_456',
    user_email: 'sarah.smith@techstart.com',
    provider_id: '2',
    provider_name: 'TechStart Okta',
    login_time: '2024-08-14T10:15:00Z',
    last_activity: '2024-08-14T14:45:00Z',
    ip_address: '10.0.0.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, US',
    status: 'active',
    session_duration: 270
  }
]

const mockAuditLogs: SSOAuditLog[] = [
  {
    id: '1',
    event_type: 'login_success',
    user_email: 'john.doe@acmecorp.com',
    provider_name: 'Acme Corp Active Directory',
    timestamp: '2024-08-14T15:30:00Z',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: 'User successfully authenticated via SAML',
    risk_level: 'low'
  },
  {
    id: '2',
    event_type: 'login_failure',
    user_email: 'invalid@acmecorp.com',
    provider_name: 'Acme Corp Active Directory',
    timestamp: '2024-08-14T15:25:00Z',
    ip_address: '203.0.113.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: 'Authentication failed - user not found in directory',
    risk_level: 'medium'
  },
  {
    id: '3',
    event_type: 'config_change',
    provider_name: 'TechStart Okta',
    timestamp: '2024-08-14T14:00:00Z',
    ip_address: '10.0.0.25',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    details: 'Session timeout updated from 240 to 360 minutes',
    risk_level: 'low'
  }
]

export function EnterpriseSSOIntegration() {
  const [selectedProvider, setSelectedProvider] = useState<SSOProvider | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSecretDialog, setShowSecretDialog] = useState(false)
  const [selectedSecret, setSelectedSecret] = useState<string>('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'pending': return Clock
      case 'inactive': return XCircle
      case 'error': return AlertTriangle
      default: return XCircle
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'saml': return 'bg-blue-100 text-blue-800'
      case 'oauth': return 'bg-green-100 text-green-800'
      case 'oidc': return 'bg-purple-100 text-purple-800'
      case 'ldap': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const totalUsers = mockSSOProviders.reduce((sum, provider) => sum + provider.users_count, 0)
  const activeProviders = mockSSOProviders.filter(p => p.status === 'active').length
  const avgSuccessRate = mockSSOProviders.reduce((sum, provider) => sum + provider.success_rate, 0) / mockSSOProviders.length
  const activeSessions = mockSSOSessions.filter(s => s.status === 'active').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            Enterprise SSO Integration
          </h1>
          <p className="text-gray-600">
            Manage SAML, OAuth, and OIDC integrations for enterprise single sign-on.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add SSO Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add SSO Provider</DialogTitle>
                <DialogDescription>
                  Configure a new enterprise SSO integration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider Name</Label>
                    <Input placeholder="e.g., Acme Corp Active Directory" />
                  </div>
                  <div className="space-y-2">
                    <Label>Protocol Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saml">SAML 2.0</SelectItem>
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="oidc">OpenID Connect</SelectItem>
                        <SelectItem value="ldap">LDAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Organization Domain</Label>
                  <Input placeholder="company.com" />
                </div>
                <div className="space-y-2">
                  <Label>SSO URL / Discovery URL</Label>
                  <Input placeholder="https://company.com/sso/saml" />
                </div>
                <div className="space-y-2">
                  <Label>Entity ID / Client ID</Label>
                  <Input placeholder="Entity ID or Client ID" />
                </div>
                <div className="space-y-2">
                  <Label>Certificate / Client Secret</Label>
                  <Textarea placeholder="Paste certificate or client secret here" rows={4} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-provision" />
                  <Label htmlFor="auto-provision">Enable automatic user provisioning</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button>Create Provider</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* SSO Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Active Providers
            </CardTitle>
            <div className="text-2xl font-bold">{activeProviders}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockSSOProviders.length - activeProviders} pending/inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              SSO Users
            </CardTitle>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {activeSessions} active sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Success Rate
            </CardTitle>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Average across providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Active Sessions
            </CardTitle>
            <div className="text-2xl font-bold">{activeSessions}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Currently logged in
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">SSO Providers</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* SSO Providers List */}
          <div className="space-y-6">
            {mockSSOProviders.map((provider) => {
              const StatusIcon = getStatusIcon(provider.status)
              
              return (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Shield className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{provider.name}</span>
                            <Badge className={getStatusColor(provider.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {provider.status}
                            </Badge>
                            <Badge className={getTypeColor(provider.type)}>
                              {provider.type.toUpperCase()}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-1">
                            <span>{provider.domain}</span>
                            <span>•</span>
                            <span>{provider.users_count} users</span>
                            <span>•</span>
                            <span>{provider.success_rate}% success rate</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Organization</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-2" />
                            {provider.organization.name}
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-2" />
                            {provider.organization.contact_email}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-2" />
                            {provider.organization.admin_name}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Auto Provision:</span>
                            <Badge variant={provider.configuration.auto_provision ? "default" : "secondary"}>
                              {provider.configuration.auto_provision ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Default Role:</span>
                            <Badge variant="outline">{provider.configuration.default_role}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Session Timeout:</span>
                            <span>{formatDuration(provider.configuration.session_timeout)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Total Users:</span>
                            <span className="font-medium">{provider.users_count}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Success Rate:</span>
                            <span className="font-medium text-green-600">{provider.success_rate}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Last Sync:</span>
                            <span>{formatDate(provider.last_sync)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Details */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Connection Details</h5>
                          <div className="space-y-1 text-gray-600">
                            {provider.entity_id && (
                              <div className="flex items-center justify-between">
                                <span>Entity ID:</span>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {provider.entity_id.substring(0, 30)}...
                                </code>
                              </div>
                            )}
                            {provider.sso_url && (
                              <div className="flex items-center justify-between">
                                <span>SSO URL:</span>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {provider.sso_url.substring(0, 30)}...
                                </code>
                              </div>
                            )}
                            {provider.client_id && (
                              <div className="flex items-center justify-between">
                                <span>Client ID:</span>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {provider.client_id}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-700 mb-1">Attribute Mapping</h5>
                          <div className="space-y-1 text-gray-600">
                            {Object.entries(provider.configuration.attribute_mapping).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span>{key}:</span>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {typeof value === 'string' && value.length > 20 ? `${value.substring(0, 20)}...` : value}
                                </code>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Active SSO Sessions</CardTitle>
              <CardDescription>Currently active user sessions across all SSO providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSSOSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{session.user_email}</div>
                        <div className="text-sm text-gray-600">{session.provider_name}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-4 mt-1">
                          <span>IP: {session.ip_address}</span>
                          <span>Location: {session.location}</span>
                          <span>Duration: {formatDuration(session.session_duration)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Terminate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle>SSO Audit Logs</CardTitle>
              <CardDescription>Security events and authentication logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAuditLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      log.event_type === 'login_success' ? 'bg-green-100' :
                      log.event_type === 'login_failure' ? 'bg-red-100' :
                      'bg-blue-100'
                    }`}>
                      {log.event_type === 'login_success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : log.event_type === 'login_failure' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Settings className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium capitalize">{log.event_type.replace('_', ' ')}</span>
                        <Badge className={getRiskColor(log.risk_level)}>
                          {log.risk_level} risk
                        </Badge>
                        <span className="text-sm text-gray-500">{formatDateTime(log.timestamp)}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{log.details}</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                        {log.user_email && (
                          <div>
                            <span className="font-medium">User:</span> {log.user_email}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Provider:</span> {log.provider_name}
                        </div>
                        <div>
                          <span className="font-medium">IP:</span> {log.ip_address}
                        </div>
                        <div>
                          <span className="font-medium">User Agent:</span> {log.user_agent.substring(0, 20)}...
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Global SSO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Global SSO Settings</CardTitle>
              <CardDescription>Configure platform-wide SSO behavior and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Require SSO for all users</Label>
                    <p className="text-sm text-gray-600">Force all users to authenticate via SSO</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow local account fallback</Label>
                    <p className="text-sm text-gray-600">Permit local authentication if SSO fails</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-provision new users</Label>
                    <p className="text-sm text-gray-600">Automatically create accounts for new SSO users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable session monitoring</Label>
                    <p className="text-sm text-gray-600">Track and log all SSO session activity</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Default session timeout (minutes)</Label>
                  <Select defaultValue="480">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                      <SelectItem value="480">8 hours</SelectItem>
                      <SelectItem value="720">12 hours</SelectItem>
                      <SelectItem value="1440">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Failed login threshold</Label>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="5">5 attempts</SelectItem>
                      <SelectItem value="10">10 attempts</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}