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
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updatePasswordSchema, type UpdatePasswordFormData } from '@/lib/validations/auth'
import { cn } from '@/lib/utils/cn'

interface ChangePasswordPageProps {
  className?: string
}

export default function ChangePasswordPage({ className }: ChangePasswordPageProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRequired = searchParams.get('required') === 'true'
  
  const form = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onSubmit = async (data: UpdatePasswordFormData) => {
    try {
      setLoading(true)
      form.clearErrors()

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        form.setError('root', {
          type: 'manual',
          message: result.error || 'Failed to change password',
        })
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn('w-full max-w-md mx-auto space-y-8', className)}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Password Changed Successfully!</h1>
          <p className="text-base text-muted-foreground">
            Your password has been updated. Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-md mx-auto space-y-8', className)}>
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {isRequired ? 'Change Your Password' : 'Update Password'}
        </h1>
        <p className="text-base text-muted-foreground">
          {isRequired 
            ? 'For security reasons, you must change your temporary password before continuing.'
            : 'Enter your current password and choose a new one.'
          }
        </p>
        {isRequired && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              Password change is required to continue
            </p>
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground text-sm">🔒</span>
            </div>
            <Input
              {...form.register('currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter your current password"
              className="pl-10 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {form.formState.errors.currentPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground text-sm">🔑</span>
            </div>
            <Input
              {...form.register('newPassword')}
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              className="pl-10 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground text-sm">🔑</span>
            </div>
            <Input
              {...form.register('confirmNewPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              className="pl-10 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmNewPassword && (
            <p className="text-sm text-destructive">
              {form.formState.errors.confirmNewPassword.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {form.formState.errors.root && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing Password...
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>

      {/* Password Requirements */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Password Requirements:</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase and lowercase letters</li>
          <li>• Contains at least one number</li>
          <li>• Contains at least one special character</li>
        </ul>
      </div>
    </div>
  )
}