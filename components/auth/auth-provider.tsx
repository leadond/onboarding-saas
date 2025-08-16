'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/validations/auth'

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  initialSession?: Session | null
  requireAuth?: boolean
}

export function AuthProvider({
  children,
  initialSession = null,
  requireAuth = false,
}: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(initialSession)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Fetch user profile from our API
  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        return data.user
      }

      console.error('Failed to fetch user profile:', response.status)
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    if (!session?.user) {
      setUser(null)
      return
    }

    try {
      setError(null)
      const userProfile = await fetchUserProfile(session.user.id)
      setUser(userProfile)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to refresh user data'
      )
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call our signout API
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to sign out')
      }

      // Clear local state
      setUser(null)
      setSession(null)

      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth state and listen for changes
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          if (mounted) {
            setError(sessionError.message)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(currentSession)

          if (currentSession?.user) {
            const userProfile = await fetchUserProfile(currentSession.user.id)
            setUser(userProfile)
          } else {
            setUser(null)
          }

          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setError(
            error instanceof Error
              ? error.message
              : 'Authentication initialization failed'
          )
          setLoading(false)
        }
      }
    }

    // Initialize auth
    initializeAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return

      console.log('Auth state changed:', event, newSession?.user?.id)

      setSession(newSession)

      if (newSession?.user) {
        // User signed in or session refreshed
        const userProfile = await fetchUserProfile(newSession.user.id)
        setUser(userProfile)
        setError(null)
      } else {
        // User signed out
        setUser(null)

        // Redirect to login if auth is required and user is not on auth pages
        if (requireAuth && typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          const authPages = [
            '/login',
            '/signup',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
          ]

          if (!authPages.some(page => currentPath.startsWith(page))) {
            router.push('/login')
          }
        }
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, requireAuth, router])

  // Redirect unauthenticated users if auth is required
  useEffect(() => {
    if (!loading && requireAuth && !session && typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      const authPages = [
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
      ]

      if (!authPages.some(page => currentPath.startsWith(page))) {
        router.push('/login')
      }
    }
  }, [loading, requireAuth, session, router])

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signOut,
    refreshUser,
    isAuthenticated: !!session?.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthProvider requireAuth>
        <Component {...props} />
      </AuthProvider>
    )
  }
}

// Loading component for auth states
export function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    </div>
  )
}

// Error boundary for auth errors
interface AuthErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class AuthErrorBoundary extends React.Component<
  {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error }>
  },
  AuthErrorBoundaryState
> {
  constructor(props: {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error: Error }>
  }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth error boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback

      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} />
      }

      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-gray-600">{this.state.error.message}</p>
            <button
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
