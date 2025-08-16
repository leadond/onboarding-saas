'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface ProgressUpdate {
  id: string
  kit_id: string
  client_identifier: string
  step_id: string
  completed: boolean
  started_at: string | null
  completed_at: string | null
  time_spent_seconds: number | null
  updated_at: string
  // Additional computed fields
  client_name?: string
  step_title?: string
  kit_name?: string
}

interface ClientSummary {
  client_identifier: string
  client_name?: string
  kit_id: string
  kit_name?: string
  total_steps: number
  completed_steps: number
  completion_percentage: number
  last_activity: string
  status: 'not_started' | 'in_progress' | 'completed' | 'stuck'
}

interface RealtimeProgressState {
  progressUpdates: ProgressUpdate[]
  clientSummaries: ClientSummary[]
  isConnected: boolean
  lastUpdate: string | null
  error: string | null
}

interface UseRealtimeProgressOptions {
  kitId?: string
  clientIdentifier?: string
  onProgressUpdate?: (update: ProgressUpdate) => void
  onClientComplete?: (clientSummary: ClientSummary) => void
  onClientStuck?: (clientSummary: ClientSummary) => void
  enabled?: boolean
}

export function useRealtimeProgress({
  kitId,
  clientIdentifier,
  onProgressUpdate,
  onClientComplete,
  onClientStuck,
  enabled = true,
}: UseRealtimeProgressOptions = {}) {
  const [state, setState] = useState<RealtimeProgressState>({
    progressUpdates: [],
    clientSummaries: [],
    isConnected: false,
    lastUpdate: null,
    error: null,
  })

  const supabase = createClient()

  // Calculate client summaries from progress updates
  const calculateClientSummaries = useCallback(
    (updates: ProgressUpdate[]): ClientSummary[] => {
      const clientMap = new Map<string, ClientSummary>()

      updates.forEach(update => {
        const key = `${update.client_identifier}_${update.kit_id}`

        if (!clientMap.has(key)) {
          clientMap.set(key, {
            client_identifier: update.client_identifier,
            client_name: update.client_name,
            kit_id: update.kit_id,
            kit_name: update.kit_name,
            total_steps: 0,
            completed_steps: 0,
            completion_percentage: 0,
            last_activity: update.updated_at,
            status: 'not_started',
          })
        }

        const client = clientMap.get(key)!
        client.total_steps++

        if (update.completed) {
          client.completed_steps++
        }

        // Update last activity if this update is more recent
        if (new Date(update.updated_at) > new Date(client.last_activity)) {
          client.last_activity = update.updated_at
        }
      })

      // Calculate final metrics and status
      return Array.from(clientMap.values()).map(client => {
        client.completion_percentage =
          client.total_steps > 0
            ? Math.round((client.completed_steps / client.total_steps) * 100)
            : 0

        // Determine status
        if (client.completion_percentage === 100) {
          client.status = 'completed'
        } else if (client.completion_percentage > 0) {
          const daysSinceActivity = Math.floor(
            (Date.now() - new Date(client.last_activity).getTime()) /
              (1000 * 60 * 60 * 24)
          )
          client.status = daysSinceActivity > 3 ? 'stuck' : 'in_progress'
        } else {
          client.status = 'not_started'
        }

        return client
      })
    },
    []
  )

  // Handle real-time updates
  const handleProgressUpdate = useCallback(
    (payload: any) => {
      console.log('Real-time progress update:', payload)

      const update: ProgressUpdate = {
        ...payload.new,
        client_name:
          payload.new.client_name ||
          `Client ${payload.new.client_identifier.substring(0, 8)}`,
        step_title: payload.new.step_title || 'Unknown Step',
        kit_name: payload.new.kit_name || 'Unknown Kit',
      }

      setState(prevState => {
        const newProgressUpdates = [...prevState.progressUpdates]

        // Update or add the progress record
        const existingIndex = newProgressUpdates.findIndex(
          p => p.id === update.id
        )

        if (existingIndex >= 0) {
          newProgressUpdates[existingIndex] = update
        } else {
          newProgressUpdates.push(update)
        }

        // Recalculate client summaries
        const newClientSummaries = calculateClientSummaries(newProgressUpdates)

        return {
          ...prevState,
          progressUpdates: newProgressUpdates,
          clientSummaries: newClientSummaries,
          lastUpdate: new Date().toISOString(),
          error: null,
        }
      })

      // Call progress update callback
      onProgressUpdate?.(update)

      // Check if client just completed
      setTimeout(() => {
        setState(currentState => {
          const clientSummary = currentState.clientSummaries.find(
            c =>
              c.client_identifier === update.client_identifier &&
              c.kit_id === update.kit_id
          )

          if (clientSummary) {
            if (clientSummary.status === 'completed' && update.completed) {
              onClientComplete?.(clientSummary)
            } else if (clientSummary.status === 'stuck') {
              onClientStuck?.(clientSummary)
            }
          }

          return currentState
        })
      }, 100)
    },
    [
      calculateClientSummaries,
      onProgressUpdate,
      onClientComplete,
      onClientStuck,
    ]
  )

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      let query = supabase
        .from('client_progress')
        .select(
          `
          *,
          kits!inner(name),
          kit_steps!inner(title)
        `
        )
        .order('updated_at', { ascending: false })

      if (kitId) {
        query = query.eq('kit_id', kitId)
      }

      if (clientIdentifier) {
        query = query.eq('client_identifier', clientIdentifier)
      }

      const { data, error } = await query

      if (error) {
        setState(prev => ({ ...prev, error: error.message }))
        return
      }

      const progressUpdates: ProgressUpdate[] = (data || []).map(
        (item: any) => ({
          ...item,
          client_name:
            item.client_name ||
            `Client ${item.client_identifier.substring(0, 8)}`,
          step_title: item.kit_steps?.title || 'Unknown Step',
          kit_name: item.kits?.name || 'Unknown Kit',
        })
      )

      const clientSummaries = calculateClientSummaries(progressUpdates)

      setState(prev => ({
        ...prev,
        progressUpdates,
        clientSummaries,
        error: null,
      }))
    } catch (error) {
      console.error('Failed to load initial progress data:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }))
    }
  }, [supabase, kitId, clientIdentifier, calculateClientSummaries])

  // Set up real-time subscription
  useEffect(() => {
    if (!enabled) return

    let channel: RealtimeChannel

    const setupSubscription = async () => {
      // Load initial data
      await loadInitialData()

      // Set up real-time subscription
      let channelName = 'client_progress_updates'
      if (kitId) channelName += `_${kitId}`
      if (clientIdentifier) channelName += `_${clientIdentifier}`

      channel = supabase.channel(channelName)

      // Subscribe to client_progress table changes
      const subscriptionConfig: any = {
        event: '*',
        schema: 'public',
        table: 'client_progress',
      }

      // Add filters if specified
      if (kitId) {
        subscriptionConfig.filter = `kit_id=eq.${kitId}`
      }

      if (clientIdentifier) {
        const existingFilter = subscriptionConfig.filter || ''
        subscriptionConfig.filter = existingFilter
          ? `${existingFilter},client_identifier=eq.${clientIdentifier}`
          : `client_identifier=eq.${clientIdentifier}`
      }

      channel.on('postgres_changes', subscriptionConfig, handleProgressUpdate)

      channel.subscribe(status => {
        console.log('Real-time subscription status:', status)
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'CLOSED' ? 'Connection closed' : null,
        }))
      })
    }

    setupSubscription()

    return () => {
      if (channel) {
        console.log('Unsubscribing from real-time updates')
        supabase.removeChannel(channel)
      }
    }
  }, [
    enabled,
    kitId,
    clientIdentifier,
    handleProgressUpdate,
    loadInitialData,
    supabase,
  ])

  // Manual refresh function
  const refresh = useCallback(async () => {
    await loadInitialData()
  }, [loadInitialData])

  // Get specific client summary
  const getClientSummary = useCallback(
    (identifier: string, kitId?: string) => {
      return state.clientSummaries.find(
        client =>
          client.client_identifier === identifier &&
          (!kitId || client.kit_id === kitId)
      )
    },
    [state.clientSummaries]
  )

  // Get progress for specific client
  const getClientProgress = useCallback(
    (identifier: string, kitId?: string) => {
      return state.progressUpdates.filter(
        update =>
          update.client_identifier === identifier &&
          (!kitId || update.kit_id === kitId)
      )
    },
    [state.progressUpdates]
  )

  return {
    // State
    ...state,

    // Actions
    refresh,
    getClientSummary,
    getClientProgress,

    // Computed values
    totalClients: state.clientSummaries.length,
    activeClients: state.clientSummaries.filter(c => c.status === 'in_progress')
      .length,
    completedClients: state.clientSummaries.filter(
      c => c.status === 'completed'
    ).length,
    stuckClients: state.clientSummaries.filter(c => c.status === 'stuck')
      .length,

    // Recent updates (last 10)
    recentUpdates: state.progressUpdates
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 10),
  }
}

export default useRealtimeProgress
