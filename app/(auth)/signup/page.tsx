import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { AuthLoadingSpinner } from '@/components/auth/auth-provider'

export const metadata: Metadata = {
  title: 'Sign Up | OnboardKit',
  description: 'Create your OnboardKit account and start building amazing client onboarding experiences.',
}

function SignupPageContent() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">O</span>
              </div>
              <span className="text-2xl font-bold">OnboardKit</span>
            </Link>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Start creating amazing onboarding experiences
              </h1>
              <p className="text-xl text-purple-100 leading-relaxed">
                Join thousands of businesses using OnboardKit to streamline their client onboarding and increase satisfaction.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-purple-100">Free 14-day trial included</span>
                {/* Add BETA tier info */}
                <div className="mt-2 text-yellow-300 font-semibold">
                  BETA Tier: Free access with 14-day trial
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-purple-100">No credit card required</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-purple-100">Setup in under 5 minutes</span>
              </div>
            </div>

            {/* Social proof */}
            <div className="space-y-3">
              <p className="text-sm text-purple-200">Trusted by 2,500+ businesses</p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-white/20 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                    >
                      {String.fromCharCode(65 + i - 1)}
                    </div>
                  ))}
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-purple-200 text-sm">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full" />
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </div>
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