'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth'
import { cn } from '@/lib/utils/cn'

interface PasswordResetFormProps {
  className?: string
}

export function PasswordResetForm({ className }: PasswordResetFormProps) {
  const [resetSent, setResetSent] = useState(false)
  const { resetPassword, loading, error, clearError } = useAuth()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    clearError()
    const result = await resetPassword(data.email)

    if (result.success) {
      setResetSent(true)
    } else {
      form.setError('root', {
        type: 'manual',
        message: result.error || 'Failed to send reset email',
      })
    }
  }

  if (resetSent) {
    return (
      <div className={cn('w-full max-w-md space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-100 p-3">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to your email address. Please check
            your inbox and follow the instructions.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Didn&apos;t receive the email? Check your spam folder or wait a few
            minutes and try again.
          </p>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              onClick={() => setResetSent(false)}
              className="w-full"
            >
              Send another email
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-md space-y-6', className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Email
          </label>
          <Input
            id="email"
            placeholder="Enter your email address"
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
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link href="/login">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Button>
        </Link>
      </div>

      <div className="text-center text-sm text-gray-600">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

// Component for setting new password (used on reset-password page)
interface NewPasswordFormProps {
  className?: string
  onSuccess?: () => void
}

export function NewPasswordForm({
  className,
  onSuccess,
}: NewPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const { updatePassword, loading, error, clearError } = useAuth()

  const form = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(
      forgotPasswordSchema.extend({
        password: forgotPasswordSchema.shape.email, // Will be replaced with proper password schema
        confirmPassword: forgotPasswordSchema.shape.email,
      })
    ),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: {
    password: string
    confirmPassword: string
  }) => {
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      })
      return
    }

    clearError()
    const result = await updatePassword(data.password)

    if (result.success) {
      setResetSuccess(true)
      onSuccess?.()
    } else {
      form.setError('root', {
        type: 'manual',
        message: result.error || 'Failed to update password',
      })
    }
  }

  if (resetSuccess) {
    return (
      <div className={cn('w-full max-w-md space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Password updated
          </h1>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated. You can now sign in
            with your new password.
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full">Continue to login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-md space-y-6', className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none"
          >
            New Password
          </label>
          <div className="relative">
            <Input
              id="password"
              placeholder="Enter your new password"
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
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              placeholder="Confirm your new password"
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
              Updating password...
            </>
          ) : (
            'Update password'
          )}
        </Button>
      </form>
    </div>
  )
}
