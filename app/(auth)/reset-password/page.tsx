/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { NewPasswordForm } from '@/components/auth/new-password-form'
import { LogoIcon as Logo, ChevronLeftIcon as ChevronLeft } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Reset Password | Onboard Hero',
  description: 'Set a new password for your Onboard Hero account.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
      
      {/* Color Line Separator - Top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700"></div>
      
      <div className="container flex h-screen w-screen flex-col items-center justify-center relative z-10">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: 'glass' }),
            'absolute left-4 top-4 md:left-8 md:top-8 backdrop-blur-md'
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[420px]">
          {/* Header Section */}
          <div className="relative">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-2xl shadow-glow">
                  <Logo className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Set New Password
              </h1>
              <p className="text-base text-muted-foreground">
                Enter your new password below
              </p>
            </div>
            
            {/* Color Line Separator */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"></div>
          </div>
          
          {/* Reset Form Section */}
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-strong p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-transparent"></div>
            <div className="relative z-10">
              <Suspense fallback={<div className="text-center">Loading...</div>}>
                <NewPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      
      {/* Color Line Separator - Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500"></div>
    </div>
  )
}