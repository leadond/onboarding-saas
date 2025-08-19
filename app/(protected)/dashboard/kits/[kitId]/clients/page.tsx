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
import Link from 'next/link'
import { format } from 'date-fns'

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ClientSelector } from '@/components/client-selector'
import { 
  ArrowLeft, 
  Users, 
  Plus,
  Search,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Filter
} from 'lucide-react'

type Kit = {
  id: string
  name: string
  status: string
}

type Client = {
  client_identifier: string
  client_name: string
  client_email: string
  status: 'not_started' | 'in_progress' | 'completed'
  started_at: string
  completed_at?: string
  last_activity_at?: string
  current_step?: {
    title: string
    step_order: number
  }
  response_data?: any
}

type ClientsData = {
  clients: Client[]
  stats: {
    total: number
    completed: number
    in_progress: number
    not_started: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function KitClientsPage({
  params,
}: {
  params: { kitId: string }
}) {
  const [kit, setKit] = useState<Kit | null>(null)
  const [clientsData, setClientsData] = useState<ClientsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  const [assignForm, setAssignForm] = useState({
    client_email: '',
    client_name: '',
    send_invitation: true,
    custom_message: '',
    due_date: '',
  })

  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const searchParams = new URLSearchParams()
      if (statusFilter !== 'all') searchParams.append('status', statusFilter)
      if (searchTerm) searchParams.append('search', searchTerm)
      
      const response = await fetch(`/api/kits/${params.kitId}/clients?${searchParams}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch clients')
      }
      
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch clients')
      }
      
      setClientsData(result.data)
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
  }, [params.kitId])

  useEffect(() => {
    if (kit) {
      fetchClients()
    }
  }, [kit, statusFilter, searchTerm])

  const handleAssignClient = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!assignForm.client_email || !assignForm.client_name) {
      setError('Client email and name are required')
      return
    }

    try {
      setIsAssigning(true)
      setError(null)

      const response = await fetch(`/api/kits/${params.kitId}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign client')
      }

      const result = await response.json()
      
      // Reset form and close dialog
      setAssignForm({
        client_email: '',
        client_name: '',
        send_invitation: true,
        custom_message: '',
        due_date: '',
      })
      setShowAssignDialog(false)
      
      // Refresh clients list
      fetchClients()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign client')
    } finally {
      setIsAssigning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'not_started':
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      case 'not_started':
        return 'Not Started'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading && !clientsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error && !kit) {
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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/kits/${kit?.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {kit?.name}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="h-8 w-8 mr-3" />
              Clients
            </h1>
            <p className="mt-2 text-gray-600">Manage client assignments and track progress</p>
          </div>
        </div>
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button disabled={kit?.status !== 'published'}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Client to Kit</DialogTitle>
              <DialogDescription>
                Add a new client to this onboarding kit. They'll receive an invitation email to get started.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAssignClient}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="client_select" className="text-sm font-medium">
                    Select Existing Client
                  </label>
                  <ClientSelector 
                    onClientSelect={(client) => {
                      setAssignForm(prev => ({
                        ...prev,
                        client_email: client.email,
                        client_name: client.name
                      }))
                    }}
                  />
                </div>
                <div className="text-center text-sm text-gray-500 my-2">or</div>
                <div className="space-y-2">
                  <label htmlFor="client_email" className="text-sm font-medium">
                    Client Email *
                  </label>
                  <Input
                    id="client_email"
                    type="email"
                    placeholder="client@example.com"
                    value={assignForm.client_email}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, client_email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="client_name" className="text-sm font-medium">
                    Client Name *
                  </label>
                  <Input
                    id="client_name"
                    placeholder="John Doe"
                    value={assignForm.client_name}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, client_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="due_date" className="text-sm font-medium">
                    Due Date (Optional)
                  </label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={assignForm.due_date}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="custom_message" className="text-sm font-medium">
                    Custom Message (Optional)
                  </label>
                  <Textarea
                    id="custom_message"
                    placeholder="Add a personal message for the client..."
                    rows={3}
                    value={assignForm.custom_message}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, custom_message: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="send_invitation"
                    checked={assignForm.send_invitation}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, send_invitation: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="send_invitation" className="text-sm font-medium">
                    Send invitation email
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAssigning}>
                  {isAssigning ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Client'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {kit?.status !== 'published' && (
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-600">
            Kit must be published before you can assign clients. 
            <Link href={`/dashboard/kits/${kit?.id}`} className="font-medium underline ml-1">
              Publish your kit
            </Link>
          </p>
        </div>
      )}

      {/* Stats Cards */}
      {clientsData && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientsData.stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{clientsData.stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{clientsData.stats.in_progress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Not Started</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{clientsData.stats.not_started}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>
            {clientsData ? `${clientsData.stats.total} client${clientsData.stats.total !== 1 ? 's' : ''} assigned to this kit` : 'Loading clients...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner className="h-6 w-6" />
            </div>
          ) : !clientsData?.clients || clientsData.clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Yet</h3>
              <p className="text-gray-600 mb-4">
                {kit?.status !== 'published' 
                  ? 'Publish your kit to start assigning clients.'
                  : 'Assign your first client to get started.'
                }
              </p>
              {kit?.status === 'published' && (
                <Button onClick={() => setShowAssignDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {clientsData.clients.map((client) => (
                <div key={client.client_identifier} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(client.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{client.client_name}</h4>
                        <p className="text-sm text-gray-500">{client.client_email}</p>
                        {client.current_step && (
                          <p className="text-xs text-gray-400 mt-1">
                            Current: Step {client.current_step.step_order + 1} - {client.current_step.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {getStatusLabel(client.status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Started: {format(new Date(client.started_at), 'MMM dd, yyyy')}
                      </p>
                      {client.completed_at && (
                        <p className="text-xs text-gray-500">
                          Completed: {format(new Date(client.completed_at), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}