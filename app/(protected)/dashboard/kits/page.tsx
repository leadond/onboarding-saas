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
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import SuspenseWrapper from '@/components/suspense-wrapper'

interface Kit {
  id: string
  title: string
  description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  user_id: string
  creator_name?: string
  steps_count?: number
  clients_count?: number
}

function KitsPageComponent() {
  const [kits, setKits] = useState<Kit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/kits')
        
        if (!response.ok) {
          throw new Error('Failed to fetch kits')
        }

        const data = await response.json()
        if (data.success) {
          setKits(data.data || [])
        } else {
          throw new Error(data.error || 'Failed to load kits')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding Kits</h1>
          <p className="text-gray-600">
            Create and manage your client onboarding workflows
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/kits/new">Create New Kit</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Kits Grid */}
      {kits.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No kits created yet
            </h3>
            <p className="mb-6 text-gray-600">
              Create your first onboarding kit to get started.
            </p>
            <Button asChild>
              <Link href="/dashboard/kits/new">Create Your First Kit</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {kits.map((kit) => (
            <Card key={kit.id} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-gray-50/50 to-white">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                    kit.is_published
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    kit.is_published ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  {kit.is_published ? 'Live' : 'Draft'}
                </span>
              </div>

              {/* Header with gradient */}
              <div className="relative p-4 pb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-white text-lg font-bold">📋</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {kit.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {kit.description || 'Professional onboarding workflow designed to streamline client experience'}
                  </CardDescription>
                </div>
              </div>

              {/* Stats Section */}
              <div className="px-4 py-3 bg-gray-50/50 border-y border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{kit.steps_count || 0}</div>
                    <div className="text-xs text-gray-500 font-medium">Steps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{kit.clients_count || 0}</div>
                    <div className="text-xs text-gray-500 font-medium">Clients</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <CardContent className="p-4 pt-3">
                <div className="space-y-4">
                  {/* Creator & Date */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {(kit.creator_name || 'Admin').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{kit.creator_name || 'Admin'}</span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(kit.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="flex-1 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <Link href={`/dashboard/kits/${kit.id}`}>
                        <span className="text-sm font-medium">Configure</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild 
                      className="flex-1 border-green-200 hover:border-green-300 hover:bg-green-50 transition-all"
                    >
                      <Link href={`/dashboard/kits/${kit.id}/assign`}>
                        <span className="text-sm font-medium">Assign</span>
                      </Link>
                    </Button>
                    {kit.is_published && (
                      <Button 
                        size="sm" 
                        asChild 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md"
                      >
                        <Link href={`/kit/${kit.id}`}>
                          <span className="text-sm font-medium">Preview</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function KitsPage() {
  return (
    <SuspenseWrapper>
      <KitsPageComponent />
    </SuspenseWrapper>
  )
}