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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="mb-8 inline-flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <span className="text-lg font-bold text-white">O</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">OnboardKit</span>
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white px-6 py-8 shadow sm:px-10">
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
