import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { AuthLoadingSpinner } from '@/components/auth/auth-provider'

export const metadata: Metadata = {
  title: 'Sign Up | Onboard Hero',
  description:
    'Create your Onboard Hero account and start building amazing client onboarding experiences.',
}

function SignupPageContent() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
      
      {/* Color Line Separator - Top */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700"></div>
      
      {/* Left side - Branding */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-glow">
                <span className="text-2xl font-bold text-white">O</span>
              </div>
              <span className="text-3xl font-bold">Onboard Hero</span>
            </Link>

            {/* Color Line Separator */}
            <div className="w-24 h-1 bg-gradient-to-r from-white/50 to-white/20 rounded-full"></div>

            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight">
                Start creating amazing onboarding experiences
              </h1>
              <p className="text-xl leading-relaxed text-primary-100">
                Join thousands of businesses using Onboard Hero to streamline
                their client onboarding and increase satisfaction.
              </p>
            </div>

            {/* Color Line Separator */}
            <div className="w-16 h-1 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>

            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-400 shadow-glow">
                  <span className="text-success-900 text-lg">✓</span>
                </div>
                <span className="text-primary-100 text-lg font-medium">
                  Free 14-day trial included
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-400 shadow-glow">
                  <span className="text-success-900 text-lg">✓</span>
                </div>
                <span className="text-primary-100 text-lg font-medium">No credit card required</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-400 shadow-glow">
                  <span className="text-success-900 text-lg">✓</span>
                </div>
                <span className="text-primary-100 text-lg font-medium">
                  Setup in under 5 minutes
                </span>
              </div>
            </div>

            {/* Color Line Separator */}
            <div className="w-20 h-1 bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full"></div>

            {/* Social proof */}
            <div className="space-y-4">
              <p className="text-base text-primary-200 font-medium">
                Trusted by 2,500+ businesses
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-3 border-white bg-white/20 backdrop-blur-sm text-sm font-bold shadow-glow"
                    >
                      {String.fromCharCode(65 + i - 1)}
                    </div>
                  ))}
                </div>
                <div className="flex text-warning-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className="text-xl">⭐</span>
                  ))}
                </div>
                <span className="text-base text-primary-200 font-semibold">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Color Line Separator */}
      <div className="hidden lg:block w-1 bg-gradient-to-b from-primary-500 via-primary-600 to-primary-700"></div>

      {/* Right side - Signup form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-lg">
          <SignupForm />
        </div>
      </div>
      
      {/* Color Line Separator - Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500"></div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthLoadingSpinner />}>
      <SignupPageContent />
    </Suspense>
  )
}
