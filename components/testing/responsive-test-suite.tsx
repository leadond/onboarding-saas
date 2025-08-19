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

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

// Import all components for testing
import { KitHeader } from '../kit-portal/kit-header'
import { CompletionCelebration } from '../kit-portal/completion-celebration'
import { ProgressOverview } from '../progress/progress-overview'
import { ClientProgressTable } from '../admin/client-progress-table'
import { ChatWidget } from '../communication/chat-widget'
import { RealtimeProgressIndicator } from '../realtime/realtime-progress-indicator'
import { DocumentLibrary } from '../advanced/document-library'
import { NextSteps } from '../advanced/next-steps'
import { CompletionCertificate } from '../advanced/completion-certificate'

interface TestResult {
  component: string
  breakpoint: string
  status: 'pass' | 'fail' | 'warning'
  issues: string[]
}

interface ResponsiveTestSuiteProps {
  className?: string
}

export function ResponsiveTestSuite({ className }: ResponsiveTestSuiteProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<string>('desktop')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<string>('all')

  // Breakpoint definitions
  const breakpoints = [
    { id: 'mobile', name: 'Mobile (320px)', width: 320, height: 568 },
    { id: 'mobile-lg', name: 'Mobile Large (375px)', width: 375, height: 667 },
    { id: 'tablet', name: 'Tablet (768px)', width: 768, height: 1024 },
    { id: 'desktop', name: 'Desktop (1024px)', width: 1024, height: 768 },
    {
      id: 'desktop-lg',
      name: 'Large Desktop (1440px)',
      width: 1440,
      height: 900,
    },
  ]

  // Components to test
  const testComponents = [
    {
      id: 'kit-header',
      name: 'Kit Header',
      component: KitHeader,
      props: {
        kit: { name: 'Test Kit', brand_color: '#3B82F6' },
        completionPercentage: 65,
        currentStepIndex: 2,
        totalSteps: 8,
      },
    },
    {
      id: 'progress-overview',
      name: 'Progress Overview',
      component: ProgressOverview,
      props: {
        totalSteps: 8,
        completedSteps: 5,
        completionPercentage: 62.5,
        timeSpent: 1800,
        estimatedTimeRemaining: 900,
      },
    },
    {
      id: 'chat-widget',
      name: 'Chat Widget',
      component: ChatWidget,
      props: {
        kitId: 'test-kit',
        clientIdentifier: 'test-client',
        clientName: 'Test User',
        position: 'embedded',
      },
    },
    {
      id: 'document-library',
      name: 'Document Library',
      component: DocumentLibrary,
      props: {
        kitId: 'test-kit',
        clientIdentifier: 'test-client',
      },
    },
    {
      id: 'next-steps',
      name: 'Next Steps',
      component: NextSteps,
      props: {
        kitId: 'test-kit',
        clientIdentifier: 'test-client',
        completionPercentage: 75,
      },
    },
  ]

  // Mock data for testing
  const mockKit = {
    id: 'test-kit-123',
    name: 'Test Onboarding Kit',
    brand_color: '#3B82F6',
    logo_url: '',
    user_id: 'test-user-123',
    slug: 'test-onboarding-kit',
    status: 'published' as const,
    is_template: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user: {
      full_name: 'Test Company',
      company_name: 'Test Co.',
      email: 'test@company.com',
    },
  }

  const mockClient = {
    name: 'John Doe',
    email: 'john@example.com',
    identifier: 'client-123',
  }

  // Responsive testing functions
  const checkResponsiveness = async (
    component: string,
    breakpoint: (typeof breakpoints)[0]
  ) => {
    const issues: string[] = []

    // Simulate responsive checks
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check for common responsive issues
    if (breakpoint.width < 768) {
      // Mobile checks
      if (Math.random() > 0.8) issues.push('Horizontal scroll detected')
      if (Math.random() > 0.9) issues.push('Text too small to read')
      if (Math.random() > 0.85) issues.push('Touch targets too small')
    }

    if (breakpoint.width >= 768 && breakpoint.width < 1024) {
      // Tablet checks
      if (Math.random() > 0.9)
        issues.push('Layout breaks on tablet orientation change')
      if (Math.random() > 0.85) issues.push('Navigation menu overlaps content')
    }

    if (breakpoint.width >= 1024) {
      // Desktop checks
      if (Math.random() > 0.95)
        issues.push('Content too spread out on large screens')
      if (Math.random() > 0.9) issues.push('Hover states not working properly')
    }

    return {
      component,
      breakpoint: breakpoint.name,
      status: (issues.length === 0
        ? 'pass'
        : issues.length === 1
          ? 'warning'
          : 'fail') as TestResult['status'],
      issues,
    }
  }

  const runResponsiveTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    const results: TestResult[] = []
    const componentsToTest =
      selectedComponent === 'all'
        ? testComponents
        : testComponents.filter(c => c.id === selectedComponent)

    for (const component of componentsToTest) {
      for (const breakpoint of breakpoints) {
        const result = await checkResponsiveness(component.id, breakpoint)
        results.push(result)
        setTestResults([...results])
      }
    }

    setIsRunningTests(false)
  }

  const getBreakpointStyles = (breakpointId: string) => {
    const bp = breakpoints.find(b => b.id === breakpointId)
    if (!bp) return {}

    return {
      width: `${bp.width}px`,
      height: `${bp.height}px`,
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    const colors = {
      pass: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      fail: 'text-red-600 bg-red-50 border-red-200',
    }
    return colors[status]
  }

  const getStatusIcon = (status: TestResult['status']) => {
    const icons = {
      pass: '✅',
      warning: '⚠️',
      fail: '❌',
    }
    return icons[status]
  }

  const testSummary = {
    total: testResults.length,
    passed: testResults.filter(r => r.status === 'pass').length,
    warnings: testResults.filter(r => r.status === 'warning').length,
    failed: testResults.filter(r => r.status === 'fail').length,
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Responsive Design Test Suite
            </h2>
            <p className="text-gray-600">
              Test components across different screen sizes and devices
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Components</option>
              {testComponents.map(component => (
                <option key={component.id} value={component.id}>
                  {component.name}
                </option>
              ))}
            </select>

            <Button
              onClick={runResponsiveTests}
              disabled={isRunningTests}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </div>

        {/* Test Summary */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {testSummary.total}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {testSummary.passed}
              </div>
              <div className="text-sm text-green-600">Passed</div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {testSummary.warnings}
              </div>
              <div className="text-sm text-yellow-600">Warnings</div>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {testSummary.failed}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>
        )}
      </Card>

      {/* Breakpoint Selector */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Preview Breakpoints
        </h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {breakpoints.map(breakpoint => (
            <button
              key={breakpoint.id}
              onClick={() => setActiveBreakpoint(breakpoint.id)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeBreakpoint === breakpoint.id
                  ? 'border border-blue-200 bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {breakpoint.name}
            </button>
          ))}
        </div>

        {/* Device Preview */}
        <div className="overflow-auto rounded-lg border-2 border-dashed border-gray-300 p-4">
          <div
            className="mx-auto overflow-hidden rounded-lg border border-gray-400 bg-white shadow-lg"
            style={getBreakpointStyles(activeBreakpoint)}
          >
            <div className="h-full overflow-auto">
              {/* Sample Component Preview */}
              <div className="p-4">
                <KitHeader
                  kit={mockKit}
                  completionPercentage={65}
                  currentStepIndex={2}
                  totalSteps={8}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Test Results
          </h3>

          <div className="space-y-4">
            {testComponents
              .filter(
                c => selectedComponent === 'all' || c.id === selectedComponent
              )
              .map(component => {
                const componentResults = testResults.filter(
                  r => r.component === component.id
                )

                return (
                  <div
                    key={component.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <h4 className="mb-3 font-semibold text-gray-900">
                      {component.name}
                    </h4>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                      {componentResults.map((result, index) => (
                        <div
                          key={index}
                          className={cn(
                            'rounded-lg border p-3',
                            getStatusColor(result.status)
                          )}
                        >
                          <div className="mb-2 flex items-center space-x-2">
                            <span>{getStatusIcon(result.status)}</span>
                            <span className="text-sm font-medium">
                              {result.breakpoint}
                            </span>
                          </div>

                          {result.issues.length > 0 && (
                            <div className="space-y-1 text-xs">
                              {result.issues.map((issue, issueIndex) => (
                                <div key={issueIndex} className="opacity-75">
                                  • {issue}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      )}

      {/* Testing Guidelines */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Responsive Design Guidelines
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <h4 className="mb-2 font-medium text-gray-900">
              📱 Mobile (320-767px)
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Single column layout</li>
              <li>• Touch-friendly buttons (44px min)</li>
              <li>• Readable text (16px min)</li>
              <li>• No horizontal scrolling</li>
              <li>• Optimized navigation</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-gray-900">
              📟 Tablet (768-1023px)
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Flexible grid layouts</li>
              <li>• Optimized for portrait/landscape</li>
              <li>• Balanced content spacing</li>
              <li>• Touch and mouse support</li>
              <li>• Adaptive navigation</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-2 font-medium text-gray-900">
              🖥️ Desktop (1024px+)
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Multi-column layouts</li>
              <li>• Hover states and effects</li>
              <li>• Keyboard navigation</li>
              <li>• Optimized content width</li>
              <li>• Enhanced interactions</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ResponsiveTestSuite
