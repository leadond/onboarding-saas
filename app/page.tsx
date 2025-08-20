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

import { LoginForm } from '@/components/auth/login-form'
import { getCurrentUser } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

// Force dynamic rendering to avoid static generation issues with cookies
export const dynamic = 'force-dynamic'

export default async function IndexPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Login */}
      <div className="min-h-screen flex">
        {/* Left Side - Marketing Content */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse" />
            <div className="absolute top-40 right-16 w-24 h-24 bg-white/5 rounded-full animate-bounce" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-32 left-16 w-20 h-20 bg-white/15 rounded-full animate-pulse" style={{animationDelay: '2s'}} />
            <div className="absolute bottom-20 right-32 w-16 h-16 bg-white/8 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
            <div className="max-w-md space-y-8">
              {/* Brand Message */}
              <div>
                <div className="text-5xl mb-4">🏆</div>
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  Professional Client
                  <br />
                  <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Onboarding
                  </span>
                </h1>
                <p className="text-xl text-purple-100 mb-6 leading-relaxed">
                  Create step-by-step workflows that delight customers and reduce churn.
                </p>
              </div>
              
              {/* Key Features */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold mb-4">✨ What You Get</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span className="text-purple-100">Custom Workflows</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span className="text-purple-100">Progress Tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span className="text-purple-100">Document Signing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span className="text-purple-100">Automated Reminders</span>
                  </div>
                </div>
              </div>
              
              {/* Social Proof */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">🚀</span>
                  <h3 className="text-lg font-semibold">Join Hundreds of Agencies</h3>
                </div>
                <p className="text-purple-100 leading-relaxed">
                  Already using Onboard Hero to create better client experiences and reduce churn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Features Section - Below the fold */}
      <div className="bg-gradient-to-br from-background via-primary-50/30 to-background py-24">
        <div className="container mx-auto px-4">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Everything You Need for Perfect Onboarding
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground leading-relaxed">
              Onboard Hero provides all the tools and features you need to create exceptional client onboarding experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Custom Workflows',
                description: 'Create personalized onboarding journeys with our drag-and-drop workflow builder.',
                gradient: 'from-primary-500 to-primary-600',
                emoji: '🔄'
              },
              {
                title: 'Progress Tracking',
                description: 'Monitor client progress in real-time with detailed analytics and reporting.',
                gradient: 'from-success-500 to-success-600',
                emoji: '📈'
              },
              {
                title: 'Document Signing',
                description: 'Collect signatures and approvals seamlessly with integrated e-signature tools.',
                gradient: 'from-warning-500 to-warning-600',
                emoji: '📝'
              },
              {
                title: 'Automated Reminders',
                description: 'Keep clients engaged with smart, automated follow-ups and notifications.',
                gradient: 'from-error-500 to-error-600',
                emoji: '🔔'
              },
              {
                title: 'Client Portal',
                description: 'Provide clients with a secure portal to access their onboarding materials.',
                gradient: 'from-secondary-500 to-secondary-600',
                emoji: '👤'
              },
              {
                title: 'Team Collaboration',
                description: 'Enable seamless collaboration between team members and clients.',
                gradient: 'from-primary-600 to-primary-700',
                emoji: '👥'
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                      <span className="text-2xl">{feature.emoji}</span>
                    </div>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}