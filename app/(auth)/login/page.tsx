import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { AuthLoadingSpinner } from '@/components/auth/auth-provider'

export const metadata: Metadata = {
  title: 'Sign In | OnboardKit',
  description:
    'Sign in to your OnboardKit account to manage your client onboarding experiences.',
}

// Component to handle URL search params (like error messages)
function LoginPageContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Enhanced Branding */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 lg:flex lg:w-1/2">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-black/10" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            {/* Header */}
            <div className="space-y-8">
              <Link href="/" className="inline-flex items-center space-x-3 transition-opacity hover:opacity-80">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                  <span className="text-xl font-black text-blue-600">O</span>
                </div>
                <span className="text-3xl font-black">OnboardKit</span>
              </Link>

              <div className="space-y-6">
                <h1 className="text-5xl font-black leading-tight tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xl leading-relaxed text-blue-100 font-medium">
                  Continue building extraordinary client onboarding experiences that drive growth and satisfaction.
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-400 shadow-lg">
                  <svg className="h-4 w-4 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">
                  Streamline complex onboarding workflows
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 shadow-lg">
                  <svg className="h-4 w-4 text-emerald-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">
                  Boost client satisfaction & retention rates
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-400 shadow-lg">
                  <svg className="h-4 w-4 text-teal-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-white">
                  Automate repetitive tasks and save hours
                </span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-between pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-black text-white">10k+</div>
                <div className="text-sm font-medium text-blue-200">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">99.9%</div>
                <div className="text-sm font-medium text-blue-200">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">4.9★</div>
                <div className="text-sm font-medium text-blue-200">Rating</div>
              </div>
            </div>
          </div>

          {/* Enhanced decorative elements */}
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-32 translate-x-32 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-24 translate-y-24 rounded-full bg-gradient-to-tr from-white/10 to-transparent" />
          <div className="absolute top-1/2 right-1/4 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-gradient-to-bl from-white/5 to-transparent" />
        </div>

        {/* Right side - Enhanced Login form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-lg">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 lg:p-10">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoadingSpinner />}>
      <LoginPageContent />
    </Suspense>
  )
}
