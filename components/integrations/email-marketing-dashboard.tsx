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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mail,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2,
  RefreshCw,
  Users,
  TrendingUp,
  Send
} from 'lucide-react'

interface EmailIntegration {
  id: string
  name: string
  description: string
  logo_url?: string
  is_connected: boolean
  features: string[]
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending'
  last_sync?: string
  config?: Record<string, any>
  setup_complexity?: string
  popularity_score?: number
}

interface ConnectionForm {
  [key: string]: string
}

interface IntegrationStats {
  total_subscribers: number
  emails_sent: number
  avg_open_rate: number
  connected_platforms: number
  available_platforms: number
  growth_subscribers: number
  growth_percentage: string
}

const CONNECTION_FORMS: Record<string, Array<{ key: string; label: string; type: string; placeholder: string; required: boolean }>> = {
  mailchimp: [
    { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Mailchimp API key', required: true }
  ],
  convertkit: [
    { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your ConvertKit API key', required: true },
    { key: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'Enter your ConvertKit API secret', required: true }
  ],
  hubspot: [
    { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your HubSpot access token', required: true }
  ],
  klaviyo: [
    { key: 'api_key', label: 'Private API Key', type: 'password', placeholder: 'Enter your Klaviyo private API key', required: true }
  ],
  activecampaign: [
    { key: 'api_url', label: 'API URL', type: 'url', placeholder: 'https://youraccountname.api-us1.com', required: true },
    { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your ActiveCampaign API key', required: true }
  ],
  mailerlite: [
    { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your MailerLite API key', required: true }
  ]
}

export function EmailMarketingDashboard() {
  const [integrations, setIntegrations] = useState<EmailIntegration[]>([])
  const [stats, setStats] = useState<IntegrationStats>({
    total_subscribers: 0,
    emails_sent: 0,
    avg_open_rate: 0,
    connected_platforms: 0,
    available_platforms: 0,
    growth_subscribers: 0,
    growth_percentage: '+0%'
  })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [selectedIntegration, setSelectedIntegration] = useState<EmailIntegration | null>(null)
  const [connectionForm, setConnectionForm] = useState<ConnectionForm>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      setError(null)
      const response = await fetch('/api/integrations/email-marketing')
      const data = await response.json()
      
      if (data.success) {
        setIntegrations(data.data)
        calculateStats(data.data)
      } else {
        setError(data.error || 'Failed to fetch integrations')
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error)
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (integrations: EmailIntegration[]) => {
    const connected = integrations.filter(int => int.is_connected)
    const available = integrations.filter(int => !int.is_connected)
    
    // For now, use placeholder calculations
    // In a real implementation, these would come from the actual integration APIs
    const totalSubscribers = connected.reduce((sum, integration) => {
      // Mock data based on integration type for demo
      switch (integration.id) {
        case 'mailchimp': return sum + 5200
        case 'convertkit': return sum + 3800
        case 'hubspot': return sum + 2400
        case 'klaviyo': return sum + 1900
        default: return sum + 1000
      }
    }, 0)

    const emailsSent = connected.reduce((sum, integration) => {
      switch (integration.id) {
        case 'mailchimp': return sum + 15200
        case 'convertkit': return sum + 11800
        case 'hubspot': return sum + 8400
        case 'klaviyo': return sum + 6900
        default: return sum + 3000
      }
    }, 0)

    const avgOpenRate = connected.length > 0 
      ? connected.reduce((sum, integration) => {
          switch (integration.id) {
            case 'mailchimp': return sum + 26.2
            case 'convertkit': return sum + 28.4
            case 'hubspot': return sum + 22.1
            case 'klaviyo': return sum + 31.8
            default: return sum + 24.0
          }
        }, 0) / connected.length 
      : 0

    setStats({
      total_subscribers: totalSubscribers,
      emails_sent: emailsSent,
      avg_open_rate: Math.round(avgOpenRate * 10) / 10,
      connected_platforms: connected.length,
      available_platforms: available.length,
      growth_subscribers: Math.floor(totalSubscribers * 0.08), // 8% growth
      growth_percentage: totalSubscribers > 0 ? '+8.2%' : '+0%'
    })
  }

  const handleConnect = async (integration: EmailIntegration) => {
    setConnecting(integration.id)
    setError(null)
    
    try {
      const response = await fetch('/api/integrations/email-marketing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider_id: integration.id,
          credentials: connectionForm
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update the integration in the list
        setIntegrations(prev => {
          const updated = prev.map(int =>
            int.id === integration.id
              ? { ...int, is_connected: true, connection_status: 'connected' as const, last_sync: new Date().toISOString() }
              : int
          )
          calculateStats(updated)
          return updated
        })
        setDialogOpen(false)
        setConnectionForm({})
      } else {
        setError(data.error || 'Failed to connect integration')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setError('Failed to connect integration')
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (integration: EmailIntegration) => {
    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return
    }

    setDisconnecting(integration.id)
    setError(null)

    try {
      const response = await fetch(`/api/integrations/email-marketing?provider_id=${integration.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setIntegrations(prev => {
          const updated = prev.map(int =>
            int.id === integration.id
              ? { ...int, is_connected: false, connection_status: 'disconnected' as const, last_sync: undefined }
              : int
          )
          calculateStats(updated)
          return updated
        })
      } else {
        setError(data.error || 'Failed to disconnect integration')
      }
    } catch (error) {
      console.error('Disconnect error:', error)
      setError('Failed to disconnect integration')
    } finally {
      setDisconnecting(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (integration: EmailIntegration) => {
    if (integration.is_connected) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
    }
    return <Badge variant="secondary">Not Connected</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing Integrations</h1>
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const connectedIntegrations = integrations.filter(int => int.is_connected)
  const availableIntegrations = integrations.filter(int => !int.is_connected)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Marketing Integrations</h1>
          <p className="text-gray-600">
            Connect with leading email marketing platforms to automate your client communications.
          </p>
        </div>
        <Button onClick={fetchIntegrations} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Connected Platforms
            </CardDescription>
            <CardTitle className="text-3xl">{stats.connected_platforms}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.available_platforms} more available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Subscribers
            </CardDescription>
            <CardTitle className="text-3xl">{stats.total_subscribers.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +{stats.growth_subscribers.toLocaleString()} this month ({stats.growth_percentage})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Emails Sent
            </CardDescription>
            <CardTitle className="text-3xl">{stats.emails_sent.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Avg. Open Rate
            </CardDescription>
            <CardTitle className="text-3xl">{stats.avg_open_rate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Tabs */}
      <Tabs defaultValue="connected" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connected">
            Connected ({connectedIntegrations.length})
          </TabsTrigger>
          <TabsTrigger value="available">
            Available ({availableIntegrations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-6">
          {connectedIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Connected Integrations</h3>
                <p className="text-gray-600 text-center mb-4">
                  Connect your first email marketing platform to start automating your client communications.
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {connectedIntegrations.map((integration) => (
                <Card key={integration.id} className="border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(integration.connection_status)}
                            {getStatusBadge(integration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{integration.description}</p>
                    
                    {integration.last_sync && (
                      <p className="text-xs text-gray-500">
                        Last sync: {new Date(integration.last_sync).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDisconnect(integration)}
                        disabled={disconnecting === integration.id}
                      >
                        {disconnecting === integration.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {availableIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(integration)}
                        {integration.setup_complexity && (
                          <Badge variant="outline" className="text-xs">
                            {integration.setup_complexity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{integration.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Dialog open={dialogOpen && selectedIntegration?.id === integration.id} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedIntegration(integration)}
                        disabled={connecting === integration.id}
                      >
                        {connecting === integration.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect to {integration.name}</DialogTitle>
                        <DialogDescription>
                          Enter your {integration.name} credentials to connect your account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {CONNECTION_FORMS[integration.id]?.map((field) => (
                          <div key={field.key} className="space-y-2">
                            <Label htmlFor={field.key}>{field.label}</Label>
                            <Input
                              id={field.key}
                              type={field.type}
                              placeholder={field.placeholder}
                              value={connectionForm[field.key] || ''}
                              onChange={(e) => setConnectionForm(prev => ({
                                ...prev,
                                [field.key]: e.target.value
                              }))}
                              required={field.required}
                            />
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDialogOpen(false)
                              setConnectionForm({})
                              setError(null)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleConnect(integration)}
                            disabled={connecting === integration.id}
                          >
                            {connecting === integration.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              'Connect'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}