import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { NewPasswordForm } from '@/components/auth/password-reset-form'
import { AuthLoadingSpinner } from '@/components/auth/auth-provider'

export const metadata: Metadata = {
  title: 'Reset Password | OnboardKit',
  description: 'Set your new OnboardKit account password.',
}

function ResetPasswordPageContent() {
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

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <NewPasswordForm />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLoadingSpinner />}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}