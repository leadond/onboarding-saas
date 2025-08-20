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
  const { signUp, loading, error, clearError } = useAuth()

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
