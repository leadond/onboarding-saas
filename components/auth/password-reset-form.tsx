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
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

interface PasswordResetFormProps {
  className?: string
}

export function PasswordResetForm({ className }: PasswordResetFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn('w-full space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Check your email
          </h2>
          <p className="text-sm text-muted-foreground">
            We've sent a password reset link to your email address.
            Please check your email and click the link to reset your password.
          </p>
        </div>
        <div className="text-sm text-gray-600">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            className="text-blue-600 underline hover:text-blue-500"
            onClick={() => setSuccess(false)}
          >
            try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
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

        {error && (
          <div className="rounded-xl border-2 border-error-200 bg-error-50/50 p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <span className="text-error-500 mr-3 text-lg">⚠️</span>
              <p className="text-sm text-error-700 font-medium">
                {error}
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
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>
    </div>
  )
}