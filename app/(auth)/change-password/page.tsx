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

import { Suspense } from 'react'
import Link from 'next/link'
import { NewPasswordForm } from '@/components/auth/new-password-form'
import { AuthLoadingSpinner } from '@/components/auth/auth-provider'

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Password Change Required
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            For security reasons, you must change your password before continuing.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Form */}
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <Suspense fallback={<AuthLoadingSpinner />}>
            <NewPasswordForm />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}