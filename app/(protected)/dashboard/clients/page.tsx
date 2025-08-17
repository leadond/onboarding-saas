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
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
  status: string
  created_at: string
  updated_at: string
}

interface ClientsStats {
  total: number
  active: number
  completed: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<ClientsStats>({ total: 0, active: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/clients')

        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
          setClients(data.data.clients || [])
          setStats(data.data.stats || { total: 0, active: 0, completed: 0 })
        } else {
          throw new Error(data.error || 'Failed to load clients')
        }
      } catch (err) {
        console.error('Error fetching clients:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch clients')
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">
              Manage and monitor your client relationships and onboarding progress.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/clients/new">Invite New Client</Link>
          </Button>
        </div>
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-red-900">
            Unable to load clients
          </h3>
          <p className="mb-6 text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">
            Manage and monitor your client relationships and onboarding progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clients/new">Invite New Client</Link>
        </Button>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clients</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.total === 0 ? 'No clients yet' : 'Active in system'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Onboarding</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.active === 0 ? 'No active onboarding' : 'Currently onboarding'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed This Month</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.completed === 0 ? 'No completions yet' : 'Completed this month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Clients */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>
              {clients.length === 0 
                ? 'No clients found' 
                : 'Clients who recently started onboarding'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No clients found. Start by inviting your first client.
              </p>
            ) : (
              <div className="space-y-4">
                {clients.slice(0, 5).map(client => (
                  <div key={client.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm">{client.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Actions</CardTitle>
            <CardDescription>Quick actions for client management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/kits/new">Create Onboarding Kit</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Import Client List
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Send Bulk Invitations
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Export Client Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Empty State for no clients */}
      {clients.length === 0 && !loading && !error && (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No clients yet
          </h3>
          <p className="mb-6 text-gray-600">
            Start growing your business by inviting your first client.
          </p>
          <Button asChild>
            <Link href="/dashboard/clients/new">Invite Your First Client</Link>
          </Button>
        </div>
      )}
    </div>
  )
}