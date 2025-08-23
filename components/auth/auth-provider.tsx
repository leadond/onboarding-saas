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

import { createContext, useContext, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { SessionManager } from '@/lib/auth/session-manager'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    let sessionManager: SessionManager | null = null

    const initializeAuth = async () => {
      const supabaseClient = await getSupabaseClient()
      setSupabase(supabaseClient)
      
      const { data: { session } } = await supabaseClient.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        sessionManager = new SessionManager()
      }

      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null)
          setLoading(false)

          if (event === 'SIGNED_IN' && session?.user) {
            sessionManager = new SessionManager()
          } else if (event === 'SIGNED_OUT') {
            if (sessionManager) {
              sessionManager.destroy()
              sessionManager = null
            }
          }
        }
      )

      return () => {
        subscription.unsubscribe()
        if (sessionManager) {
          sessionManager.destroy()
        }
      }
    }

    initializeAuth()
  }, [])

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthLoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )
}