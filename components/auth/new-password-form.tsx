'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

interface NewPasswordFormProps {
  className?: string
}

export function NewPasswordForm({ className }: NewPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
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
            Password Updated
          </h2>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully updated. You will be redirected to your dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-foreground"
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

        <div className="space-y-3">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-foreground"
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
              icon="🔒"
              error={form.formState.errors.confirmPassword?.message}
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
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