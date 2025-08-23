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
  const { signIn, loading, error, clearError } = useAuth()
  
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
      form.setError('root', {
        type: 'manual',
        message: initialError,
      })
    }
  }, [initialError, form])

  const onSubmit = async (formData: LoginFormData) => {
    clearError()
    const result = await signIn(formData)

    if (result.success) {
      // Redirect to dashboard or specified location
      window.location.href = redirectTo || '/dashboard'
    } else if (result.forcePasswordChange) {
      // Redirect to password change page
      window.location.href = result.redirectTo || '/change-password'
    } else {
      form.setError('root', {
        type: 'manual',
        message: result.error || 'Sign in failed',
      })
    }
  }

  return (
    <div className={cn('w-full space-y-8', className)}>
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sign In
        </h1>
        <p className="text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 mb-2"
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
            className="block text-sm font-medium text-gray-900 mb-2"
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
            <label htmlFor="remember" className="text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {(error || form.formState.errors.root) && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <span className="text-red-500 mr-3 text-lg">⚠️</span>
              <p className="text-sm text-red-700 font-medium">
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
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Legal Links */}
      <div className="text-center space-y-2">
        <p className="text-xs text-gray-500 text-center">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}