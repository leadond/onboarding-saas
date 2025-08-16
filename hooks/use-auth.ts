'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type {
  LoginFormData,
  SignupFormData,
  UserProfile,
} from '@/lib/validations/auth'

interface AuthState {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>
  signUp: (
    data: SignupFormData
  ) => Promise<{
    success: boolean
    error?: string
    requiresConfirmation?: boolean
  }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  signInWithOAuth: (
    provider: 'google' | 'azure'
  ) => Promise<{ success: boolean; error?: string }>
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>
  updatePassword: (
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
  clearError: () => void
}

type AuthHook = AuthState & AuthActions

export function useAuth(): AuthHook {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  const router = useRouter()
  const supabase = createClient()

  // Fetch user profile data
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        const response = await fetch('/api/user/profile', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          return data.user
        }
        return null
      } catch (error) {
        console.error('Error fetching user profile:', error)
        return null
      }
    },
    []
  )

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message,
            }))
          }
          return
        }

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          if (mounted) {
            setState({
              user: userProfile,
              session,
              loading: false,
              error: null,
            })
          }
        } else {
          if (mounted) {
            setState({
              user: null,
              session: null,
              loading: false,
              error: null,
            })
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error:
              error instanceof Error ? error.message : 'Authentication error',
          }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state changed:', event, session?.user?.id)

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        setState({
          user: userProfile,
          session,
          loading: false,
          error: null,
        })
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
          error: null,
        })
      }

      // Handle specific auth events
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, fetchUserProfile, router])

  // Sign in with email and password
  const signIn = useCallback(
    async (data: LoginFormData) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        })

        const result = await response.json()

        if (response.ok) {
          setState(prev => ({ ...prev, loading: false }))
          router.push('/dashboard')
          return { success: true }
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: result.error || 'Sign in failed',
          }))
          return { success: false, error: result.error || 'Sign in failed' }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Sign in failed'
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [router]
  )

  // Sign up with email and password
  const signUp = useCallback(
    async (data: SignupFormData) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        })

        const result = await response.json()

        if (response.ok) {
          setState(prev => ({ ...prev, loading: false }))

          if (result.requiresEmailConfirmation) {
            return {
              success: true,
              requiresConfirmation: true,
            }
          } else {
            router.push('/dashboard')
            return { success: true }
          }
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: result.error || 'Sign up failed',
          }))
          return { success: false, error: result.error || 'Sign up failed' }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Sign up failed'
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [router]
  )

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        setState({
          user: null,
          session: null,
          loading: false,
          error: null,
        })
        router.push('/login')
        return { success: true }
      } else {
        const result = await response.json()
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Sign out failed',
        }))
        return { success: false, error: result.error || 'Sign out failed' }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign out failed'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [router])

  // Sign in with OAuth
  const signInWithOAuth = useCallback(
    async (provider: 'google' | 'azure') => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        // Map azure to microsoft for Supabase
        const supabaseProvider = provider === 'azure' ? 'azure' : 'google'

        const { error } = await supabase.auth.signInWithOAuth({
          provider: supabaseProvider as any,
          options: {
            redirectTo: `${window.location.origin}/api/auth/callback?next=/test-dashboard`,
          },
        })

        if (error) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message,
          }))
          return { success: false, error: error.message }
        }

        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'OAuth sign in failed'
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [supabase.auth]
  )

  // Reset password
  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        setState(prev => ({ ...prev, loading: false }))

        if (error) {
          setState(prev => ({ ...prev, error: error.message }))
          return { success: false, error: error.message }
        }

        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Password reset failed'
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [supabase.auth]
  )

  // Update password
  const updatePassword = useCallback(
    async (password: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }))

        const { error } = await supabase.auth.updateUser({ password })

        setState(prev => ({ ...prev, loading: false }))

        if (error) {
          setState(prev => ({ ...prev, error: error.message }))
          return { success: false, error: error.message }
        }

        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Password update failed'
        setState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [supabase.auth]
  )

  // Refresh session
  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Error refreshing session:', error)
        return
      }

      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        setState(prev => ({
          ...prev,
          user: userProfile,
          session,
        }))
      }
    } catch (error) {
      console.error('Session refresh error:', error)
    }
  }, [supabase.auth, fetchUserProfile])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    refreshSession,
    clearError,
  }
}
