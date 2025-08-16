'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mail,
  Calendar,
  Users,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Eye,
  MousePointer,
  MessageSquare,
} from 'lucide-react'
import { NylasEmailComposer } from './nylas-email-composer'
import { NylasCalendarView } from './nylas-calendar-view'
import { NylasSchedulingManager } from './nylas-scheduling-manager'
import { NylasContactManager } from './nylas-contact-manager'

interface NylasAccount {
  id: string
  email: string
  provider: string
  sync_state: string
  billing_state: string
}

interface EmailAnalytics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  replied: number
}

export function NylasDashboard() {
  const [accounts, setAccounts] = useState<NylasAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [emailAnalytics, setEmailAnalytics] = useState<EmailAnalytics>({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
  })

  useEffect(() => {
    fetchNylasData()
  }, [])

  const fetchNylasData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/integrations/nylas')
      const data = await response.json()

      if (data.success) {
        setAccounts(data.data.accounts)
        // Mock analytics data
        setEmailAnalytics({
          sent: 156,
          delivered: 152,
          opened: 89,
          clicked: 34,
          replied: 12,
        })
      } else {
        setError(data.error || 'Failed to fetch Nylas data')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const connectAccount = async (provider: string) => {
    try {
      const response = await fetch('/api/integrations/nylas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: `user@${provider}.com`,
        }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchNylasData()
      } else {
        setError(data.error || 'Failed to connect account')
      }
    } catch (err) {
      setError('Failed to connect account')
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'gmail':
        return '📧'
      case 'outlook':
        return '📮'
      case 'yahoo':
        return '📬'
      default:
        return '✉️'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800'
      case 'stopped':
        return 'bg-red-100 text-red-800'
      case 'invalid':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Nylas integration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nylas Integration</h1>
          <p className="text-muted-foreground">
            Advanced email, calendar, and contact management
          </p>
        </div>
        <Button onClick={fetchNylasData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No accounts connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your email accounts to get started with Nylas
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => connectAccount('gmail')} variant="outline">
                  📧 Connect Gmail
                </Button>
                <Button onClick={() => connectAccount('outlook')} variant="outline">
                  📮 Connect Outlook
                </Button>
                <Button onClick={() => connectAccount('yahoo')} variant="outline">
                  📬 Connect Yahoo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getProviderIcon(account.provider)}
                    </span>
                    <div>
                      <p className="font-medium">{account.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(account.sync_state)}>
                      {account.sync_state === 'running' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {account.sync_state === 'stopped' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {account.sync_state === 'invalid' && <Clock className="h-3 w-3 mr-1" />}
                      {account.sync_state.charAt(0).toUpperCase() + account.sync_state.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {account.billing_state}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {accounts.length > 0 && (
        <>
          {/* Email Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Email Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold">{emailAnalytics.sent}</p>
                  <p className="text-sm text-muted-foreground">Sent</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold">{emailAnalytics.delivered}</p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold">{emailAnalytics.opened}</p>
                  <p className="text-sm text-muted-foreground">Opened</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                    <MousePointer className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold">{emailAnalytics.clicked}</p>
                  <p className="text-sm text-muted-foreground">Clicked</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mx-auto mb-2">
                    <MessageSquare className="h-6 w-6 text-teal-600" />
                  </div>
                  <p className="text-2xl font-bold">{emailAnalytics.replied}</p>
                  <p className="text-sm text-muted-foreground">Replied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Features */}
          <Tabs defaultValue="email" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduling
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Contacts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email">
              <NylasEmailComposer accountId={accounts[0]?.id} />
            </TabsContent>

            <TabsContent value="calendar">
              <NylasCalendarView accountId={accounts[0]?.id} />
            </TabsContent>

            <TabsContent value="scheduling">
              <NylasSchedulingManager />
            </TabsContent>

            <TabsContent value="contacts">
              <NylasContactManager accountId={accounts[0]?.id} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}