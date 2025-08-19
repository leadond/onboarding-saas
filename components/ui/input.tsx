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

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  success?: boolean
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, success, loading, ...props }, ref) => {
    return (
      <div className="relative">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-xl border-2 border-border/50 bg-background/50 px-4 py-3 text-sm backdrop-blur-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-10',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500/10',
              success && 'border-success-500 focus:border-success-500 focus:ring-success-500/10',
              loading && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {success && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success-600">
              ✓
            </div>
          )}
          {error && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-600">
              ⚠️
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-error-600 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
