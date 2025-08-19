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

import React from 'react'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Building2,
  Plus,
  Settings,
  RefreshCw as Sync,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Users,
  Database,
  Activity,
  Clock,
  TrendingUp,
  ArrowUpDown,
  MapPin,
  Zap,
  Shield,
  Globe,
  Calendar,
  Mail,
  Phone,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react'

interface CRMIntegration {
  id: string
  name: string
  provider: string
  logo_url: string
  description: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  connected_at?: string
  last_sync?: string
  sync_frequency: 'real-time' | 'hourly' | 'daily' | 'weekly'
  features: string[]
  credentials: {
    client_id?: string
    client_secret?: string
    access_token?: string
    refresh_token?: string
    instance_url?: string
    api_key?: string
  }
  field_mappings: FieldMapping[]
  sync_stats: SyncStats
  settings: CRMSettings
}

interface FieldMapping {
  id: string
  crm_field: string
  onboardkit_field: string
  direction: 'bidirectional' | 'to_crm' | 'from_crm'
  enabled: boolean
  data_type: 'text' | 'email' | 'phone' | 'date' | 'number' | 'boolean' | 'picklist'
  required: boolean
}

interface SyncStats {
  total_records: number
  synced_records: number
  failed_records: number
  last_sync_duration: number
  sync_errors: SyncError[]
}

interface SyncError {
  id: string
  record_id: string
  error_message: string
  error_type: 'validation' | 'permission' | 'network' | 'mapping'
  occurred_at: string
  resolved: boolean
}

interface CRMSettings {
  auto_sync: boolean
  sync_direction: 'bidirectional' | 'to_crm' | 'from_crm'
  conflict_resolution: 'crm_wins' | 'onboardkit_wins' | 'manual'
  sync_deleted_records: boolean
  notification_settings: {
    sync_success: boolean
    sync_failure: boolean
    conflict_detected: boolean
  }
}

// Mock data
const mockCRMIntegrations: CRMIntegration[] = [
  {
    id: '1',
    name: 'Salesforce Production',
    provider: 'salesforce',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg',
    description: 'Connect with Salesforce to sync leads, contacts, and opportunities',
    status: 'connected',
    connected_at: '2024-08-01T00:00:00Z',
    last_sync: '2024-08-15T02:30:00Z',
    sync_frequency: 'real-time',
    features: ['Leads', 'Contacts', 'Opportunities', 'Accounts', 'Custom Objects', 'Workflows'],
    credentials: {
      client_id: 'sf_client_123',
      instance_url: 'https://acme.my.salesforce.com'
    },
    field_mappings: [
      {
        id: '1',
        crm_field: 'FirstName',
        onboardkit_field: 'first_name',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'text',
        required: true
      },
      {
        id: '2',
        crm_field: 'LastName',
        onboardkit_field: 'last_name',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'text',
        required: true
      },
      {
        id: '3',
        crm_field: 'Email',
        onboardkit_field: 'email',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'email',
        required: true
      },
      {
        id: '4',
        crm_field: 'Company',
        onboardkit_field: 'company_name',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'text',
        required: false
      }
    ],
    sync_stats: {
      total_records: 1247,
      synced_records: 1235,
      failed_records: 12,
      last_sync_duration: 45,
      sync_errors: [
        {
          id: '1',
          record_id: 'lead_123',
          error_message: 'Invalid email format',
          error_type: 'validation',
          occurred_at: '2024-08-14T15:30:00Z',
          resolved: false
        }
      ]
    },
    settings: {
      auto_sync: true,
      sync_direction: 'bidirectional',
      conflict_resolution: 'crm_wins',
      sync_deleted_records: false,
      notification_settings: {
        sync_success: false,
        sync_failure: true,
        conflict_detected: true
      }
    }
  },
  {
    id: '2',
    name: 'HubSpot Marketing',
    provider: 'hubspot',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/hubspot.svg',
    description: 'Sync contacts, deals, and marketing data with HubSpot',
    status: 'connected',
    connected_at: '2024-07-15T00:00:00Z',
    last_sync: '2024-08-15T01:45:00Z',
    sync_frequency: 'hourly',
    features: ['Contacts', 'Deals', 'Companies', 'Marketing Lists', 'Email Campaigns', 'Analytics'],
    credentials: {
      api_key: 'hs_api_key_456'
    },
    field_mappings: [
      {
        id: '5',
        crm_field: 'firstname',
        onboardkit_field: 'first_name',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'text',
        required: true
      },
      {
        id: '6',
        crm_field: 'lastname',
        onboardkit_field: 'last_name',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'text',
        required: true
      },
      {
        id: '7',
        crm_field: 'email',
        onboardkit_field: 'email',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'email',
        required: true
      }
    ],
    sync_stats: {
      total_records: 892,
      synced_records: 892,
      failed_records: 0,
      last_sync_duration: 23,
      sync_errors: []
    },
    settings: {
      auto_sync: true,
      sync_direction: 'bidirectional',
      conflict_resolution: 'onboardkit_wins',
      sync_deleted_records: true,
      notification_settings: {
        sync_success: true,
        sync_failure: true,
        conflict_detected: true
      }
    }
  },
  {
    id: '3',
    name: 'Pipedrive Sales',
    provider: 'pipedrive',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/pipedrive.svg',
    description: 'Connect with Pipedrive for sales pipeline management',
    status: 'error',
    connected_at: '2024-06-20T00:00:00Z',
    last_sync: '2024-08-14T10:15:00Z',
    sync_frequency: 'daily',
    features: ['Persons', 'Organizations', 'Deals', 'Activities', 'Pipelines', 'Custom Fields'],
    credentials: {
      api_key: 'pd_api_key_789'
    },
    field_mappings: [
      {
        id: '8',
        crm_field: 'name',
        onboardkit_field: 'full_name',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'text',
        required: true
      },
      {
        id: '9',
        crm_field: 'email',
        onboardkit_field: 'email',
        direction: 'bidirectional',
        enabled: true,
        data_type: 'email',
        required: true
      }
    ],
    sync_stats: {
      total_records: 456,
      synced_records: 423,
      failed_records: 33,
      last_sync_duration: 67,
      sync_errors: [
        {
          id: '2',
          record_id: 'person_456',
          error_message: 'API rate limit exceeded',
          error_type: 'network',
          occurred_at: '2024-08-14T10:15:00Z',
          resolved: false
        }
      ]
    },
    settings: {
      auto_sync: false,
      sync_direction: 'to_crm',
      conflict_resolution: 'manual',
      sync_deleted_records: false,
      notification_settings: {
        sync_success: false,
        sync_failure: true,
        conflict_detected: true
      }
    }
  }
]

const availableCRMs = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/salesforce-2.svg',
    description: 'World\'s #1 CRM platform',
    features: ['Leads', 'Contacts', 'Opportunities', 'Accounts', 'Custom Objects', 'Workflows', 'Reports'],
    pricing: 'Free with Salesforce account',
    setup_complexity: 'Medium',
    popular: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/hubspot.svg',
    description: 'Inbound marketing and sales platform',
    features: ['Contacts', 'Deals', 'Companies', 'Marketing Lists', 'Email Campaigns', 'Analytics'],
    pricing: 'Free with HubSpot account',
    setup_complexity: 'Easy',
    popular: true
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/pipedrive.svg',
    description: 'Sales-focused CRM for small teams',
    features: ['Persons', 'Organizations', 'Deals', 'Activities', 'Pipelines', 'Custom Fields'],
    pricing: 'Free with Pipedrive account',
    setup_complexity: 'Easy',
    popular: false
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/zoho.svg',
    description: 'Complete business suite with CRM',
    features: ['Leads', 'Contacts', 'Deals', 'Accounts', 'Campaigns', 'Analytics', 'Automation'],
    pricing: 'Free with Zoho account',
    setup_complexity: 'Medium',
    popular: false
  },
  {
    id: 'dynamics',
    name: 'Microsoft Dynamics 365',
    logo_url: 'https://cdn.worldvectorlogo.com/logos/microsoft-dynamics-365.svg',
    description: 'Enterprise CRM and ERP solution',
    features: ['Contacts', 'Opportunities', 'Accounts', 'Cases', 'Marketing', 'Service', 'Sales'],
    pricing: 'Enterprise pricing',
    setup_complexity: 'Complex',
    popular: false
  }
]

export function AdvancedCRMIntegrations() {
  const [selectedIntegration, setSelectedIntegration] = useState<CRMIntegration | null>(null)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [selectedCRM, setSelectedCRM] = useState<string>('')
  const [syncing, setSyncing] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'syncing': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle
      case 'disconnected': return XCircle
      case 'error': return AlertCircle
      case 'syncing': return Sync
      default: return AlertCircle
    }
  }

  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId)
    // Simulate sync process
    setTimeout(() => {
      setSyncing(null)
    }, 3000)
  }

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getSyncSuccessRate = (stats: SyncStats) => {
    if (stats.total_records === 0) return 100
    return Math.round((stats.synced_records / stats.total_records) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Integrations</h1>
          <p className="text-gray-600">
            Connect with leading CRM platforms to sync your client data seamlessly.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Connect CRM
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Connect CRM Platform</DialogTitle>
                <DialogDescription>
                  Choose a CRM platform to integrate with Onboard Hero.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableCRMs.map((crm) => (
                  <Card 
                    key={crm.id} 
                    className={`cursor-pointer transition-all ${
                      selectedCRM === crm.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedCRM(crm.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={crm.logo_url} alt={crm.name} className="w-8 h-8" />
                          <div>
                            <CardTitle className="text-lg">{crm.name}</CardTitle>
                            {crm.popular && (
                              <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {crm.setup_complexity}
                        </Badge>
                      </div>
                      <CardDescription>{crm.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {crm.features.slice(0, 4).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {crm.features.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{crm.features.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Pricing:</span>
                          <span className="font-medium">{crm.pricing}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                  Cancel
                </Button>
                <Button disabled={!selectedCRM}>
                  Connect {selectedCRM ? availableCRMs.find(c => c.id === selectedCRM)?.name : 'CRM'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Connected CRMs
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockCRMIntegrations.filter(i => i.status === 'connected').length}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockCRMIntegrations.filter(i => i.status === 'error').length} with errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Total Records
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockCRMIntegrations.reduce((sum, i) => sum + i.sync_stats.total_records, 0).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockCRMIntegrations.reduce((sum, i) => sum + i.sync_stats.synced_records, 0).toLocaleString()} synced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Sync Success Rate
            </CardTitle>
            <div className="text-2xl font-bold">
              {Math.round(
                mockCRMIntegrations.reduce((sum, i) => sum + getSyncSuccessRate(i.sync_stats), 0) / 
                mockCRMIntegrations.length
              )}%
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockCRMIntegrations.reduce((sum, i) => sum + i.sync_stats.failed_records, 0)} failed records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Last Sync
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockCRMIntegrations
                .filter(i => i.last_sync)
                .sort((a, b) => new Date(b.last_sync!).getTime() - new Date(a.last_sync!).getTime())[0]
                ? formatLastSync(mockCRMIntegrations
                    .filter(i => i.last_sync)
                    .sort((a, b) => new Date(b.last_sync!).getTime() - new Date(a.last_sync!).getTime())[0].last_sync!)
                : 'Never'
              }
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all integrations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Active Integrations</TabsTrigger>
          <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
          <TabsTrigger value="available">Available CRMs</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockCRMIntegrations.map((integration) => {
              const StatusIcon = getStatusIcon(integration.status)
              const isCurrentlySyncing = syncing === integration.id
              const successRate = getSyncSuccessRate(integration.sync_stats)
              
              return (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={integration.logo_url} alt={integration.name} className="w-8 h-8" />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSync(integration.id)}>
                            <Sync className="h-4 w-4 mr-2" />
                            Sync Now
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Field Mapping
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(isCurrentlySyncing ? 'syncing' : integration.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {isCurrentlySyncing ? 'Syncing...' : integration.status}
                        </Badge>
                        <div className="text-sm text-gray-600">
                          {integration.sync_frequency} sync
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Sync Success Rate</span>
                          <span className="font-medium">{successRate}%</span>
                        </div>
                        <Progress value={successRate} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Total Records</div>
                          <div className="font-medium">{integration.sync_stats.total_records.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Failed Records</div>
                          <div className="font-medium text-red-600">{integration.sync_stats.failed_records}</div>
                        </div>
                      </div>

                      {integration.last_sync && (
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Last sync: {formatLastSync(integration.last_sync)}</span>
                          </div>
                          <div>
                            Duration: {integration.sync_stats.last_sync_duration}s
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Features:</span>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {integration.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{integration.features.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {integration.sync_stats.sync_errors.length > 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-red-800">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {integration.sync_stats.sync_errors.length} sync error(s)
                            </span>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            Latest: {integration.sync_stats.sync_errors[0].error_message}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="field-mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Configuration</CardTitle>
              <CardDescription>
                Configure how data fields are mapped between Onboard Hero and your CRM systems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockCRMIntegrations.filter(i => i.status === 'connected').map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <img src={integration.logo_url} alt={integration.name} className="w-6 h-6" />
                      <h3 className="font-medium">{integration.name}</h3>
                      <Badge variant="outline">{integration.field_mappings.length} mappings</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {integration.field_mappings.map((mapping) => (
                        <div key={mapping.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <div className="font-medium">{mapping.crm_field}</div>
                              <div className="text-gray-600">{integration.provider.toUpperCase()}</div>
                            </div>
                            <ArrowUpDown className="h-4 w-4 text-gray-400" />
                            <div className="text-sm">
                              <div className="font-medium">{mapping.onboardkit_field}</div>
                              <div className="text-gray-600">Onboard Hero</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline" className="text-xs">
                              {mapping.data_type}
                            </Badge>
                            <Badge variant={mapping.direction === 'bidirectional' ? 'default' : 'secondary'} className="text-xs">
                              {mapping.direction}
                            </Badge>
                            <Switch checked={mapping.enabled} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Sync Activity Log
              </CardTitle>
              <CardDescription>
                Recent synchronization activity across all CRM integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCRMIntegrations.flatMap(integration => 
                  integration.sync_stats.sync_errors.map(error => ({
                    ...error,
                    integration_name: integration.name,
                    integration_logo: integration.logo_url
                  }))
                ).map((error) => (
                  <div key={error.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <img src={error.integration_logo} alt="" className="w-6 h-6 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{error.integration_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {error.error_type}
                        </Badge>
                        <Badge variant={error.resolved ? 'default' : 'destructive'} className="text-xs">
                          {error.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Record ID: {error.record_id}
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        {error.error_message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(error.occurred_at).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCRMs.map((crm) => {
              const isConnected = mockCRMIntegrations.some(i => i.provider === crm.id)
              
              return (
                <Card key={crm.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={crm.logo_url} alt={crm.name} className="w-8 h-8" />
                        <div>
                          <CardTitle className="text-lg">{crm.name}</CardTitle>
                          {crm.popular && (
                            <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                          )}
                        </div>
                      </div>
                      {isConnected && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{crm.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {crm.features.slice(0, 4).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {crm.features.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{crm.features.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Setup:</span>
                          <Badge variant="outline" className="text-xs">
                            {crm.setup_complexity}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Pricing:</span>
                          <span className="font-medium">{crm.pricing}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        variant={isConnected ? "outline" : "default"}
                        disabled={isConnected}
                      >
                        {isConnected ? 'Already Connected' : 'Connect'}
                      </Button>
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
