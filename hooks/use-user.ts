'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './use-auth'
import type {
  UserProfile,
  ProfileUpdateFormData,
  UpdatePasswordFormData,
} from '@/lib/validations/auth'

interface UserState {
  loading: boolean
  error: string | null
  updating: boolean
}

interface UserActions {
  updateProfile: (
    data: ProfileUpdateFormData
  ) => Promise<{ success: boolean; error?: string }>
  updatePassword: (
    data: UpdatePasswordFormData
  ) => Promise<{ success: boolean; error?: string }>
  uploadAvatar: (
    file: File
  ) => Promise<{ success: boolean; avatarUrl?: string; error?: string }>
  deleteAccount: () => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
  markOnboardingComplete: () => Promise<{ success: boolean; error?: string }>
  clearError: () => void
}

type UserHook = UserState &
  UserActions & {
    user: UserProfile | null
    isSubscribed: boolean
    isTrialActive: boolean
    daysUntilTrialExpiry: number | null
    subscriptionStatus: string | null
  }

export function useUser(): UserHook {
  const { user, refreshSession } = useAuth()
  const [state, setState] = useState<UserState>({
    loading: false,
    error: null,
    updating: false,
  })

  // Computed properties
  const isSubscribed = user?.subscriptionStatus === 'active'
  const isTrialActive = user?.trialEndsAt
    ? new Date(user.trialEndsAt) > new Date()
    : false

  const daysUntilTrialExpiry = user?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.trialEndsAt).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null

  // Update profile
  const updateProfile = useCallback(
    async (data: ProfileUpdateFormData) => {
      try {
        setState(prev => ({ ...prev, updating: true, error: null }))

        const response = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        })

        const result = await response.json()

        if (response.ok) {
          setState(prev => ({ ...prev, updating: false }))
          // Refresh the session to get updated user data
          await refreshSession()
          return { success: true }
        } else {
          setState(prev => ({
            ...prev,
            updating: false,
            error: result.error || 'Failed to update profile',
          }))
          return {
            success: false,
            error: result.error || 'Failed to update profile',
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update profile'
        setState(prev => ({ ...prev, updating: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [refreshSession]
  )

  // Update password
  const updatePassword = useCallback(async (data: UpdatePasswordFormData) => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }))

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      const result = await response.json()

      if (response.ok) {
        setState(prev => ({ ...prev, updating: false }))
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          updating: false,
          error: result.error || 'Failed to update password',
        }))
        return {
          success: false,
          error: result.error || 'Failed to update password',
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update password'
      setState(prev => ({ ...prev, updating: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Upload avatar
  const uploadAvatar = useCallback(
    async (file: File) => {
      try {
        setState(prev => ({ ...prev, updating: true, error: null }))

        // Validate file
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          setState(prev => ({
            ...prev,
            updating: false,
            error: 'File size must be less than 5MB',
          }))
          return { success: false, error: 'File size must be less than 5MB' }
        }

        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ]
        if (!allowedTypes.includes(file.type)) {
          setState(prev => ({
            ...prev,
            updating: false,
            error: 'Only JPEG, PNG, GIF, and WebP images are allowed',
          }))
          return {
            success: false,
            error: 'Only JPEG, PNG, GIF, and WebP images are allowed',
          }
        }

        // Create form data
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch('/api/user/avatar', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        })

        const result = await response.json()

        if (response.ok) {
          setState(prev => ({ ...prev, updating: false }))
          // Refresh the session to get updated user data
          await refreshSession()
          return { success: true, avatarUrl: result.avatarUrl }
        } else {
          setState(prev => ({
            ...prev,
            updating: false,
            error: result.error || 'Failed to upload avatar',
          }))
          return {
            success: false,
            error: result.error || 'Failed to upload avatar',
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload avatar'
        setState(prev => ({ ...prev, updating: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [refreshSession]
  )

  // Delete account
  const deleteAccount = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }))

      const response = await fetch('/api/user/profile', {
        method: 'DELETE',
        credentials: 'include',
      })

      const result = await response.json()

      if (response.ok) {
        setState(prev => ({ ...prev, updating: false }))
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          updating: false,
          error: result.error || 'Failed to delete account',
        }))
        return {
          success: false,
          error: result.error || 'Failed to delete account',
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete account'
      setState(prev => ({ ...prev, updating: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      await refreshSession()
      setState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh profile'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
    }
  }, [refreshSession])

  // Mark onboarding as complete
  const markOnboardingComplete = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }))

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
        credentials: 'include',
      })

      const result = await response.json()

      if (response.ok) {
        setState(prev => ({ ...prev, updating: false }))
        await refreshSession()
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          updating: false,
          error: result.error || 'Failed to complete onboarding',
        }))
        return {
          success: false,
          error: result.error || 'Failed to complete onboarding',
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to complete onboarding'
      setState(prev => ({ ...prev, updating: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [refreshSession])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Auto-refresh profile data when user changes
  useEffect(() => {
    if (user) {
      setState(prev => ({ ...prev, loading: false, error: null }))
    }
  }, [user])

  return {
    ...state,
    user,
    isSubscribed,
    isTrialActive,
    daysUntilTrialExpiry,
    subscriptionStatus: user?.subscriptionStatus || null,
    updateProfile,
    updatePassword,
    uploadAvatar,
    deleteAccount,
    refreshProfile,
    markOnboardingComplete,
    clearError,
  }
}

// Helper hook for checking user permissions
export function useUserPermissions() {
  const { user, isSubscribed, isTrialActive } = useUser()

  const canAccessFeature = useCallback(
    (feature: string) => {
      if (!user) return false

      // Free tier permissions
      const freeFeatures = ['basic_kits', 'basic_analytics', 'basic_support']

      // Paid tier permissions
      const paidFeatures = [
        'unlimited_kits',
        'advanced_analytics',
        'custom_branding',
        'integrations',
        'priority_support',
        'white_label',
      ]

      // Check if user has access based on subscription
      if (isSubscribed || isTrialActive) {
        return [...freeFeatures, ...paidFeatures].includes(feature)
      }

      return freeFeatures.includes(feature)
    },
    [user, isSubscribed, isTrialActive]
  )

  const getFeatureLimits = useCallback(() => {
    if (!user) return null

    if (isSubscribed || isTrialActive) {
      return {
        maxKits: user.subscriptionTier === 'enterprise' ? -1 : 50, // -1 = unlimited
        maxStepsPerKit: user.subscriptionTier === 'enterprise' ? -1 : 20,
        maxFileSize: 100 * 1024 * 1024, // 100MB
        maxStorageGB: user.subscriptionTier === 'enterprise' ? -1 : 10,
        customBranding: true,
        analytics: true,
        integrations: true,
      }
    }

    return {
      maxKits: 3,
      maxStepsPerKit: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxStorageGB: 1,
      customBranding: false,
      analytics: false,
      integrations: false,
    }
  }, [user, isSubscribed, isTrialActive])

  return {
    canAccessFeature,
    getFeatureLimits,
    isSubscribed,
    isTrialActive,
    user,
  }
}
