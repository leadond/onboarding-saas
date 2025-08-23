import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Check, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLoadingSpinner } from '@/components/auth/auth-provider'

export const metadata: Metadata = {
  title: 'Verify Email | OnboardKit',
  description: 'Verify your email address to complete your OnboardKit account setup.',
}

function VerifyEmailPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">OnboardKit</span>
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                Check your email
              </h1>
              <p className="text-sm text-gray-600">
                We've sent a verification link to your email address. Please click the link in the email to verify your account and complete your registration.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      What happens next?
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Check your email inbox (including spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>You'll be automatically signed in to your account</li>
                        <li>Complete your profile setup</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  Didn't receive the email? Check your spam folder or{' '}
                  <button className="text-blue-600 hover:text-blue-500 underline">
                    resend verification email
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Link href="/login">
              <Button className="w-full max-w-xs">
                Continue to Login
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Need help?{' '}
              <Link
                href="/support"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthLoadingSpinner />}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}