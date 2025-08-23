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
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArrowLeft, Mail, Phone, Building, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: 'invited' | 'active' | 'completed' | 'cancelled'
  invited_at: string
  activated_at?: string
  completed_at?: string
  progress: number
  current_step: string
  kit_id?: string
  kit_name?: string
}

interface OnboardingStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  completed_at?: string
  order: number
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.clientId as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clientId) {
      fetchClientDetails()
    }
  }, [clientId])

  const fetchClientDetails = async () => {
    try {
      setLoading(true)
      const [clientRes, stepsRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/steps`)
      ])

      if (clientRes.ok) {
        const clientData = await clientRes.json()
        if (clientData.success) {
          setClient(clientData.data)
        } else {
          setError(clientData.error || 'Client not found')
        }
      } else {
        setError('Client not found')
      }

      if (stepsRes.ok) {
        const stepsData = await stepsRes.json()
        if (stepsData.success) {
          setSteps(stepsData.data)
        }
      }
    } catch (err) {
      setError('Failed to load client details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'invited':
        return <Mail className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      invited: 'secondary',
      active: 'default',
      completed: 'default',
      cancelled: 'destructive'
    } as const

    const colors = {
      invited: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} 
             className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Client not found</h1>
          <p className="text-gray-600 mb-6">The client you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/dashboard/clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/clients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">Client onboarding progress</p>
          </div>
        </div>
        {getStatusIcon(client.status)}
      </div>

      {/* Client Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {getStatusIcon(client.status)}
          </CardHeader>
          <CardContent>
            {getStatusBadge(client.status)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.progress}%</div>
            <Progress value={client.progress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Step</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{client.current_step}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Kit</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{client.kit_name || 'Not assigned'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Client Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Client contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{client.email}</p>
              </div>
            </div>
            
            {client.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{client.phone}</p>
                </div>
              </div>
            )}
            
            {client.company && (
              <div className="flex items-center space-x-3">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-gray-600">{client.company}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Important dates and milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Invited</p>
                <p className="text-sm text-gray-600">{formatDate(client.invited_at)}</p>
              </div>
            </div>
            
            {client.activated_at && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Activated</p>
                  <p className="text-sm text-gray-600">{formatDate(client.activated_at)}</p>
                </div>
              </div>
            )}
            
            {client.completed_at && (
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-sm text-gray-600">{formatDate(client.completed_at)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Steps */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Steps</CardTitle>
            <CardDescription>Progress through the onboarding process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : step.status === 'in_progress' ? (
                      <Clock className="w-6 h-6 text-blue-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.completed_at && (
                      <p className="text-xs text-green-600 mt-1">
                        Completed on {formatDate(step.completed_at)}
                      </p>
                    )}
                  </div>
                  <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                    {step.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}