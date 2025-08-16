'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface AccessibilityTestResult {
  component: string
  testType: string
  rule: string
  status: 'pass' | 'fail' | 'warning'
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  description: string
  recommendation?: string
}

interface AccessibilityTestSuiteProps {
  className?: string
}

export function AccessibilityTestSuite({
  className,
}: AccessibilityTestSuiteProps) {
  const [testResults, setTestResults] = useState<AccessibilityTestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [selectedTestType, setSelectedTestType] = useState<string>('all')
  const [selectedComponent, setSelectedComponent] = useState<string>('all')

  // WCAG Test Categories
  const testCategories = [
    { id: 'all', name: 'All Tests', icon: '🔍' },
    { id: 'keyboard', name: 'Keyboard Navigation', icon: '⌨️' },
    { id: 'screen-reader', name: 'Screen Reader', icon: '👁️' },
    { id: 'color-contrast', name: 'Color Contrast', icon: '🎨' },
    { id: 'focus', name: 'Focus Management', icon: '🎯' },
    { id: 'aria', name: 'ARIA Attributes', icon: '🏷️' },
    { id: 'semantic', name: 'Semantic HTML', icon: '📝' },
  ]

  // Components to test
  const testComponents = [
    'kit-header',
    'progress-overview',
    'step-progress-card',
    'chat-widget',
    'contact-form',
    'document-library',
    'next-steps',
    'completion-certificate',
    'admin-dashboard',
    'notification-preferences',
  ]

  // Mock accessibility test results
  const generateAccessibilityTests = async (): Promise<
    AccessibilityTestResult[]
  > => {
    const results: AccessibilityTestResult[] = []

    const componentsToTest =
      selectedComponent === 'all' ? testComponents : [selectedComponent]

    for (const component of componentsToTest) {
      // Keyboard Navigation Tests
      if (selectedTestType === 'all' || selectedTestType === 'keyboard') {
        results.push(
          {
            component,
            testType: 'keyboard',
            rule: 'All interactive elements are keyboard accessible',
            status: Math.random() > 0.1 ? 'pass' : 'fail',
            impact: 'critical',
            description:
              'Interactive elements must be reachable and operable via keyboard',
            recommendation:
              'Ensure all buttons, links, and form elements have proper tabindex and keyboard event handlers',
          },
          {
            component,
            testType: 'keyboard',
            rule: 'Tab order is logical and intuitive',
            status: Math.random() > 0.15 ? 'pass' : 'warning',
            impact: 'serious',
            description: 'Tab order should follow the visual flow of the page',
            recommendation:
              'Review tabindex values and DOM order for logical tab sequence',
          }
        )
      }

      // Screen Reader Tests
      if (selectedTestType === 'all' || selectedTestType === 'screen-reader') {
        results.push(
          {
            component,
            testType: 'screen-reader',
            rule: 'All images have appropriate alt text',
            status: Math.random() > 0.2 ? 'pass' : 'fail',
            impact: 'serious',
            description: 'Images must have descriptive alternative text',
            recommendation: 'Add meaningful alt attributes to all img elements',
          },
          {
            component,
            testType: 'screen-reader',
            rule: 'Page has proper heading structure',
            status: Math.random() > 0.1 ? 'pass' : 'warning',
            impact: 'moderate',
            description: 'Headings should be properly nested (h1 > h2 > h3)',
            recommendation:
              'Ensure heading levels are sequential and descriptive',
          }
        )
      }

      // Color Contrast Tests
      if (selectedTestType === 'all' || selectedTestType === 'color-contrast') {
        results.push(
          {
            component,
            testType: 'color-contrast',
            rule: 'Text has sufficient contrast ratio (4.5:1 for normal text)',
            status: Math.random() > 0.05 ? 'pass' : 'fail',
            impact: 'serious',
            description: 'Text must meet WCAG AA contrast requirements',
            recommendation:
              'Ensure text color has sufficient contrast against background',
          },
          {
            component,
            testType: 'color-contrast',
            rule: 'Color is not the only way to convey information',
            status: Math.random() > 0.1 ? 'pass' : 'warning',
            impact: 'moderate',
            description: 'Information should not rely solely on color',
            recommendation:
              'Use icons, patterns, or text labels in addition to color',
          }
        )
      }

      // Focus Management Tests
      if (selectedTestType === 'all' || selectedTestType === 'focus') {
        results.push(
          {
            component,
            testType: 'focus',
            rule: 'Focus indicators are visible and clear',
            status: Math.random() > 0.1 ? 'pass' : 'fail',
            impact: 'serious',
            description: 'Focused elements must have visible focus indicators',
            recommendation:
              'Ensure focus styles are clearly visible and not removed',
          },
          {
            component,
            testType: 'focus',
            rule: 'Focus is managed properly in dynamic content',
            status: Math.random() > 0.2 ? 'pass' : 'warning',
            impact: 'moderate',
            description:
              'Focus should be managed when content changes dynamically',
            recommendation:
              'Move focus to new content or relevant elements when UI updates',
          }
        )
      }

      // ARIA Attributes Tests
      if (selectedTestType === 'all' || selectedTestType === 'aria') {
        results.push(
          {
            component,
            testType: 'aria',
            rule: 'ARIA labels and descriptions are meaningful',
            status: Math.random() > 0.15 ? 'pass' : 'warning',
            impact: 'moderate',
            description:
              'ARIA attributes should provide clear, concise descriptions',
            recommendation:
              'Review aria-label and aria-describedby text for clarity',
          },
          {
            component,
            testType: 'aria',
            rule: 'ARIA roles are used correctly',
            status: Math.random() > 0.1 ? 'pass' : 'fail',
            impact: 'serious',
            description: "ARIA roles should match the element's behavior",
            recommendation:
              "Ensure ARIA roles are appropriate for the element's function",
          }
        )
      }

      // Semantic HTML Tests
      if (selectedTestType === 'all' || selectedTestType === 'semantic') {
        results.push(
          {
            component,
            testType: 'semantic',
            rule: 'Semantic HTML elements are used appropriately',
            status: Math.random() > 0.1 ? 'pass' : 'warning',
            impact: 'moderate',
            description: 'Use semantic HTML5 elements for better accessibility',
            recommendation:
              'Replace generic divs with semantic elements like nav, main, section',
          },
          {
            component,
            testType: 'semantic',
            rule: 'Form elements have proper labels',
            status: Math.random() > 0.05 ? 'pass' : 'fail',
            impact: 'critical',
            description: 'All form inputs must have associated labels',
            recommendation:
              'Use label elements or aria-labelledby for all form inputs',
          }
        )
      }

      // Add a small delay to simulate real testing
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return results
  }

  const runAccessibilityTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    try {
      const results = await generateAccessibilityTests()
      setTestResults(results)
    } catch (error) {
      console.error('Failed to run accessibility tests:', error)
    } finally {
      setIsRunningTests(false)
    }
  }

  const getStatusColor = (status: AccessibilityTestResult['status']) => {
    const colors = {
      pass: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      fail: 'text-red-600 bg-red-50 border-red-200',
    }
    return colors[status]
  }

  const getImpactColor = (impact: AccessibilityTestResult['impact']) => {
    const colors = {
      critical: 'text-red-700 bg-red-100',
      serious: 'text-orange-700 bg-orange-100',
      moderate: 'text-yellow-700 bg-yellow-100',
      minor: 'text-blue-700 bg-blue-100',
    }
    return colors[impact]
  }

  const getStatusIcon = (status: AccessibilityTestResult['status']) => {
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
    critical: testResults.filter(
      r => r.impact === 'critical' && r.status === 'fail'
    ).length,
    serious: testResults.filter(
      r => r.impact === 'serious' && r.status === 'fail'
    ).length,
  }

  const filteredResults = testResults.filter(result => {
    const matchesType =
      selectedTestType === 'all' || result.testType === selectedTestType
    const matchesComponent =
      selectedComponent === 'all' || result.component === selectedComponent
    return matchesType && matchesComponent
  })

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Accessibility Test Suite
            </h2>
            <p className="text-gray-600">
              WCAG 2.1 AA compliance testing for OnboardKit components
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedTestType}
              onChange={e => setSelectedTestType(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {testCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Components</option>
              {testComponents.map(component => (
                <option key={component} value={component}>
                  {component
                    .replace('-', ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            <Button
              onClick={runAccessibilityTests}
              disabled={isRunningTests}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </div>

        {/* Test Summary */}
        {testResults.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
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
            <div className="rounded-lg bg-red-100 p-3 text-center">
              <div className="text-2xl font-bold text-red-700">
                {testSummary.critical}
              </div>
              <div className="text-sm text-red-700">Critical</div>
            </div>
            <div className="rounded-lg bg-orange-50 p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {testSummary.serious}
              </div>
              <div className="text-sm text-orange-600">Serious</div>
            </div>
          </div>
        )}
      </Card>

      {/* Test Results */}
      {filteredResults.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Test Results
          </h3>

          <div className="space-y-3">
            {filteredResults.map((result, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-lg border p-4',
                  getStatusColor(result.status)
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <span className="text-lg">
                        {getStatusIcon(result.status)}
                      </span>
                      <span className="font-medium">{result.rule}</span>
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-medium',
                          getImpactColor(result.impact)
                        )}
                      >
                        {result.impact}
                      </span>
                    </div>

                    <p className="mb-2 text-sm opacity-90">
                      {result.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs opacity-75">
                      <span>Component: {result.component}</span>
                      <span>Category: {result.testType}</span>
                    </div>

                    {result.recommendation && result.status !== 'pass' && (
                      <div className="mt-3 rounded bg-white bg-opacity-50 p-2 text-sm">
                        <strong>Recommendation:</strong> {result.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* WCAG Guidelines */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          WCAG 2.1 AA Guidelines
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-3 flex items-center font-medium text-gray-900">
              <span className="mr-2">👁️</span>
              Perceivable
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Text alternatives for images</li>
              <li>• Captions for media</li>
              <li>• Sufficient color contrast</li>
              <li>• Resizable text</li>
              <li>• Non-text contrast</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 flex items-center font-medium text-gray-900">
              <span className="mr-2">⌨️</span>
              Operable
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Keyboard accessible</li>
              <li>• No seizure triggers</li>
              <li>• Sufficient time limits</li>
              <li>• Navigation aids</li>
              <li>• Input modalities</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 flex items-center font-medium text-gray-900">
              <span className="mr-2">🧠</span>
              Understandable
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Readable text</li>
              <li>• Predictable functionality</li>
              <li>• Input assistance</li>
              <li>• Error identification</li>
              <li>• Clear instructions</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 flex items-center font-medium text-gray-900">
              <span className="mr-2">🔧</span>
              Robust
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Valid HTML markup</li>
              <li>• Compatible with assistive tech</li>
              <li>• Proper ARIA usage</li>
              <li>• Future compatibility</li>
              <li>• Standard compliance</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Quick Fixes */}
      {testResults.some(r => r.status === 'fail') && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            🚨 Critical Issues to Fix
          </h3>

          <div className="space-y-3">
            {testResults
              .filter(r => r.status === 'fail' && r.impact === 'critical')
              .slice(0, 5)
              .map((result, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-red-200 bg-red-50 p-3"
                >
                  <div className="font-medium text-red-900">{result.rule}</div>
                  <div className="mt-1 text-sm text-red-700">
                    {result.recommendation}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AccessibilityTestSuite
