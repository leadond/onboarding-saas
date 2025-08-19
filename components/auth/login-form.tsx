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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils/cn'

interface LoginFormProps {
  className?: string
  redirectTo?: string
  initialError?: string
}

export function LoginForm({ className, redirectTo, initialError }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, signInWithOAuth, loading, error, clearError } = useAuth()
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  // Set initial error if provided
  useEffect(() => {
    if (initialError) {
      // Set the error in the form state
      form.setError('root', {
        type: 'manual',
        message: initialError,
      })
    }
  }, [initialError, form])

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    const result = await signIn(data)

    if (!result.success) {
      form.setError('root', {
        type: 'manual',
        message: result.error || 'Sign in failed',
      })
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'azure') => {
    clearError()
    const result = await signInWithOAuth(provider)

    if (!result.success) {
      form.setError('root', {
        type: 'manual',
        message: result.error || `${provider} sign in failed`,
      })
    }
  }

  return (
    <div className={cn('w-full space-y-8', className)}>
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Sign in to your account
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Welcome back! Please enter your details to continue.
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading}
          className="w-full h-14 text-base font-medium"
        >
          {loading ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn('azure')}
          disabled={loading}
          className="w-full h-14 text-base font-medium"
        >
          {loading ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#00BCF2" d="M0 0h11.377v11.372H0z" />
              <path fill="#0078D4" d="M12.623 0H24v11.372H12.623z" />
              <path fill="#00BCF2" d="M0 12.623h11.377V24H0z" />
              <path fill="#FFB900" d="M12.623 12.623H24V24H12.623z" />
            </svg>
          )}
          Continue with Microsoft
        </Button>
      </div>

      {/* Color Line Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-6 text-muted-foreground font-medium">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-foreground"
          >
            Email address
          </label>
          <Input
            id="email"
            placeholder="Enter your email address"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={loading}
            icon="📧"
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
        </div>

        <div className="space-y-3">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={loading}
              icon="🔒"
              error={form.formState.errors.password?.message}
              {...form.register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Color Line Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500 focus:ring-2"
              disabled={loading}
              {...form.register('remember')}
            />
            <label htmlFor="remember" className="text-sm font-medium text-foreground">
              Remember me for 30 days
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {(error || form.formState.errors.root) && (
          <div className="rounded-xl border-2 border-error-200 bg-error-50/50 p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <span className="text-error-500 mr-3 text-lg">⚠️</span>
              <p className="text-sm text-error-700 font-medium">
                {error || form.formState.errors.root?.message}
              </p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-base font-semibold shadow-glow"
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in to your account'
          )}
        </Button>
      </form>

      {/* Color Line Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary-200 to-transparent"></div>

      <div className="text-center">
        <p className="text-base text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Create one now
          </Link>
        </p>
      </div>

      {/* Security notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground/80 flex items-center justify-center gap-2">
          <span>🔒</span>
          Protected by industry-standard security. Your data is encrypted and secure.
        </p>
      </div>
    </div>
  )
}
