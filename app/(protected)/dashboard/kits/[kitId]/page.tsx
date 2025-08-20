'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Kit {
  id: string
  title: string
  description?: string
  is_published: boolean
  created_at: string
}

interface Assignment {
  id: string
  company_name: string
  assigned_at: string
  is_active: boolean
}

export default function KitDetailPage({ params }: { params: Promise<{ kitId: string }> }) {
  const { kitId } = React.use(params)
  const [kit, setKit] = useState<Kit | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKitData = async () => {
      try {
        const [kitRes, assignmentsRes] = await Promise.all([
          fetch(`/api/kits/${kitId}`),
          fetch(`/api/kits/${kitId}/assignments`)
        ])

        if (kitRes.ok) {
          const kitData = await kitRes.json()
          setKit(kitData.data)
        }

        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json()
          setAssignments(assignmentsData.data || [])
        }
      } catch (err) {
        setError('Failed to load kit data')
      } finally {
        setLoading(false)
      }
    }

    fetchKitData()
  }, [kitId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (!kit) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Kit Not Found</h1>
          <p className="text-gray-600 mt-2">The requested kit could not be found.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/kits">Back to Kits</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{kit.title}</h1>
          <p className="text-gray-600">{kit.description || 'No description provided'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/kits/${kit.id}/assign`}>Assign to Company</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/kits/${kit.id}/edit`}>Edit Kit</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Kit Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                  kit.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {kit.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(kit.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl">🏢</span>
                </div>
                <p className="text-gray-600 mb-4">No company assignments yet</p>
                <Button asChild size="sm">
                  <Link href={`/dashboard/kits/${kit.id}/assign`}>Assign to Company</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{assignment.company_name}</p>
                      <p className="text-sm text-gray-600">
                        Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assignment.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assignment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}