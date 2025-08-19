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

import type { Tables } from '@/lib/supabase/database.types'
import type { KitStep } from '@/types'

type ClientProgress = Tables<'client_progress'>

export interface ProgressMetrics {
  completionPercentage: number
  totalSteps: number
  completedSteps: number
  inProgressSteps: number
  skippedSteps: number
  requiredStepsCompleted: number
  optionalStepsCompleted: number
  totalTimeSpent: number
  averageTimePerStep: number
  estimatedTimeRemaining: number
  currentStreak: number
  stepsCompletedToday: number
}

export interface StepAnalytics {
  stepId: string
  title: string
  completionRate: number
  averageTimeSpent: number
  dropoffRate: number
  isBottleneck: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ProgressTrends {
  dailyProgress: { date: string; stepsCompleted: number }[]
  timeSpentTrend: { date: string; timeSpent: number }[]
  engagementScore: number
  momentum: 'increasing' | 'steady' | 'decreasing'
}

export class ProgressCalculator {
  private steps: KitStep[]
  private progressData: Record<string, ClientProgress>

  constructor(steps: KitStep[], progressData: Record<string, ClientProgress>) {
    this.steps = steps
    this.progressData = progressData
  }

  /**
   * Calculate comprehensive progress metrics
   */
  calculateMetrics(): ProgressMetrics {
    const totalSteps = this.steps.length
    const completedSteps = this.getCompletedSteps().length
    const inProgressSteps = this.getInProgressSteps().length
    const skippedSteps = this.getSkippedSteps().length

    const requiredSteps = this.steps.filter(step => step.is_required)
    const optionalSteps = this.steps.filter(step => !step.is_required)

    const requiredStepsCompleted = requiredSteps.filter(
      step => this.progressData[step.id]?.status === 'completed'
    ).length

    const optionalStepsCompleted = optionalSteps.filter(
      step => this.progressData[step.id]?.status === 'completed'
    ).length

    const completionPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    const totalTimeSpent = this.calculateTotalTimeSpent()
    const averageTimePerStep =
      completedSteps > 0 ? Math.round(totalTimeSpent / completedSteps) : 0

    const estimatedTimeRemaining = this.estimateRemainingTime()
    const currentStreak = this.calculateCurrentStreak()
    const stepsCompletedToday = this.getStepsCompletedToday()

    return {
      completionPercentage,
      totalSteps,
      completedSteps,
      inProgressSteps,
      skippedSteps,
      requiredStepsCompleted,
      optionalStepsCompleted,
      totalTimeSpent,
      averageTimePerStep,
      estimatedTimeRemaining,
      currentStreak,
      stepsCompletedToday,
    }
  }

  /**
   * Get completed steps
   */
  private getCompletedSteps(): ClientProgress[] {
    return Object.values(this.progressData).filter(
      progress => progress.status === 'completed'
    )
  }

  /**
   * Get steps in progress
   */
  private getInProgressSteps(): ClientProgress[] {
    return Object.values(this.progressData).filter(
      progress => progress.status === 'in_progress'
    )
  }

  /**
   * Get skipped steps
   */
  private getSkippedSteps(): ClientProgress[] {
    return Object.values(this.progressData).filter(
      progress => progress.status === 'skipped'
    )
  }

  /**
   * Calculate total time spent across all steps
   */
  calculateTotalTimeSpent(): number {
    return Object.values(this.progressData).reduce((total, progress) => {
      return total + (progress.time_spent || 0)
    }, 0)
  }

  /**
   * Estimate remaining time based on average completion time
   */
  private estimateRemainingTime(): number {
    const completedSteps = this.getCompletedSteps()
    const remainingSteps = this.steps.length - completedSteps.length

    if (completedSteps.length === 0) {
      // Use historical average for this kit type (would come from analytics)
      return remainingSteps * 300 // 5 minutes per step as default
    }

    const averageTimePerStep =
      this.calculateTotalTimeSpent() / completedSteps.length
    return Math.round(remainingSteps * averageTimePerStep)
  }

  /**
   * Calculate current completion streak (consecutive days with progress)
   */
  private calculateCurrentStreak(): number {
    const completedSteps = this.getCompletedSteps()
    if (completedSteps.length === 0) return 0

    // Sort by completion date
    const sortedCompletions = completedSteps
      .filter(step => step.completed_at)
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() -
          new Date(a.completed_at!).getTime()
      )

    if (sortedCompletions.length === 0) return 0

    let streak = 1
    const firstCompletion = sortedCompletions[0]
    if (!firstCompletion?.completed_at) return 0

    let currentDate = new Date(firstCompletion.completed_at)

    for (let i = 1; i < sortedCompletions.length; i++) {
      const completion = sortedCompletions[i]
      if (!completion?.completed_at) continue

      const stepDate = new Date(completion.completed_at)
      const daysDiff = Math.floor(
        (currentDate.getTime() - stepDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === 1) {
        streak++
        currentDate = stepDate
      } else if (daysDiff > 1) {
        break
      }
    }

    return streak
  }

  /**
   * Get steps completed today
   */
  private getStepsCompletedToday(): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getCompletedSteps().filter(step => {
      if (!step.completed_at) return false
      const completionDate = new Date(step.completed_at)
      return completionDate >= today && completionDate < tomorrow
    }).length
  }

  /**
   * Calculate step-by-step analytics
   */
  calculateStepAnalytics(): StepAnalytics[] {
    return this.steps.map(step => {
      const progress = this.progressData[step.id]
      const timeSpent = progress?.time_spent || 0

      // These would ideally come from aggregated analytics data
      const completionRate = progress?.status === 'completed' ? 100 : 0
      const averageTimeSpent = timeSpent
      const dropoffRate = progress?.status === 'in_progress' ? 50 : 0
      const isBottleneck = timeSpent > 600 // More than 10 minutes

      let difficulty: 'easy' | 'medium' | 'hard' = 'medium'
      if (timeSpent < 120) difficulty = 'easy'
      else if (timeSpent > 600) difficulty = 'hard'

      return {
        stepId: step.id,
        title: step.title,
        completionRate,
        averageTimeSpent,
        dropoffRate,
        isBottleneck,
        difficulty,
      }
    })
  }

  /**
   * Calculate progress trends over time
   */
  calculateTrends(): ProgressTrends {
    const completedSteps = this.getCompletedSteps()

    // Group completions by date
    const dailyProgress: Record<string, number> = {}
    const timeSpentByDate: Record<string, number> = {}

    completedSteps.forEach(step => {
      if (step.completed_at) {
        const dateString = new Date(step.completed_at)
          .toISOString()
          .split('T')[0]
        if (dateString) {
          dailyProgress[dateString] = (dailyProgress[dateString] || 0) + 1
          timeSpentByDate[dateString] =
            (timeSpentByDate[dateString] || 0) + (step.time_spent || 0)
        }
      }
    })

    const dailyProgressArray = Object.entries(dailyProgress)
      .map(([date, stepsCompleted]) => ({
        date,
        stepsCompleted,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const timeSpentTrend = Object.entries(timeSpentByDate)
      .map(([date, timeSpent]) => ({
        date,
        timeSpent,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate engagement score (0-100)
    const totalPossibleTime = this.steps.length * 300 // 5 minutes per step ideal
    const actualTimeSpent = this.calculateTotalTimeSpent()
    const timeEfficiency = Math.min(
      100,
      Math.max(
        0,
        100 - ((actualTimeSpent - totalPossibleTime) / totalPossibleTime) * 100
      )
    )

    const completionRate = (completedSteps.length / this.steps.length) * 100
    const engagementScore = Math.round(
      timeEfficiency * 0.3 + completionRate * 0.7
    )

    // Calculate momentum
    let momentum: 'increasing' | 'steady' | 'decreasing' = 'steady'
    if (dailyProgressArray.length >= 2) {
      const recent = dailyProgressArray.slice(-3)
      const earlier = dailyProgressArray.slice(-6, -3)

      const recentAvg =
        recent.reduce((sum, day) => sum + day.stepsCompleted, 0) / recent.length
      const earlierAvg =
        earlier.length > 0
          ? earlier.reduce((sum, day) => sum + day.stepsCompleted, 0) /
            earlier.length
          : 0

      if (recentAvg > earlierAvg * 1.2) momentum = 'increasing'
      else if (recentAvg < earlierAvg * 0.8) momentum = 'decreasing'
    }

    return {
      dailyProgress: dailyProgressArray,
      timeSpentTrend,
      engagementScore,
      momentum,
    }
  }

  /**
   * Get next recommended step based on dependencies and progress
   */
  getNextRecommendedStep(): KitStep | null {
    // Find first uncompleted required step
    for (const step of this.steps) {
      const progress = this.progressData[step.id]
      if (!progress || progress.status === 'not_started') {
        if (step.is_required) {
          return step
        }
      }
    }

    // If all required steps are done, suggest first optional step
    for (const step of this.steps) {
      const progress = this.progressData[step.id]
      if (!progress || progress.status === 'not_started') {
        return step
      }
    }

    return null
  }

  /**
   * Check if client is at risk of dropping off
   */
  isAtRisk(): boolean {
    const metrics = this.calculateMetrics()

    // Risk factors
    const stuckOnStep = this.getInProgressSteps().some(progress => {
      const startTime = new Date(progress.started_at).getTime()
      const now = Date.now()
      const hoursStuck = (now - startTime) / (1000 * 60 * 60)
      return hoursStuck > 24 // Stuck on a step for more than 24 hours
    })

    const lowEngagement =
      metrics.stepsCompletedToday === 0 && metrics.currentStreak === 0
    const highTimeSpent = metrics.averageTimePerStep > 900 // More than 15 minutes per step

    return stuckOnStep || lowEngagement || highTimeSpent
  }

  /**
   * Generate personalized recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.calculateMetrics()
    const trends = this.calculateTrends()

    if (metrics.currentStreak > 0) {
      recommendations.push(
        `Great momentum! You're on a ${metrics.currentStreak}-day streak.`
      )
    }

    if (metrics.stepsCompletedToday > 0) {
      recommendations.push(
        `You've completed ${metrics.stepsCompletedToday} step${metrics.stepsCompletedToday > 1 ? 's' : ''} today!`
      )
    }

    if (trends.momentum === 'increasing') {
      recommendations.push(
        "You're building great momentum! Keep up the excellent progress."
      )
    }

    if (this.isAtRisk()) {
      recommendations.push(
        'Need help? Consider reaching out to our support team.'
      )
    }

    if (metrics.completionPercentage > 75) {
      recommendations.push(
        "You're almost there! Just a few more steps to complete your onboarding."
      )
    }

    return recommendations
  }
}

export default ProgressCalculator
