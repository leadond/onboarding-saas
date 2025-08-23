'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn({ 
        email, 
        password, 
        remember: rememberMe 
      })
      
      if (result?.forcePasswordChange) {
        router.push('/change-password?required=true')
        return
      }
      
      if (result?.success) {
        // Redirect to dashboard or other page after successful login
        router.push('/dashboard')
      } else {
        setError(result?.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex flex-col items-center space-y-0">
              <div className="w-20 h-20 flex items-center justify-center">
                <svg 
                  className="w-16 h-16 text-cyan-400" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  style={{
                    filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
                  }}
                >
                  <path d="M13 3L4 14h6v7l9-11h-6V3z"/>
                </svg>
              </div>
              <div className="text-center -space-y-1">
                <h1 
                  className="text-2xl font-bold text-white"
                  style={{
                    filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
                  }}
                >
                  Onboard Hero
                </h1>
                <p 
                  className="text-cyan-300 text-sm font-medium"
                  style={{
                    filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
                  }}
                >
                  AI-Powered Automation
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl lg:text-7xl font-black leading-tight mb-6 text-white tracking-tight">
                End Client
                <br/>
                <span className="text-white font-black">Onboarding</span>
                <br/>
                <span className="text-white font-black">Chaos</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed font-medium">
                Transform your client onboarding with AI-powered automation. Eliminate manual bottlenecks 
                and create seamless journeys that convert 3x faster.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-black text-cyan-300 drop-shadow-sm">86%</div>
                <div className="text-white text-sm">
                  <div className="font-bold drop-shadow-sm">Customer Abandonment</div>
                  <div className="text-white/80 font-medium">Due to poor onboarding</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-black text-orange-300 drop-shadow-sm">$29M</div>
                <div className="text-white text-sm">
                  <div className="font-bold drop-shadow-sm">Annual Churn Cost</div>
                  <div className="text-white/80 font-medium">Enterprise average</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-black text-emerald-300 drop-shadow-sm">3x</div>
                <div className="text-white text-sm">
                  <div className="font-bold drop-shadow-sm">Faster Conversion</div>
                  <div className="text-white/80 font-medium">With our platform</div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-800">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <div className="flex flex-col items-center space-y-0 mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <svg 
                  className="w-12 h-12 text-cyan-400" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  style={{
                    filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
                  }}
                >
                  <path d="M13 3L4 14h6v7l9-11h-6V3z"/>
                </svg>
              </div>
              <div className="text-center -space-y-1">
                <h1 
                  className="text-lg font-bold text-white"
                  style={{
                    filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
                  }}
                >
                  Onboard Hero
                </h1>
                <p 
                  className="text-cyan-300 text-xs font-medium"
                  style={{
                    filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 1)) drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))'
                  }}
                >
                  AI-Powered Automation
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-gray-700 rounded-2xl shadow-xl border border-gray-600 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome back</h2>
              <p className="text-gray-300 font-medium">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white text-black placeholder-gray-400 font-medium"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white text-black placeholder-gray-400 pr-12 font-medium"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 border-gray-500 rounded focus:ring-cyan-500 bg-gray-600"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-300 font-medium">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 font-bold">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 px-4 rounded-lg font-black tracking-wide hover:from-cyan-700 hover:to-blue-700 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-black tracking-wide">SIGNING IN...</span>
                  </div>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300 font-medium">
                Don't have an account?{' '}
                <a href="#" className="text-cyan-400 hover:text-cyan-300 font-bold">
                  Start your free trial
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-400">
            <p className="font-medium">© 2024 Onboard Hero. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-gray-200 font-medium">Privacy Policy</a>
              <a href="#" className="hover:text-gray-200 font-medium">Terms of Service</a>
              <a href="#" className="hover:text-gray-200 font-medium">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}