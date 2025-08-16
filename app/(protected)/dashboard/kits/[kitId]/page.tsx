'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Copy, ExternalLink, CheckCircle, UserPlus, Users, AlertCircle } from 'lucide-react'

type Kit = {
  id: string
  name: string
  slug: string
  description: string | null
  welcome_message: string | null
  brand_color: string
  logo_url: string | null
  status: 'draft' | 'published' | 'archived'
  analytics_enabled: boolean
  password_protected: boolean
  created_at: string
  updated_at: string
  kit_steps?: KitStep[]
}

type KitStep = {
  id: string
  step_order: number
  step_type: string
  title: string
  description: string | null
  is_required: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function KitOverviewPage({
  params,
}: {
  params: { kitId: string }
}) {
  const router = useRouter()
  const [kit, setKit] = useState<Kit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPublishedUrl, setShowPublishedUrl] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Client management state
  const [clients, setClients] = useState([])
  const [clientStats, setClientStats] = useState({ total: 0, completed: 0, in_progress: 0, not_started: 0 })
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  useEffect(() => {
    const fetchKit = async () => {
      try {
        const response = await fetch(`/api/kits/${params.kitId}`)

        if (!response.ok) {
          throw new Error('Kit not found')
        }

        const result = await response.json()
        setKit(result.data)
      } catch (error) {
        console.error('Error fetching kit:', error)
        setError(error instanceof Error ? error.message : 'Failed to load kit')
      } finally {
        setIsLoading(false)
      }
    }

    fetchKit()
  }, [params.kitId])

  useEffect(() => {
    if (kit?.status === 'published') {
      fetchClients()
    }
  }, [kit?.status])

  const handlePublish = async () => {
    if (!kit) return

    setIsPublishing(true)
    setError(null)

    try {
      const newStatus = kit.status === 'published' ? 'draft' : 'published'
      const response = await fetch(`/api/kits/${params.kitId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          publish_message: `Kit ${newStatus === 'published' ? 'published' : 'unpublished'} from overview page`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update kit status')
      }

      const result = await response.json()
      setKit(result.data)
      // Show published URL if kit was just published
      if (result.data.status === 'published') {
        setShowPublishedUrl(true)
      } else {
        setShowPublishedUrl(false)
      }
    } catch (error) {
      console.error('Error updating kit status:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to update kit status'
      )
    } finally {
      setIsPublishing(false)
    }
  }

  const copyPublishedUrl = async () => {
    if (!kit) return
    const url = `${window.location.origin}/kit/${kit.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const openPublishedKit = () => {
    if (!kit) return
    const url = `${window.location.origin}/kit/${kit.id}`
    window.open(url, '_blank')
  }

  const handleDuplicate = async () => {
    if (!kit) return

    try {
      const response = await fetch(`/api/kits/${params.kitId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${kit.name} (Copy)`,
          include_steps: true,
          copy_settings: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to duplicate kit')
      }

      const result = await response.json()
      router.push(`/dashboard/kits/${result.data.id}`)
    } catch (error) {
      console.error('Error duplicating kit:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to duplicate kit'
      )
    }
  }

  const handleDeleteKit = async () => {
    if (!kit) return

    if (
      !confirm(
        'Are you sure you want to delete this kit? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/kits/${params.kitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete kit')
      }

      router.push('/dashboard/kits')
    } catch (error) {
      console.error('Error deleting kit:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete kit')
    }
  }

  const getStepTypeDisplayName = (stepType: string): string => {
    const displayNames: Record<string, string> = {
      welcome_message: 'Welcome Message',
      welcome_video: 'Welcome Video',
      intake_form: 'Intake Form',
      file_upload: 'File Upload',
      contract_signing: 'Contract Signing',
      scheduling: 'Scheduling',
      payment: 'Payment',
      confirmation: 'Confirmation',
    }
    return displayNames[stepType] || stepType
  }

  const fetchClients = async () => {
    if (kit?.status !== 'published') return
    
    try {
      const response = await fetch(`/api/kits/${params.kitId}/clients`)
      if (response.ok) {
        const result = await response.json()
        setClients(result.data.clients || [])
        setClientStats(result.data.stats || { total: 0, completed: 0, in_progress: 0, not_started: 0 })
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  const handleInviteClient = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      setError('Client name and email are required')
      return
    }

    try {
      setIsInviting(true)
      setError(null)

      const response = await fetch(`/api/kits/${params.kitId}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: clientName.trim(),
          client_email: clientEmail.trim(),
          custom_message: customMessage.trim() || undefined,
          send_invitation: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to invite client')
      }

      // Reset form
      setClientName('')
      setClientEmail('')
      setCustomMessage('')
      setIsInviteDialogOpen(false)
      
      // Refresh clients
      await fetchClients()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite client')
    } finally {
      setIsInviting(false)
    }
  }

  const copyClientUrl = async (clientIdentifier: string) => {
    if (!kit) return
    const url = `${window.location.origin}/kit/${kit.id}?client=${encodeURIComponent(clientIdentifier)}`
    try {
      await navigator.clipboard.writeText(url)
      // Show success feedback
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading kit...</p>
        </div>
      </div>
    )
  }

  if (error && !kit) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/kits">Back to Kits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!kit) return null

  const steps = kit.kit_steps?.sort((a, b) => a.step_order - b.step_order) || []

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-900">{kit.name}</h1>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                kit.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : kit.status === 'archived'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {kit.status}
            </span>
          </div>
          {kit.description && (
            <p className="mt-2 text-gray-600">{kit.description}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/kits/${kit.id}/edit`}>Edit</Link>
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing}
            variant={kit.status === 'published' ? 'outline' : 'default'}
          >
            {isPublishing
              ? kit.status === 'published'
                ? 'Unpublishing...'
                : 'Publishing...'
              : kit.status === 'published'
                ? 'Unpublish'
                : 'Publish'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Published Kit URL */}
      {showPublishedUrl && kit?.status === 'published' && (
        <div className="border-green-200 bg-green-50 border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-green-800 space-y-3 flex-1">
              <p className="font-medium">🎉 Kit Published Successfully!</p>
              <p className="text-sm">Your onboarding kit is now live and accessible to clients:</p>
              <div className="flex items-center space-x-2 rounded-md bg-white p-3 border">
                <code className="flex-1 text-sm font-mono text-gray-700">
                  {typeof window !== 'undefined' ? `${window.location.origin}/kit/${kit.id}` : `[domain]/kit/${kit.id}`}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPublishedUrl}
                  className="shrink-0"
                >
                  {copiedUrl ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedUrl ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openPublishedKit}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kit Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Steps</CardDescription>
            <CardTitle className="text-2xl">{steps.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Steps</CardDescription>
            <CardTitle className="text-2xl">
              {steps.filter(s => s.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Required Steps</CardDescription>
            <CardTitle className="text-2xl">
              {steps.filter(s => s.is_required).length}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Analytics</CardDescription>
            <CardTitle className="text-sm">
              {kit.analytics_enabled ? 'Enabled' : 'Disabled'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Client Management Section */}
      {kit?.status === 'published' && (
        <div className="space-y-6">
          {/* Client Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Clients</CardDescription>
                <CardTitle className="text-2xl">{clientStats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-2xl text-green-600">{clientStats.completed}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Progress</CardDescription>
                <CardTitle className="text-2xl text-blue-600">{clientStats.in_progress}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Not Started</CardDescription>
                <CardTitle className="text-2xl text-gray-600">{clientStats.not_started}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Client Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Management
                  </CardTitle>
                  <CardDescription>
                    Invite and manage clients for "{kit.name}"
                  </CardDescription>
                </div>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Invite New Client</DialogTitle>
                      <DialogDescription>
                        Send an invitation to a client to start their onboarding process.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="client-name">Client Name *</Label>
                        <Input
                          id="client-name"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="client-email">Email Address *</Label>
                        <Input
                          id="client-email"
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                        <Textarea
                          id="custom-message"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Add a personalized message for this client..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                        disabled={isInviting}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleInviteClient} disabled={isInviting}>
                        {isInviting ? 'Inviting...' : 'Send Invitation'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start by inviting your first client to this onboarding kit.
                  </p>
                  <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite First Client
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client: any) => (
                      <TableRow key={client.client_identifier}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{client.client_name}</div>
                            <div className="text-sm text-gray-500">{client.client_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'completed' ? 'default' : 'secondary'}>
                            {client.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(client.started_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyClientUrl(client.client_identifier)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/kit/${kit.id}?client=${encodeURIComponent(client.client_identifier)}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Steps Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kit Steps</CardTitle>
            <CardDescription>
              {steps.length === 0
                ? 'No steps added yet. Add your first step to get started.'
                : `${steps.length} step${steps.length === 1 ? '' : 's'} in your onboarding process`}
            </CardDescription>
          </div>
          <Button asChild>
            <Link href={`/dashboard/kits/${kit.id}/steps/new`}>Add Step</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {steps.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center">
              <p className="mb-4 text-gray-500">
                Your kit doesn&apos;t have any steps yet
              </p>
              <Button asChild>
                <Link href={`/dashboard/kits/${kit.id}/steps/new`}>
                  Add Your First Step
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {step.title}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {getStepTypeDisplayName(step.step_type)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {step.is_required && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                              Required
                            </span>
                          )}
                          {!step.is_active && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      {step.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/dashboard/kits/${kit.id}/steps/${step.id}`}
                      >
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/dashboard/kits/${kit.id}/preview`}>
                Preview Kit
              </Link>
            </Button>

            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/dashboard/kits/${kit.id}/analytics`}>
                View Analytics
              </Link>
            </Button>

            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/dashboard/kits/${kit.id}/clients`}>
                Manage Clients
              </Link>
            </Button>

            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/dashboard/kits/${kit.id}/settings`}>
                Kit Settings
              </Link>
            </Button>

            {kit.status === 'published' && (
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={openPublishedKit}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Published Kit
              </Button>
            )}

            {kit.status === 'published' && (
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={copyPublishedUrl}
              >
                {copiedUrl ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedUrl ? 'URL Copied!' : 'Copy Kit URL'}
              </Button>
            )}

            <Button
              variant="outline"
              className="justify-start"
              onClick={handleDuplicate}
            >
              Duplicate Kit
            </Button>

            <Button
              variant="outline"
              className="justify-start text-red-600 hover:text-red-700"
              onClick={handleDeleteKit}
            >
              Delete Kit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kit Information */}
      <Card>
        <CardHeader>
          <CardTitle>Kit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-500">Kit ID</dt>
              <dd className="mt-1 font-mono text-gray-900">{kit.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">URL Slug</dt>
              <dd className="mt-1 text-gray-900">{kit.slug}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Brand Color</dt>
              <dd className="mt-1 flex items-center">
                <span
                  className="mr-2 h-4 w-4 rounded"
                  style={{ backgroundColor: kit.brand_color }}
                />
                {kit.brand_color}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Password Protected</dt>
              <dd className="mt-1 text-gray-900">
                {kit.password_protected ? 'Yes' : 'No'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(kit.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(kit.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
