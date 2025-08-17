'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface NextStep {
  id: string
  title: string
  description: string
  category: 'immediate' | 'short_term' | 'long_term'
  priority: 'high' | 'medium' | 'low'
  estimated_time: string
  action_url?: string
  action_label?: string
  is_completed: boolean
  completed_at?: string
  icon: string
  dependencies?: string[]
}

interface NextStepsProps {
  kitId: string
  clientIdentifier: string
  completionPercentage: number
  brandColor?: string
  companyName?: string
  className?: string
  onStepComplete?: (step: NextStep) => void
  onActionClick?: (step: NextStep) => void
}

export function NextSteps({
  kitId,
  clientIdentifier,
  completionPercentage,
  brandColor = '#3B82F6',
  companyName = 'Onboard Hero',
  className,
  onStepComplete,
  onActionClick,
}: NextStepsProps) {
  const [nextSteps, setNextSteps] = useState<NextStep[]>([])
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'immediate' | 'short_term' | 'long_term'
  >('all')
  const [isLoading, setIsLoading] = useState(true)

  // Sample next steps based on completion percentage
  const generateNextSteps = (): NextStep[] => {
    const baseSteps: NextStep[] = []

    if (completionPercentage < 100) {
      // Still in onboarding
      baseSteps.push({
        id: 'complete-onboarding',
        title: 'Complete Your Onboarding',
        description: `You&apos;re ${completionPercentage}% done! Finish the remaining steps to get full access to our platform.`,
        category: 'immediate',
        priority: 'high',
        estimated_time: '10-15 minutes',
        action_url: `/kit/${kitId}?client=${clientIdentifier}`,
        action_label: 'Continue Onboarding',
        is_completed: false,
        icon: '🚀',
      })
    }

    if (completionPercentage >= 50) {
      baseSteps.push(
        {
          id: 'schedule-kickoff',
          title: 'Schedule Your Kickoff Call',
          description:
            'Book a 30-minute call with our team to discuss your goals and next steps.',
          category: 'immediate',
          priority: 'high',
          estimated_time: '30 minutes',
          action_url: '/schedule-call',
          action_label: 'Schedule Call',
          is_completed: false,
          icon: '📞',
        },
        {
          id: 'review-proposal',
          title: 'Review Your Custom Proposal',
          description:
            "We&apos;ve prepared a tailored proposal based on your onboarding responses.",
          category: 'immediate',
          priority: 'medium',
          estimated_time: '15 minutes',
          action_url: '/proposal',
          action_label: 'View Proposal',
          is_completed: false,
          icon: '📋',
        }
      )
    }

    if (completionPercentage >= 75) {
      baseSteps.push(
        {
          id: 'setup-integrations',
          title: 'Set Up Integrations',
          description:
            'Connect your existing tools and platforms to streamline your workflow.',
          category: 'short_term',
          priority: 'medium',
          estimated_time: '1-2 hours',
          action_url: '/integrations',
          action_label: 'View Integrations',
          is_completed: false,
          icon: '🔗',
          dependencies: ['complete-onboarding'],
        },
        {
          id: 'team-training',
          title: 'Team Training Session',
          description:
            'Schedule training for your team members to get everyone up to speed.',
          category: 'short_term',
          priority: 'medium',
          estimated_time: '1 hour',
          action_url: '/training',
          action_label: 'Schedule Training',
          is_completed: false,
          icon: '🎓',
        }
      )
    }

    if (completionPercentage === 100) {
      baseSteps.push(
        {
          id: 'launch-strategy',
          title: 'Plan Your Launch Strategy',
          description:
            'Work with our team to plan your go-live strategy and timeline.',
          category: 'short_term',
          priority: 'high',
          estimated_time: '45 minutes',
          action_url: '/launch-planning',
          action_label: 'Start Planning',
          is_completed: false,
          icon: '🎯',
        },
        {
          id: 'performance-review',
          title: '30-Day Performance Review',
          description:
            'Schedule a review to assess progress and optimize your setup.',
          category: 'long_term',
          priority: 'medium',
          estimated_time: '30 minutes',
          action_label: 'Schedule Review',
          is_completed: false,
          icon: '📊',
        },
        {
          id: 'advanced-features',
          title: 'Explore Advanced Features',
          description:
            'Discover advanced features that can help you get even more value.',
          category: 'long_term',
          priority: 'low',
          estimated_time: '2-3 hours',
          action_url: '/advanced-features',
          action_label: 'Explore Features',
          is_completed: false,
          icon: '🔮',
        }
      )
    }

    // Add some general steps
    baseSteps.push({
      id: 'join-community',
      title: 'Join Our Community',
      description:
        'Connect with other users, share experiences, and get tips from the community.',
      category: 'long_term',
      priority: 'low',
      estimated_time: '5 minutes',
      action_url: '/community',
      action_label: 'Join Community',
      is_completed: false,
      icon: '🤝',
    })

    return baseSteps
  }

  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const steps = generateNextSteps()
      setNextSteps(steps)
      setIsLoading(false)
    }, 500)
  }, [completionPercentage])

  const handleStepComplete = (step: NextStep) => {
    setNextSteps(prev =>
      prev.map(s =>
        s.id === step.id
          ? { ...s, is_completed: true, completed_at: new Date().toISOString() }
          : s
      )
    )
    onStepComplete?.(step)
  }

  const handleActionClick = (step: NextStep) => {
    if (step.action_url) {
      window.open(step.action_url, '_blank')
    }
    onActionClick?.(step)
  }

  const categories = [
    { id: 'all' as const, name: 'All Steps', icon: '📋' },
    { id: 'immediate' as const, name: 'Immediate', icon: '⚡' },
    { id: 'short_term' as const, name: 'Short Term', icon: '📅' },
    { id: 'long_term' as const, name: 'Long Term', icon: '🗓️' },
  ]

  const filteredSteps =
    activeCategory === 'all'
      ? nextSteps
      : nextSteps.filter(step => step.category === activeCategory)

  const getPriorityColor = (priority: NextStep['priority']) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200',
    }
    return colors[priority]
  }

  const getCategoryLabel = (category: NextStep['category']) => {
    const labels = {
      immediate: 'Next 1-2 days',
      short_term: 'Next 1-2 weeks',
      long_term: 'Next 1-3 months',
    }
    return labels[category]
  }

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading next steps...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Your Next Steps
          </h3>
          <p className="text-gray-600">
            Here&apos;s what we recommend you do next to get the most out of{' '}
            {companyName}
          </p>
        </div>

        {/* Progress Summary */}
        {completionPercentage < 100 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-medium text-blue-900">
                  Complete Your Onboarding First
                </h4>
                <p className="text-sm text-blue-700">
                  You&apos;re {completionPercentage}% done. Complete the onboarding
                  to unlock all next steps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => {
            const count =
              category.id === 'all'
                ? nextSteps.length
                : nextSteps.filter(step => step.category === category.id).length

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  activeCategory === category.id
                    ? 'border border-blue-200 bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Next Steps */}
        <div className="space-y-4">
          {filteredSteps.length > 0 ? (
            filteredSteps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'rounded-lg border p-4 transition-all',
                  step.is_completed
                    ? 'border-green-200 bg-green-50 opacity-75'
                    : 'border-gray-200 hover:shadow-md'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-start space-x-4">
                    <div className="text-2xl">{step.icon}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h4
                          className={cn(
                            'font-medium',
                            step.is_completed
                              ? 'text-green-800 line-through'
                              : 'text-gray-900'
                          )}
                        >
                          {step.title}
                        </h4>
                        <span
                          className={cn(
                            'rounded-full border px-2 py-1 text-xs font-medium',
                            getPriorityColor(step.priority)
                          )}
                        >
                          {step.priority} priority
                        </span>
                      </div>
                      <p
                        className={cn(
                          'mb-2 text-sm',
                          step.is_completed ? 'text-green-700' : 'text-gray-600'
                        )}
                      >
                        {step.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>⏱️ {step.estimated_time}</span>
                        <span>📅 {getCategoryLabel(step.category)}</span>
                        {step.is_completed && step.completed_at && (
                          <span>
                            ✅ Completed{' '}
                            {new Date(step.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    {step.is_completed ? (
                      <div className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                        ✅ Complete
                      </div>
                    ) : (
                      <>
                        {step.action_url && step.action_label && (
                          <Button
                            onClick={() => handleActionClick(step)}
                            style={{ backgroundColor: brandColor }}
                            size="sm"
                          >
                            {step.action_label}
                          </Button>
                        )}
                        <Button
                          onClick={() => handleStepComplete(step)}
                          variant="outline"
                          size="sm"
                        >
                          Mark Complete
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {step.dependencies && step.dependencies.length > 0 && (
                  <div className="mt-3 pl-12">
                    <p className="text-xs text-gray-500">
                      <strong>Dependencies:</strong> Complete &quot;
                      {step.dependencies.join(', ')}&quot; first
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">🎉</div>
              <p className="text-gray-500">
                No{' '}
                {activeCategory !== 'all'
                  ? activeCategory.replace('_', ' ')
                  : ''}{' '}
                steps available right now.
              </p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {filteredSteps.every(step => step.is_completed) &&
          filteredSteps.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <div className="mb-2 text-4xl">🏆</div>
              <h4 className="mb-1 font-semibold text-green-900">
                Outstanding Work!
              </h4>
              <p className="text-sm text-green-700">
                You&apos;ve completed all the{' '}
                {activeCategory !== 'all'
                  ? activeCategory.replace('_', ' ')
                  : ''}{' '}
                steps. Keep up the great momentum!
              </p>
            </div>
          )}
      </div>
    </Card>
  )
}

export default NextSteps
