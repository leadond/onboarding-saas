'use client'

import useSWR, { mutate } from 'swr'
import { useState, useEffect } from 'react'
import type {
  KitFormData,
  KitUpdateData,
  KitDuplicateData,
  KitPublishData,
  KitFilterQuery,
} from '@/lib/validations/kit'
import type { Database } from '@/lib/supabase/database.types'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

type Kit = Tables<'kits'> & {
  step_count?: number
  kit_steps?: Tables<'kit_steps'>[]
}

type KitsResponse = {
  success: boolean
  data: Kit[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

type KitResponse = {
  success: boolean
  data: Kit
}

// Helper function to build query string
const buildQueryString = (params: Partial<KitFilterQuery>): string => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        searchParams.set(key, value.join(','))
      } else {
        searchParams.set(key, String(value))
      }
    }
  })

  return searchParams.toString()
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Main useKits hook for listing kits with filtering and pagination
export function useKits(filters: Partial<KitFilterQuery> = {}) {
  const queryString = buildQueryString(filters)
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<KitsResponse>(
    `/api/kits${queryString ? `?${queryString}` : ''}`,
    fetcher
  )

  return {
    kits: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  }
}

// Hook for getting a single kit with steps
export function useKit(kitId: string | null) {
  const {
    data,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<KitResponse>(kitId ? `/api/kits/${kitId}` : null, fetcher)

  return {
    kit: data?.data || null,
    isLoading,
    error,
    refetch,
  }
}

// Hook for kit CRUD operations
export function useKitOperations() {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const createKit = async (kitData: KitFormData): Promise<Kit> => {
    setIsCreating(true)
    try {
      const response = await fetch('/api/kits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create kit')
      }

      const result = await response.json()

      // Invalidate kits list cache
      mutate('/api/kits')

      return result.data
    } catch (error) {
      console.error('Error creating kit:', error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const updateKit = async (
    kitId: string,
    kitData: Partial<KitUpdateData>
  ): Promise<Kit> => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/kits/${kitId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update kit')
      }

      const result = await response.json()

      // Invalidate caches
      mutate('/api/kits')
      mutate(`/api/kits/${kitId}`)

      return result.data
    } catch (error) {
      console.error('Error updating kit:', error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteKit = async (kitId: string): Promise<void> => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/kits/${kitId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete kit')
      }

      // Invalidate caches
      mutate('/api/kits')
      mutate(`/api/kits/${kitId}`, undefined, false)
    } catch (error) {
      console.error('Error deleting kit:', error)
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  const duplicateKit = async (
    kitId: string,
    duplicateData: KitDuplicateData
  ): Promise<Kit> => {
    setIsDuplicating(true)
    try {
      const response = await fetch(`/api/kits/${kitId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to duplicate kit')
      }

      const result = await response.json()

      // Invalidate kits list cache
      mutate('/api/kits')

      return result.data
    } catch (error) {
      console.error('Error duplicating kit:', error)
      throw error
    } finally {
      setIsDuplicating(false)
    }
  }

  const publishKit = async (
    kitId: string,
    publishData: KitPublishData
  ): Promise<Kit> => {
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/kits/${kitId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish kit')
      }

      const result = await response.json()

      // Invalidate caches
      mutate('/api/kits')
      mutate(`/api/kits/${kitId}`)

      return result.data
    } catch (error) {
      console.error('Error publishing kit:', error)
      throw error
    } finally {
      setIsPublishing(false)
    }
  }

  return {
    createKit,
    updateKit,
    deleteKit,
    duplicateKit,
    publishKit,
    isCreating,
    isUpdating,
    isDeleting,
    isDuplicating,
    isPublishing,
  }
}

// Hook for kit templates
export function useKitTemplates() {
  const { data, error, isLoading } = useSWR<KitsResponse>(
    '/api/kits?is_template=true',
    fetcher
  )

  return {
    templates: data?.data || [],
    isLoading,
    error,
  }
}

// Hook for kit search with debouncing
export function useKitSearch(initialFilters: Partial<KitFilterQuery> = {}) {
  const [filters, setFilters] =
    useState<Partial<KitFilterQuery>>(initialFilters)
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  // Debounce search filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  const { kits, pagination, isLoading, error, refetch } =
    useKits(debouncedFilters)

  const updateFilters = (newFilters: Partial<KitFilterQuery>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  return {
    kits,
    pagination,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch,
  }
}

// Export types for use in components
export type { Kit, KitsResponse, KitResponse }
