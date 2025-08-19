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

import { useState, useEffect, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  Clock,
  Target,
  Users,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type {
  ProgressTrends,
  StepAnalytics,
} from '@/lib/progress/progress-calculator'
import type { KitStep } from '@/types'
import { cn } from '@/lib/utils/cn'

interface ProgressChartProps {
  trends: ProgressTrends
  stepAnalytics: StepAnalytics[]
  steps: KitStep[]
  brandColor?: string
  chartType?: 'bar' | 'line' | 'pie' | 'timeline'
  showControls?: boolean
  className?: string
}

interface ChartDataPoint {
  label: string
  value: number
  color: string
  percentage?: number
  date?: string
}

interface BarChartProps {
  data: ChartDataPoint[]
  height?: number
  animated?: boolean
  showValues?: boolean
  brandColor: string
}

function BarChart({
  data,
  height = 200,
  animated = true,
  showValues = true,
  brandColor,
}: BarChartProps) {
  const [animatedData, setAnimatedData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    if (animated) {
      // Animate bars appearing
      const timer = setTimeout(() => {
        setAnimatedData(data)
      }, 200)
      return () => clearTimeout(timer)
    } else {
      setAnimatedData(data)
    }
    return undefined
  }, [data, animated])

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="space-y-4">
      <div
        className="flex items-end space-x-2 px-4"
        style={{ height: `${height}px` }}
      >
        {animatedData.map((point, index) => (
          <div
            key={index}
            className="flex flex-1 flex-col items-center space-y-2"
          >
            <div className="flex w-full flex-1 items-end">
              <div
                className="group relative w-full cursor-pointer rounded-t-md transition-all duration-1000 ease-out"
                style={{
                  height: `${maxValue > 0 ? (point.value / maxValue) * (height - 40) : 0}px`,
                  backgroundColor: point.color,
                  minHeight: point.value > 0 ? '8px' : '0px',
                }}
              >
                {showValues && point.value > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform text-xs font-medium text-gray-600 opacity-0 transition-opacity group-hover:opacity-100">
                    {point.value}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full truncate text-center text-xs text-gray-600">
              {point.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LineChartProps {
  data: ChartDataPoint[]
  height?: number
  brandColor: string
}

function LineChart({ data, height = 200, brandColor }: LineChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue

  const points = data.map((point, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: range > 0 ? ((maxValue - point.value) / range) * 80 + 10 : 50,
  }))

  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L'
    return `${path} ${command} ${point.x} ${point.y}`
  }, '')

  return (
    <div className="space-y-4">
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Area under the curve */}
          <path
            d={`${pathData} L 100 100 L 0 100 Z`}
            fill={`${brandColor}15`}
            className="animate-pulse"
          />

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={brandColor}
            strokeWidth="2"
            className="animate-pulse"
          />

          {/* Points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill={brandColor}
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </svg>

        {/* Data labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((point, index) => (
            <div key={index} className="text-center">
              <div>{point.date || point.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface DonutChartProps {
  data: ChartDataPoint[]
  size?: number
  strokeWidth?: number
  brandColor: string
}

function DonutChart({
  data,
  size = 150,
  strokeWidth = 20,
  brandColor,
}: DonutChartProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0)

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-gray-100"
        style={{ width: size, height: size }}
      >
        <span className="text-sm text-gray-500">No data</span>
      </div>
    )
  }

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let cumulativePercentage = 0

  return (
    <div className="relative inline-block">
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />

        {/* Data segments */}
        {data.map((point, index) => {
          const percentage = (point.value / total) * 100
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
          const strokeDashoffset = -(
            (cumulativePercentage / 100) *
            circumference
          )

          cumulativePercentage += percentage

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={point.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  )
}

export function ProgressChart({
  trends,
  stepAnalytics,
  steps,
  brandColor = '#3B82F6',
  chartType = 'bar',
  showControls = true,
  className,
}: ProgressChartProps) {
  const [selectedChart, setSelectedChart] = useState(chartType)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d')

  const chartData = useMemo(() => {
    switch (selectedChart) {
      case 'bar':
        return stepAnalytics.map((analytics, index) => ({
          label:
            analytics.title.length > 10
              ? `${analytics.title.substring(0, 10)}...`
              : analytics.title,
          value: analytics.averageTimeSpent,
          color:
            analytics.difficulty === 'hard'
              ? '#EF4444'
              : analytics.difficulty === 'medium'
                ? '#F59E0B'
                : '#10B981',
          percentage: analytics.completionRate,
        }))

      case 'pie':
        const statusCounts = stepAnalytics.reduce(
          (acc, analytics) => {
            if (analytics.completionRate === 100) {
              acc.completed = (acc.completed || 0) + 1
            } else if (analytics.completionRate > 0) {
              acc.inProgress = (acc.inProgress || 0) + 1
            } else {
              acc.notStarted = (acc.notStarted || 0) + 1
            }
            return acc
          },
          {} as Record<string, number>
        )

        return [
          {
            label: 'Completed',
            value: statusCounts.completed || 0,
            color: '#22C55E',
          },
          {
            label: 'In Progress',
            value: statusCounts.inProgress || 0,
            color: brandColor,
          },
          {
            label: 'Not Started',
            value: statusCounts.notStarted || 0,
            color: '#6B7280',
          },
        ].filter(item => item.value > 0)

      case 'line':
      case 'timeline':
        const filteredData = trends.dailyProgress.filter(day => {
          const dayDate = new Date(day.date)
          const now = new Date()
          const daysAgo =
            (now.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24)

          switch (timeframe) {
            case '7d':
              return daysAgo <= 7
            case '30d':
              return daysAgo <= 30
            default:
              return true
          }
        })

        return filteredData.map(day => ({
          label: new Date(day.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          value: day.stepsCompleted,
          color: brandColor,
          date: day.date,
        }))

      default:
        return []
    }
  }, [selectedChart, stepAnalytics, trends, brandColor, timeframe])

  const renderChart = () => {
    switch (selectedChart) {
      case 'bar':
        return (
          <BarChart
            data={chartData}
            brandColor={brandColor}
            animated={true}
            showValues={true}
          />
        )

      case 'line':
      case 'timeline':
        return <LineChart data={chartData} brandColor={brandColor} />

      case 'pie':
        return (
          <div className="flex items-center space-x-8">
            <DonutChart data={chartData} brandColor={brandColor} />
            <div className="space-y-2">
              {chartData.map((point, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: point.color }}
                  />
                  <span className="text-sm text-gray-600">{point.label}</span>
                  <span className="text-sm font-medium">{point.value}</span>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getChartTitle = () => {
    switch (selectedChart) {
      case 'bar':
        return 'Step Completion Times'
      case 'pie':
        return 'Step Status Distribution'
      case 'line':
      case 'timeline':
        return 'Progress Over Time'
      default:
        return 'Progress Analytics'
    }
  }

  const getChartDescription = () => {
    switch (selectedChart) {
      case 'bar':
        return 'Average time spent on each step'
      case 'pie':
        return 'Current status of all steps'
      case 'line':
      case 'timeline':
        return `Daily progress over the last ${timeframe}`
      default:
        return 'Analytics overview'
    }
  }

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
            <BarChart3 className="h-5 w-5" style={{ color: brandColor }} />
            <span>{getChartTitle()}</span>
          </h3>
          <p className="mt-1 text-sm text-gray-600">{getChartDescription()}</p>
        </div>

        {showControls && (
          <div className="flex items-center space-x-2">
            {/* Chart type selector */}
            <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setSelectedChart('bar')}
                className={cn(
                  'rounded-md p-2 text-xs transition-colors',
                  selectedChart === 'bar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedChart('line')}
                className={cn(
                  'rounded-md p-2 text-xs transition-colors',
                  selectedChart === 'line'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <TrendingUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedChart('pie')}
                className={cn(
                  'rounded-md p-2 text-xs transition-colors',
                  selectedChart === 'pie'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <PieChart className="h-4 w-4" />
              </button>
            </div>

            {/* Timeframe selector for line charts */}
            {(selectedChart === 'line' || selectedChart === 'timeline') && (
              <div className="flex items-center space-x-1 rounded-lg bg-gray-100 p-1">
                {(['7d', '30d', 'all'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={cn(
                      'rounded-md px-3 py-1 text-xs transition-colors',
                      timeframe === tf
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {tf === 'all' ? 'All' : tf.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="flex min-h-[200px] items-center justify-center">
        {chartData.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h4 className="mb-2 text-lg font-medium text-gray-900">
              No Data Yet
            </h4>
            <p className="text-gray-600">
              Progress data will appear here as steps are completed.
            </p>
          </div>
        ) : (
          renderChart()
        )}
      </div>

      {/* Legend/Stats */}
      {chartData.length > 0 && selectedChart === 'bar' && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Easy</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>Hard</span>
              </div>
            </div>
            <div>
              Avg:{' '}
              {Math.round(
                chartData.reduce((sum, d) => sum + d.value, 0) /
                  chartData.length
              )}
              s per step
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
