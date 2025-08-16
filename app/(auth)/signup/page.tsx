import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'
import { AuthLoadingSpinner } from '@/components/auth/auth-provider'

export const metadata: Metadata = {
  title: 'Sign Up | OnboardKit',
  description:
    'Create your OnboardKit account and start building amazing client onboarding experiences.',
}

function SignupPageContent() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
                <span className="text-lg font-bold text-purple-600">O</span>
              </div>
              <span className="text-2xl font-bold">OnboardKit</span>
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Start creating amazing onboarding experiences
              </h1>
              <p className="text-xl leading-relaxed text-purple-100">
                Join thousands of businesses using OnboardKit to streamline
                their client onboarding and increase satisfaction.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
                  <svg
                    className="h-3 w-3 text-yellow-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-purple-100">
                  Free 14-day trial included
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
                  <svg
                    className="h-3 w-3 text-yellow-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-purple-100">No credit card required</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400">
                  <svg
                    className="h-3 w-3 text-yellow-900"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-purple-100">
                  Setup in under 5 minutes
                </span>
              </div>
            </div>

            {/* Social proof */}
            <div className="space-y-3">
              <p className="text-sm text-purple-200">
                Trusted by 2,500+ businesses
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white/20 text-xs font-medium"
                    >
                      {String.fromCharCode(65 + i - 1)}
                    </div>
                  ))}
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-purple-200">4.9/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-20 translate-x-20 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-16 translate-y-16 rounded-full bg-white/10" />
        <div className="absolute right-1/4 top-1/2 h-16 w-16 rounded-full bg-white/5" />
      </div>

      {/* Right side - Signup form */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
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
