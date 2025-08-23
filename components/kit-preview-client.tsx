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
import { KitPreview } from '@/components/kit-preview'

interface KitStep {
  id: string
  title: string
  description: string
  type: string
  order: number
}

interface Kit {
  id: string
  name: string
  title: string
  description: string
  welcome_message: string
  brand_color?: string
  logo_url?: string
  status: string
  configuration?: {
    steps: KitStep[]
  }
}

interface KitPreviewClientProps {
  kitId: string
  clientIdentifier?: string
  initialStepId?: string
}

export function KitPreviewClient({ kitId, clientIdentifier, initialStepId }: KitPreviewClientProps) {
  const [kit, setKit] = useState<Kit | null>(null)
  const [steps, setSteps] = useState<KitStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchKitData() {
      try {
        setLoading(true)
        const response = await fetch(`/api/kits/${kitId}`)
        
        if (!response.ok) {
          throw new Error('Kit not found')
        }

        const result = await response.json()
        
        if (!result.success || !result.data) {
          throw new Error('Kit not found')
        }

        const kitData = result.data
        const stepsData = kitData.configuration?.steps || []

        setKit(kitData)
        setSteps(stepsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load kit')
      } finally {
        setLoading(false)
      }
    }

    fetchKitData()
  }, [kitId])

  const generateClientIdentifier = (): string => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `client_${timestamp}_${random}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kit preview...</p>
        </div>
      </div>
    )
  }

  if (error || !kit) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kit Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The requested onboarding kit could not be found.'}
          </p>
          <a
            href="/dashboard/kits"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Kits
          </a>
        </div>
      </div>
    )
  }

  const finalClientIdentifier = clientIdentifier || generateClientIdentifier()

  return (
    <KitPreview
      kit={kit}
      steps={steps}
      clientIdentifier={finalClientIdentifier}
      initialStepId={initialStepId}
    />
  )
}