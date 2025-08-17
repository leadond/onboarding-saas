'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { signupSchema, type SignupFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils/cn'

interface SignupFormProps {
  className?: string
}

export function SignupForm({ className }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const { signUp, signInWithOAuth, loading, error, clearError } = useAuth()

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      companyName: '',
      agreeToTerms: false,
      subscribeToNewsletter: false,
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    clearError()
    const result = await signUp(data)

    if (result.success) {
      if (result.requiresConfirmation) {
        setSignupSuccess(true)
      }
      // If no confirmation required, redirect will happen automatically
    } else {
      form.setError('root', {
        type: 'manual',
        message: result.error || 'Sign up failed',
      })
    }
  }

  const handleOAuthSignUp = async (provider: 'google' | 'azure') => {
    clearError()
    const result = await signInWithOAuth(provider)

    if (!result.success) {
      form.setError('root', {
        type: 'manual',
        message: result.error || `${provider} sign up failed`,
      })
    }
  }

  if (signupSuccess) {
    return (
      <div className={cn('w-full max-w-md space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent you a confirmation link. Please check your email and
            click the link to activate your account.
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <button
            className="text-blue-600 underline hover:text-blue-500"
            onClick={() => setSignupSuccess(false)}
          >
            try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-lg space-y-8', className)}>
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Create an account
        </h1>
        <p className="text-base text-muted-foreground">
          Get started with your free Onboard Hero account
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignUp('google')}
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
          onClick={() => handleOAuthSignUp('azure')}
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="fullName"
            className="text-sm font-medium leading-none"
          >
            Full Name
          </label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            type="text"
            autoCapitalize="words"
            autoComplete="name"
            autoCorrect="off"
            disabled={loading}
            {...form.register('fullName')}
            className={cn(form.formState.errors.fullName && 'border-red-500')}
          />
          {form.formState.errors.fullName && (
            <p className="text-sm text-red-500">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-medium leading-none"
          >
            Company Name <span className="text-gray-400">(optional)</span>
          </label>
          <Input
            id="companyName"
            placeholder="Enter your company name"
            type="text"
            autoCapitalize="words"
            autoComplete="organization"
            autoCorrect="off"
            disabled={loading}
            {...form.register('companyName')}
            className={cn(
              form.formState.errors.companyName && 'border-red-500'
            )}
          />
          {form.formState.errors.companyName && (
            <p className="text-sm text-red-500">
              {form.formState.errors.companyName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="email"
            placeholder="Enter your email"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={loading}
            {...form.register('email')}
            className={cn(form.formState.errors.email && 'border-red-500')}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              placeholder="Create a password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={loading}
              {...form.register('password')}
              className={cn(
                form.formState.errors.password && 'border-red-500',
                'pr-10'
              )}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium leading-none"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              placeholder="Confirm your password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              disabled={loading}
              {...form.register('confirmPassword')}
              className={cn(
                form.formState.errors.confirmPassword && 'border-red-500',
                'pr-10'
              )}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <input
              id="agreeToTerms"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
              {...form.register('agreeToTerms')}
            />
            <label
              htmlFor="agreeToTerms"
              className="text-sm leading-5 text-gray-600"
            >
              I agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {form.formState.errors.agreeToTerms && (
            <p className="text-sm text-red-500">
              {form.formState.errors.agreeToTerms.message}
            </p>
          )}

          <div className="flex items-start space-x-2">
            <input
              id="subscribeToNewsletter"
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={loading}
              {...form.register('subscribeToNewsletter')}
            />
            <label
              htmlFor="subscribeToNewsletter"
              className="text-sm leading-5 text-gray-600"
            >
              Send me product updates and marketing emails
            </label>
          </div>
        </div>

        {(error || form.formState.errors.root) && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
              {error || form.formState.errors.root?.message}
            </p>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
