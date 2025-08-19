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

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, Plus, Settings } from 'lucide-react'

interface SchedulingPage {
  id: string
  name: string
  slug: string
  config: {
    event: {
      title: string
      duration: number
      description?: string
    }
  }
}

export function NylasSchedulingManager() {
  const [pages, setPages] = useState<SchedulingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    description: '',
  })

  useEffect(() => {
    fetchSchedulingPages()
  }, [])

  const fetchSchedulingPages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/integrations/nylas/scheduling')
      const data = await response.json()
      if (data.success) {
        setPages(data.data.pages)
      }
    } catch (error) {
      console.error('Failed to fetch scheduling pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = async () => {
    try {
      const response = await fetch('/api/integrations/nylas/scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          duration: formData.duration,
          description: formData.description,
          available_days: [1, 2, 3, 4, 5], // Monday to Friday
          available_times: [{ start: '09:00', end: '17:00' }],
        }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchSchedulingPages()
        setShowCreateForm(false)
        setFormData({ name: '', duration: 30, description: '' })
      }
    } catch (error) {
      console.error('Failed to create scheduling page:', error)
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading scheduling pages...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduling Pages
            </CardTitle>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{page.name}</h3>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {page.config.event.duration}min
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {page.config.event.description && (
                  <p className="text-sm text-muted-foreground">
                    {page.config.event.description}
                  </p>
                )}
              </div>
            ))}
            {pages.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No scheduling pages created</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Scheduling Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="page-name">Page Name</Label>
              <Input
                id="page-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Onboarding Call"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting description..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreatePage}>Create Page</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}