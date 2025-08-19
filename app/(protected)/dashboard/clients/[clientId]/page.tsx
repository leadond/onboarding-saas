'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Mail, Building, Calendar, CheckCircle, Clock, Play } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  company?: string
  status: string
  statusDuration?: string
  invited_at: string
  assignments?: any[]
}

export default function ClientProgressPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClient()
  }, [clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`)
      const result = await response.json()
      
      if (result.success) {
        setClient(result.data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!client) {
    return <div className="p-8">Client not found</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/clients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Client Progress</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{client.name}</span>
            </div>
            <div className="text-right">
              <Badge variant={client.status === 'No Active Kit Assigned' ? 'secondary' : 'default'}>
                {client.status}
              </Badge>
              {client.statusDuration && (
                <p className="text-xs text-gray-500 mt-1">{client.statusDuration}</p>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{client.email}</span>
            </div>
            {client.company && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}