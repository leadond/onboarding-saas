'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { trackLogin, trackTrialStart, trackDemoRequest } from '@/components/analytics'
import { AppLogo } from '@/components/branding/app-logo'


export default function LandingPage() {
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
        trackLogin('email')
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
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="flex min-h-screen">
        {/* Left Side - Content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            {/* Logo */}
            <div className="mb-8">
              <AppLogo size="3xl" layout="vertical" />
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
              <AppLogo size="2xl" layout="vertical" />
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

      {/* Features Section with H2 headings for SEO */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Why Choose Onboard Hero for Client Onboarding?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform transforms how businesses onboard clients, reducing churn and accelerating success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-700 p-8 rounded-xl border border-gray-600">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI-Powered Automation</h3>
              <p className="text-gray-300">
                Leverage artificial intelligence to automate repetitive onboarding tasks, reducing manual work by up to 80% and ensuring consistent client experiences.
              </p>
            </div>

            <div className="bg-gray-700 p-8 rounded-xl border border-gray-600">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Real-Time Progress Tracking</h3>
              <p className="text-gray-300">
                Monitor client progress in real-time with detailed analytics, identify bottlenecks early, and take proactive action to ensure successful onboarding.
              </p>
            </div>

            <div className="bg-gray-700 p-8 rounded-xl border border-gray-600">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Team Collaboration</h3>
              <p className="text-gray-300">
                Enable seamless collaboration between team members with role-based access, shared workflows, and integrated communication tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-white mb-6">
                Reduce Customer Churn with Smart Onboarding
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Poor onboarding experiences lead to 86% customer abandonment. Our platform ensures every client receives a personalized, efficient onboarding journey that drives success.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Automated Workflow Management</h3>
                    <p className="text-gray-300">Create custom onboarding workflows that automatically guide clients through each step, ensuring nothing falls through the cracks.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Personalized Client Experiences</h3>
                    <p className="text-gray-300">Tailor onboarding journeys based on client type, industry, and specific needs for maximum engagement and success rates.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Integration Ecosystem</h3>
                    <p className="text-gray-300">Connect with your existing tools and platforms to create a seamless onboarding experience across your entire tech stack.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-600">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Onboarding Success Metrics</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Completion Rate</span>
                  <span className="text-2xl font-bold text-emerald-400">94%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{width: '94%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Time to Value</span>
                  <span className="text-2xl font-bold text-cyan-400">3x Faster</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Client Satisfaction</span>
                  <span className="text-2xl font-bold text-orange-400">4.9/5</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '98%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-white mb-6">
            Ready to Transform Your Client Onboarding?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Join thousands of businesses that have reduced churn by 86% and accelerated client success with Onboard Hero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => trackTrialStart()}
              className="bg-white text-cyan-600 px-8 py-4 rounded-lg font-black text-lg hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </button>
            <button 
              onClick={() => trackDemoRequest()}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-black text-lg hover:bg-white hover:text-cyan-600 transition-colors"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Contextual Outbound Links Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Learn More About Client Onboarding Best Practices
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
              <h3 className="text-lg font-bold text-white mb-3">Industry Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a 
                    href="https://www.salesforce.com/resources/articles/customer-onboarding/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Salesforce Customer Onboarding Guide
                  </a>
                </li>
                <li>
                  <a 
                    href="https://blog.hubspot.com/service/what-does-it-mean-to-onboard-a-customer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    HubSpot's Customer Onboarding Best Practices
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.gainsight.com/customer-success/customer-onboarding/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Gainsight Customer Success Strategies
                  </a>
                </li>
              </ul>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg border border-gray-600">
              <h3 className="text-lg font-bold text-white mb-3">Research & Studies</h3>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a 
                    href="https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-three-building-blocks-of-successful-customer-onboarding" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    McKinsey on Customer Onboarding Success
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.forrester.com/report/the-state-of-customer-onboarding-2024/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Forrester's State of Customer Onboarding
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}