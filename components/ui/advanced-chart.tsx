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

import React from 'react'
import { cn } from '@/lib/utils/cn'

interface DataPoint {
  label: string
  value: number
  color?: string
  trend?: 'up' | 'down' | 'stable'
}

interface AdvancedChartProps {
  data: DataPoint[]
  type?: 'bar' | 'line' | 'donut' | 'area'
  title?: string
  subtitle?: string
  className?: string
  showTrend?: boolean
  animated?: boolean
}

export function AdvancedChart({
  data,
  type = 'bar',
  title,
  subtitle,
  className,
  showTrend = false,
  animated = true
}: AdvancedChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'stable': return '➡️'
      default: return ''
    }
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-success-600'
      case 'down': return 'text-error-600'
      case 'stable': return 'text-warning-600'
      default: return 'text-muted-foreground'
    }
  }

  if (type === 'donut') {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let cumulativePercentage = 0

    return (
      <div className={cn('relative p-6', className)}>
        {title && (
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage * 2.51} ${251.2 - percentage * 2.51}`
                const strokeDashoffset = -cumulativePercentage * 2.51
                cumulativePercentage += percentage

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color || `hsl(var(--primary))`}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className={animated ? 'transition-all duration-1000 ease-out' : ''}
                    strokeLinecap="round"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">{total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color || 'hsl(var(--primary))' }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-xs text-muted-foreground">
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative p-6', className)}>
      {title && (
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                {showTrend && item.trend && (
                  <span className={cn('text-xs', getTrendColor(item.trend))}>
                    {getTrendIcon(item.trend)}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-foreground">{item.value}</span>
            </div>
            
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000 ease-out',
                  animated ? 'animate-pulse' : ''
                )}
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  background: item.color || 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary-600)))'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Advanced Metric Card Component
interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon?: React.ReactNode
  className?: string
  trend?: DataPoint[]
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  className,
  trend
}: MetricCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-soft transition-all duration-300 hover:shadow-medium hover:-translate-y-1',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-xs font-medium',
                change.type === 'increase' ? 'text-success-600' : 'text-error-600'
              )}>
                {change.type === 'increase' ? '↗️' : '↘️'} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-muted-foreground">vs {change.period}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 h-16">
          <AdvancedChart 
            data={trend} 
            type="area" 
            animated={false}
            className="p-0"
          />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  )
}