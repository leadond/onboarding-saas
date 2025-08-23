'use client'

import { useState, useCallback } from 'react'

interface SignInData {
  email: string
  password: string
  remember?: boolean
}

interface SignInResult {
  success: boolean
  error?: string
  forcePasswordChange?: boolean
  redirectTo?: string
}

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async (data: SignInData): Promise<SignInResult> => {
    setLoading(true)
    setError(null)
    try {
      // Example API call to sign in
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      const result = await response.json()

      if (response.ok) {
        setLoading(false)
        return { success: true }
      } else if (response.status === 403 && result.forcePasswordChange) {
        setLoading(false)
        return { 
          success: false, 
          error: result.error,
          forcePasswordChange: true,
          redirectTo: result.redirectTo
        }
      } else {
        setLoading(false)
        setError(result.error || 'Sign in failed')
        return { success: false, error: result.error || 'Sign in failed' }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setLoading(false)
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    signIn,
    loading,
    error,
    clearError,
  }
}