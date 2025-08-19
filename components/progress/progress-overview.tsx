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

import { useState, useEffect } from 'react'
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Target,
  Calendar,
  Award,
  BarChart3,
  Activity,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type {
  ProgressMetrics,
  ProgressTrends,
} from '@/lib/progress/progress-calculator'
import type { KitStep } from '@/types'
import { cn } from '@/lib/utils/cn'

interface ProgressOverviewProps {
  metrics: ProgressMetrics
  trends: ProgressTrends
  steps: KitStep[]
  brandColor?: string
  clientName?: string
  showRecommendations?: boolean
  recommendations?: string[]
  className?: string
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
  className?: string
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  color = '#3B82F6',
  className,
}: StatCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <Card className={cn('p-6 transition-shadow hover:shadow-md', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center space-x-3">
            <div
              className="rounded-lg p-2"
              style={{ backgroundColor: `${color}15` }}
            >
              <div style={{ color }}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {trend && trendValue && (
              <div
                className={cn(
                  'flex items-center space-x-1 text-xs',
                  getTrendColor()
                )}
              >
                <span>{getTrendIcon()}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showPercentage?: boolean
  className?: string
}

function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {percentage}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      )}
    </div>
  )
}

interface MilestoneProgressProps {
  completedSteps: number
  totalSteps: number
  requiredStepsCompleted: number
  optionalStepsCompleted: number
  brandColor: string
}

function MilestoneProgress({
  completedSteps,
  totalSteps,
  requiredStepsCompleted,
  optionalStepsCompleted,
  brandColor,
}: MilestoneProgressProps) {
  const milestones = [
    {
      label: 'Getting Started',
      threshold: Math.ceil(totalSteps * 0.25),
      achieved: completedSteps >= Math.ceil(totalSteps * 0.25),
      icon: '🎯',
    },
    {
      label: 'Half Way There',
      threshold: Math.ceil(totalSteps * 0.5),
      achieved: completedSteps >= Math.ceil(totalSteps * 0.5),
      icon: '🚀',
    },
    {
      label: 'Almost Done',
      threshold: Math.ceil(totalSteps * 0.75),
      achieved: completedSteps >= Math.ceil(totalSteps * 0.75),
      icon: '⭐',
    },
    {
      label: 'Completed!',
      threshold: totalSteps,
      achieved: completedSteps === totalSteps,
      icon: '🎉',
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors',
                milestone.achieved ? 'text-white' : 'bg-gray-100 text-gray-400'
              )}
              style={{
                backgroundColor: milestone.achieved ? brandColor : undefined,
              }}
            >
              {milestone.achieved ? '✓' : milestone.icon}
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  'font-medium transition-colors',
                  milestone.achieved ? 'text-gray-900' : 'text-gray-500'
                )}
              >
                {milestone.label}
              </div>
              <div className="text-xs text-gray-500">
                {milestone.threshold} step{milestone.threshold > 1 ? 's' : ''}
                {milestone.achieved && ' ✓'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProgressOverview({
  metrics,
  trends,
  steps,
  brandColor = '#3B82F6',
  clientName,
  showRecommendations = true,
  recommendations = [],
  className,
}: ProgressOverviewProps) {
  const [animateStats, setAnimateStats] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getMomentumColor = () => {
    switch (trends.momentum) {
      case 'increasing':
        return 'text-green-600'
      case 'decreasing':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getMomentumText = () => {
    switch (trends.momentum) {
      case 'increasing':
        return 'Building momentum!'
      case 'decreasing':
        return 'Need some help?'
      default:
        return 'Steady progress'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {clientName ? `${clientName}&apos;s Progress` : 'Your Progress'}
        </h2>
        <p className="text-gray-600">
          Keep up the great work! You&apos;re making excellent progress.
        </p>
      </div>

      {/* Main Progress Ring */}
      <div className="flex justify-center">
        <ProgressRing
          percentage={animateStats ? metrics.completionPercentage : 0}
          size={140}
          color={brandColor}
          showPercentage={true}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          title="Completed Steps"
          value={metrics.completedSteps}
          subtitle={`of ${metrics.totalSteps} total`}
          color={brandColor}
        />

        <StatCard
          icon={Clock}
          title="Time Invested"
          value={formatTime(metrics.totalTimeSpent)}
          subtitle={`~${formatTime(metrics.averageTimePerStep)} per step`}
          color="#10B981"
        />

        <StatCard
          icon={TrendingUp}
          title="Current Streak"
          value={`${metrics.currentStreak} day${metrics.currentStreak !== 1 ? 's' : ''}`}
          subtitle="consecutive days"
          trend={metrics.currentStreak > 0 ? 'up' : 'neutral'}
          trendValue={trends.momentum === 'increasing' ? 'Growing' : 'Steady'}
          color="#8B5CF6"
        />

        <StatCard
          icon={Activity}
          title="Today's Progress"
          value={metrics.stepsCompletedToday}
          subtitle="steps completed"
          color="#F59E0B"
        />
      </div>

      {/* Detailed Progress Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Milestones */}
        <Card className="p-6">
          <MilestoneProgress
            completedSteps={metrics.completedSteps}
            totalSteps={metrics.totalSteps}
            requiredStepsCompleted={metrics.requiredStepsCompleted}
            optionalStepsCompleted={metrics.optionalStepsCompleted}
            brandColor={brandColor}
          />
        </Card>

        {/* Engagement & Momentum */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Engagement Score
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Engagement</span>
              <span className="font-semibold" style={{ color: brandColor }}>
                {trends.engagementScore}/100
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${animateStats ? trends.engagementScore : 0}%`,
                  backgroundColor: brandColor,
                }}
              />
            </div>

            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Momentum</span>
                <span className={cn('text-sm font-medium', getMomentumColor())}>
                  {getMomentumText()}
                </span>
              </div>
            </div>

            {metrics.estimatedTimeRemaining > 0 && (
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Remaining</span>
                  <span className="text-sm font-medium text-gray-900">
                    ~{formatTime(metrics.estimatedTimeRemaining)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900">
            <Award className="h-5 w-5" style={{ color: brandColor }} />
            <span>Recommendations</span>
          </h3>
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 rounded-lg bg-blue-50 p-3"
              >
                <div
                  className="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {trends.dailyProgress.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-gray-900">
            <BarChart3 className="h-5 w-5" style={{ color: brandColor }} />
            <span>Recent Activity</span>
          </h3>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {trends.dailyProgress.slice(-7).map((day, index) => (
              <div key={index} className="flex-shrink-0 text-center">
                <div
                  className="mb-1 flex h-12 w-8 items-end justify-center rounded-md"
                  style={{ backgroundColor: `${brandColor}20` }}
                >
                  <div
                    className="w-full rounded-md transition-all duration-300"
                    style={{
                      height: `${Math.max(8, (day.stepsCompleted / Math.max(1, Math.max(...trends.dailyProgress.map(d => d.stepsCompleted)))) * 100)}%`,
                      backgroundColor:
                        day.stepsCompleted > 0 ? brandColor : '#D1D5DB',
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(new Date(day.date))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
