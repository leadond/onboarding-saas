'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter,
  Settings,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Zap,
  MessageSquare,
  Calendar,
  FileText,
  Calculator,
  HeadphonesIcon,
  GitBranch,
  Trello,
  Mail,
  BarChart3,
  Building2,
  Clock,
  Database,
  Video,
  FormInput
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Category icons mapping
const categoryIcons = {
  communication: MessageSquare,
  automation: Zap,
  crm: Building2,
  email_marketing: Mail,
  database: Database,
  workspace: Database,
  documents: FileText,
  accounting: Calculator,
  support: HeadphonesIcon,
  scheduling: Clock,
  calendar: Calendar,
  analytics: BarChart3,
  development: GitBranch,
  project_management: Trello,
  forms: FormInput,
  video: Video,
}

interface IntegrationProvider {
  id: string
  name: string
  slug: string
  category: string
  description: string
  auth_type: string
  is_active: boolean
  features: Record<string, boolean>
  is_connected?: boolean
  connection?: any
}

interface UserIntegration {
  id: string
  provider_slug: string
  is_active: boolean
  sync_status: string
  error_message?: string
  created_at: string
  provider: IntegrationProvider
}

export default function IntegrationsPage() {
  const [providers, setProviders] = useState<IntegrationProvider[]>([])
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('available')
  const { toast } = useToast()

  // Mock data for when database isn't set up yet
  const mockProviders: IntegrationProvider[] = [
    { id: '1', name: 'Slack', slug: 'slack', category: 'communication', description: 'Team messaging and notifications', auth_type: 'oauth2', is_active: true, features: { notifications: true, channels: true }, is_connected: false },
    { id: '2', name: 'Zapier', slug: 'zapier', category: 'automation', description: 'Connect 6000+ apps with automated workflows', auth_type: 'oauth2', is_active: true, features: { webhooks: true, triggers: true }, is_connected: false },
    { id: '3', name: 'Calendly', slug: 'calendly', category: 'scheduling', description: 'Automated scheduling and calendar management', auth_type: 'oauth2', is_active: true, features: { events: true, bookings: true }, is_connected: false },
    { id: '4', name: 'DocuSign', slug: 'docusign', category: 'documents', description: 'Digital signature and document management', auth_type: 'oauth2', is_active: true, features: { envelopes: true, templates: true }, is_connected: false },
    { id: '5', name: 'QuickBooks', slug: 'quickbooks', category: 'accounting', description: 'Small business accounting software', auth_type: 'oauth2', is_active: true, features: { customers: true, invoices: true }, is_connected: false },
    { id: '6', name: 'Intercom', slug: 'intercom', category: 'support', description: 'Customer messaging and support platform', auth_type: 'oauth2', is_active: true, features: { conversations: true, users: true }, is_connected: false },
    { id: '7', name: 'GitHub', slug: 'github', category: 'development', description: 'Git repository hosting and collaboration', auth_type: 'oauth2', is_active: true, features: { repositories: true, issues: true }, is_connected: false },
    { id: '8', name: 'Linear', slug: 'linear', category: 'project_management', description: 'Modern project management for software teams', auth_type: 'oauth2', is_active: true, features: { issues: true, projects: true }, is_connected: false },
    { id: '9', name: 'Airtable', slug: 'airtable', category: 'database', description: 'Flexible database and collaboration platform', auth_type: 'oauth2', is_active: true, features: { bases: true, records: true }, is_connected: false },
    { id: '10', name: 'Typeform', slug: 'typeform', category: 'forms', description: 'Online form and survey builder', auth_type: 'oauth2', is_active: true, features: { forms: true, responses: true }, is_connected: false },
    { id: '11', name: 'Mailchimp', slug: 'mailchimp', category: 'email_marketing', description: 'Email marketing automation platform', auth_type: 'oauth2', is_active: true, features: { lists: true, campaigns: true }, is_connected: false },
    { id: '12', name: 'Notion', slug: 'notion', category: 'workspace', description: 'All-in-one workspace for notes and tasks', auth_type: 'oauth2', is_active: true, features: { pages: true, databases: true }, is_connected: false },
    { id: '13', name: 'Mixpanel', slug: 'mixpanel', category: 'analytics', description: 'Product analytics platform', auth_type: 'api_key', is_active: true, features: { events: true, funnels: true }, is_connected: false },
    { id: '14', name: 'HubSpot', slug: 'hubspot', category: 'crm', description: 'Inbound marketing and CRM platform', auth_type: 'oauth2', is_active: true, features: { contacts: true, deals: true }, is_connected: false },
    { id: '15', name: 'Loom', slug: 'loom', category: 'video', description: 'Screen and video recording platform', auth_type: 'oauth2', is_active: true, features: { videos: true, sharing: true }, is_connected: false }
  ]

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      setLoading(true)
      
      // Load available providers
      const providersResponse = await fetch('/api/integrations')
      const providersData = await providersResponse.json()
      
      if (providersData.success) {
        setProviders(providersData.data.providers)
      } else {
        // Use mock data if API fails (database not set up yet)
        console.log('Using mock integration data - database not set up yet')
        setProviders(mockProviders)
      }
      
      // Load connected integrations
      const connectedResponse = await fetch('/api/integrations?connected=true')
      const connectedData = await connectedResponse.json()
      
      if (connectedData.success) {
        setUserIntegrations(connectedData.data.integrations)
      }
    } catch (error) {
      // Use mock data on error
      console.log('Using mock integration data - API error:', error)
      setProviders(mockProviders)
      setUserIntegrations([])
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (providerSlug: string) => {
    const provider = providers.find(p => p.slug === providerSlug)
    if (!provider) return

    try {
      // Redirect to OAuth flow for OAuth2 providers
      if (provider.auth_type === 'oauth2') {
        const authUrls: Record<string, string> = {
          slack: `/api/integrations/slack/auth`,
          calendly: `/api/integrations/calendly/auth`,
          docusign: `/api/integrations/docusign/auth`,
        }

        const authUrl = authUrls[providerSlug]
        if (authUrl) {
          window.location.href = authUrl
          return
        }
      }

      // For API key integrations, show modal (to be implemented)
      toast({
        title: 'Integration Setup',
        description: `${provider.name} integration setup coming soon!`,
      })
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: `Failed to connect to ${provider.name}`,
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = async (providerSlug: string) => {
    try {
      const response = await fetch(`/api/integrations?provider=${providerSlug}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'Disconnected',
          description: 'Integration disconnected successfully',
        })
        loadIntegrations()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect integration',
        variant: 'destructive',
      })
    }
  }

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(providers.map(p => p.category).filter(Boolean)))
  const connectedCount = userIntegrations.length
  const availableCount = providers.length - connectedCount

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Integrations
              </h1>
              <p className="text-lg text-muted-foreground">
                Connect your favorite tools to automate your onboarding workflow
              </p>
            </div>
            <Button size="lg" className="shadow-glow">
              <Plus className="mr-2 h-5 w-5" />
              Request Integration
            </Button>
          </div>
          
          {/* Color Line Separator */}
          <div className="absolute -bottom-4 left-0 w-32 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
        </div>

        {/* Stats Cards */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-500 to-success-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Connected</CardTitle>
                <div className="p-2 bg-success-100 rounded-xl">
                  <Check className="h-5 w-5 text-success-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{connectedCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Active integrations
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Available</CardTitle>
                <div className="p-2 bg-primary-100 rounded-xl">
                  <Plus className="h-5 w-5 text-primary-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{availableCount}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Ready to connect
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-500 to-secondary-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Categories</CardTitle>
                <div className="p-2 bg-secondary-100 rounded-xl">
                  <Filter className="h-5 w-5 text-secondary-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{categories.length}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Integration types
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning-500 to-warning-600"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Automation</CardTitle>
                <div className="p-2 bg-warning-100 rounded-xl">
                  <Zap className="h-5 w-5 text-warning-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {providers.filter(p => p.category === 'automation').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Workflow tools
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Color Line Separator */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
        </div>

        {/* Search and Filters */}
        <div className="relative">
          <div className="flex items-center space-x-6">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="text-base"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border-2 border-border/50 rounded-xl bg-background/50 backdrop-blur-sm text-sm font-medium focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                </option>
              ))}
            </select>
          </div>
          
          {/* Color Line Separator */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full"></div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">
            Available ({filteredProviders.length})
          </TabsTrigger>
          <TabsTrigger value="connected">
            Connected ({connectedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider) => {
              const IconComponent = categoryIcons[(provider.category || 'crm') as keyof typeof categoryIcons] || Building2
              const isConnected = provider.is_connected
              
              return (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {provider.category?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      {isConnected && (
                        <Badge variant="default">
                          <Check className="mr-1 h-3 w-3" />
                          Connected
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{provider.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {Object.entries(provider.features)
                        .filter(([_, enabled]) => enabled)
                        .slice(0, 3)
                        .map(([feature]) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={provider.auth_type === 'oauth2' ? 'default' : 'secondary'}>
                          {provider.auth_type === 'oauth2' ? 'OAuth' : 'API Key'}
                        </Badge>
                      </div>
                      
                      {isConnected ? (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Settings className="mr-1 h-3 w-3" />
                            Configure
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDisconnect(provider.slug)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleConnect(provider.slug)}
                          size="sm"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          {userIntegrations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Connected Integrations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your first integration to start automating your workflows
                </p>
                <Button onClick={() => setActiveTab('available')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Browse Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userIntegrations.map((integration) => {
                const IconComponent = categoryIcons[(integration.provider.category || 'crm') as keyof typeof categoryIcons] || Building2
                
                return (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.provider.name}</CardTitle>
                            <CardDescription>
                              Connected on {new Date(integration.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={integration.sync_status === 'connected' ? 'default' : 'destructive'}
                          >
                            {integration.sync_status === 'connected' && <Check className="mr-1 h-3 w-3" />}
                            {integration.sync_status === 'error' && <AlertCircle className="mr-1 h-3 w-3" />}
                            {integration.sync_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {integration.error_message && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                          {integration.error_message}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {integration.provider.category?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Settings className="mr-1 h-3 w-3" />
                            Settings
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Logs
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDisconnect(integration.provider_slug)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}