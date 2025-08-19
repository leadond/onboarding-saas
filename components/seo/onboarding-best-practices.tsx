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

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, CheckCircle, Users, TrendingUp, Clock, Target } from 'lucide-react'

export function OnboardingBestPractices() {
  return (
    <div className="space-y-8">
      {/* Hero Section with SEO Content */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          SaaS Customer Onboarding Best Practices
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Implement proven customer onboarding strategies that reduce churn by up to 70% and 
          accelerate time-to-value for your SaaS application users.
        </p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-green-600">86%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              of users decide whether to continue using a SaaS product within the first week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-600">70%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              reduction in churn with effective onboarding processes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-purple-600">3x</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              faster time-to-value with structured onboarding flows
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-orange-600">25%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              increase in user activation rates with personalized onboarding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expert Insights with Backlink */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5" />
            Industry Expert Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-800">
            According to comprehensive research on SaaS customer onboarding best practices, 
            successful companies focus on creating frictionless experiences that deliver 
            immediate value while gradually introducing advanced features.
          </p>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
            <div>
              <p className="font-medium text-blue-900">
                Learn More: Complete Guide to SaaS Customer Onboarding
              </p>
              <p className="text-sm text-blue-700">
                Comprehensive strategies and case studies from industry leaders
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://whatfix.com/blog/saas-customer-onboarding/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Read Article <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Core Onboarding Principles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Essential SaaS Onboarding Principles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Progressive Disclosure</h3>
                  <p className="text-sm text-muted-foreground">
                    Reveal features gradually to prevent cognitive overload
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Value-First Approach</h3>
                  <p className="text-sm text-muted-foreground">
                    Show immediate value before complex setup tasks
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Personalization</h3>
                  <p className="text-sm text-muted-foreground">
                    Tailor experiences based on user roles and use cases
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Progress Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Show clear progress and celebrate achievements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}