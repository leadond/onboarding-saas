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

interface Kit {
  id: string
  name: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  step_count: number
  created_at: string
  updated_at: string
}

interface ApiResponse {
  success: boolean
  data: Kit[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
  message?: string
  error?: string
}

export default function KitsPage() {
  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/kits')

        if (!response.ok) {
          throw new Error(`Failed to fetch kits: ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        if (data.success) {
          setKits(data.data)
        } else {
          throw new Error(data.error || 'API returned unsuccessful response')
        }
      } catch (err) {
        console.error('Error fetching kits:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch kits')
      } finally {
        setLoading(false)
      }
    }

    fetchKits()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Onboarding Kits</h1>
            <p className="text-gray-600">
              Create and manage your client onboarding workflows.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/kits/new">Create New Kit</Link>
          </Button>
        </div>
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-red-900">
            Error loading kits
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
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Kits</h1>
          <p className="text-gray-600">
            Create and manage your client onboarding workflows.
          </p>

        </div>
        <Button asChild>
          <Link href="/dashboard/kits/new">Create New Kit</Link>
        </Button>
      </div>

      {/* Kits Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kits.map(kit => (
          <Card
            key={kit.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{kit.name}</CardTitle>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    kit.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : kit.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {kit.status}
                </span>
              </div>
              <CardDescription>{kit.description || 'No description'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Steps:</span>
                  <span>{kit.step_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDate(kit.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span>{formatDate(kit.updated_at)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/kits/${kit.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/kits/${kit.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no kits) */}
      {kits.length === 0 && (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No kits yet
          </h3>
          <p className="mb-6 text-gray-600">
            Get started by creating your first onboarding kit.
          </p>
          <Button asChild>
            <Link href="/dashboard/kits/new">Create Your First Kit</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
