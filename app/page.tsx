/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { LogoIcon as Logo, WorkflowIcon as Workflow, ChartIcon as Chart, DocumentIcon as Document, BellIcon as Bell, UserIcon as User, UsersIcon as Users } from '@/components/icons'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-2xl shadow-glow">
                <Logo className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Professional Client Onboarding with{' '}
            <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              Onboard Hero
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-4xl text-xl text-muted-foreground leading-relaxed">
            Onboard Hero helps agencies and consultants create professional,
            step-by-step client onboarding workflows that delight customers and
            reduce churn.
          </p>
          <div className="flex flex-col gap-6 sm:flex-row">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'text-lg px-12 py-4 shadow-glow-lg hover:shadow-glow-lg hover:scale-105'
              )}
            >
              <span className="mr-2">🚀</span>
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="mb-20 text-center">
          <h2 className="mb-6 text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Everything You Need for Perfect Onboarding
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground leading-relaxed">
            Onboard Hero provides all the tools and features you need to create
            exceptional client onboarding experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Custom Workflows',
              description:
                'Create personalized onboarding journeys with our drag-and-drop workflow builder.',
              icon: <Workflow className="h-8 w-8" />,
              gradient: 'from-primary-500 to-primary-600',
              emoji: '🔄'
            },
            {
              title: 'Progress Tracking',
              description:
                'Monitor client progress in real-time with detailed analytics and reporting.',
              icon: <Chart className="h-8 w-8" />,
              gradient: 'from-success-500 to-success-600',
              emoji: '📊'
            },
            {
              title: 'Document Signing',
              description:
                'Collect signatures and approvals seamlessly with integrated e-signature tools.',
              icon: <Document className="h-8 w-8" />,
              gradient: 'from-warning-500 to-warning-600',
              emoji: '📝'
            },
            {
              title: 'Automated Reminders',
              description:
                'Keep clients engaged with smart, automated follow-ups and notifications.',
              icon: <Bell className="h-8 w-8" />,
              gradient: 'from-error-500 to-error-600',
              emoji: '🔔'
            },
            {
              title: 'Client Portal',
              description:
                'Provide clients with a secure portal to access their onboarding materials.',
              icon: <User className="h-8 w-8" />,
              gradient: 'from-secondary-500 to-secondary-600',
              emoji: '👤'
            },
            {
              title: 'Team Collaboration',
              description:
                'Enable seamless collaboration between team members and clients.',
              icon: <Users className="h-8 w-8" />,
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

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 p-12 text-center text-white shadow-strong md:p-16">
          <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          <div className="relative z-10">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-4xl">✨</span>
              </div>
            </div>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">Ready to Transform Your Onboarding?</h2>
            <p className="mb-10 text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of agencies already using Onboard Hero to create better
              client experiences.
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'secondary' }),
                'text-lg px-12 py-4 bg-white text-primary-600 hover:bg-primary-50 shadow-xl hover:shadow-2xl hover:scale-105'
              )}
            >
              <span className="mr-2">🚀</span>
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/80 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Logo className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-muted-foreground">&copy; 2024 Onboard Hero. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
