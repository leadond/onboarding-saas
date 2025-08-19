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

import { useState, useEffect } from 'react'
import { Check, Download, Share2, Star, Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Kit } from '@/types'
import { cn } from '@/lib/utils/cn'

interface CompletionCelebrationProps {
  kit: Kit & {
    user?: {
      full_name?: string
      company_name?: string
    }
  }
  clientName?: string
  completionTime?: number // in seconds
  totalSteps: number
  onDownloadCertificate?: () => void
  onShareSuccess?: () => void
  onProvideFeedback?: () => void
  className?: string
}

export function CompletionCelebration({
  kit,
  clientName,
  completionTime,
  totalSteps,
  onDownloadCertificate,
  onShareSuccess,
  onProvideFeedback,
  className,
}: CompletionCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)

  const companyName =
    kit.user?.company_name || kit.user?.full_name || 'Professional Services'
  const brandColor = kit.brand_color || '#3B82F6'

  // Animation sequence
  useEffect(() => {
    const sequence = [
      () => setShowConfetti(true),
      () => setAnimationPhase(1),
      () => setAnimationPhase(2),
    ]

    sequence.forEach((fn, index) => {
      setTimeout(fn, index * 500)
    })

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000)
  }, [])

  const formatTime = (seconds?: number) => {
    if (!seconds) return null
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes === 0) {
      return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4',
        className
      )}
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-10">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles
                className="h-4 w-4 text-yellow-400"
                style={{ transform: `rotate(${Math.random() * 360}deg)` }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-2xl">
        {/* Main Celebration Card */}
        <Card className="border-0 bg-white/95 p-8 text-center shadow-xl backdrop-blur-sm">
          {/* Trophy Icon */}
          <div
            className={cn(
              'mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full transition-all duration-1000',
              animationPhase >= 1 ? 'rotate-0 scale-100' : 'rotate-180 scale-0'
            )}
            style={{ backgroundColor: `${brandColor}20` }}
          >
            <Trophy
              className="h-10 w-10 transition-all duration-500"
              style={{ color: brandColor }}
            />
          </div>

          {/* Celebration Title */}
          <div
            className={cn(
              'transition-all delay-300 duration-700',
              animationPhase >= 1
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
          >
            <h1 className="mb-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Congratulations{clientName ? `, ${clientName}` : ''}! 🎉
            </h1>
            <p className="mb-6 text-xl text-gray-600">
              You&apos;ve successfully completed your onboarding with {companyName}
            </p>
          </div>

          {/* Success Stats */}
          <div
            className={cn(
              'mb-8 grid grid-cols-1 gap-4 transition-all delay-500 duration-700 sm:grid-cols-3',
              animationPhase >= 2
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
          >
            <div className="text-center">
              <div
                className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <Check className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalSteps}
              </div>
              <div className="text-sm text-gray-600">Steps Completed</div>
            </div>

            {completionTime && (
              <div className="text-center">
                <div
                  className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${brandColor}15` }}
                >
                  <Star className="h-6 w-6" style={{ color: brandColor }} />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(completionTime)}
                </div>
                <div className="text-sm text-gray-600">Time Invested</div>
              </div>
            )}

            <div className="text-center">
              <div
                className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <Trophy className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          {/* Success Message */}
          <div
            className={cn(
              'mb-6 rounded-lg border border-green-200 bg-green-50 p-4 transition-all delay-700 duration-700',
              animationPhase >= 2
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
          >
            <div className="flex items-start space-x-3">
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <div className="text-left">
                <h3 className="mb-1 font-medium text-green-900">
                  Your onboarding is now complete!
                </h3>
                <p className="text-sm text-green-700">
                  {companyName} will be in touch soon with your next steps.
                  {kit.completion_redirect_url
                    ? ' You can also access your client portal anytime.'
                    : ' Keep this page bookmarked for future reference.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={cn(
              'flex flex-col justify-center gap-3 transition-all delay-1000 duration-700 sm:flex-row',
              animationPhase >= 2
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
          >
            {onDownloadCertificate && (
              <Button
                onClick={onDownloadCertificate}
                className="flex items-center space-x-2"
                style={{ backgroundColor: brandColor }}
              >
                <Download className="h-4 w-4" />
                <span>Download Certificate</span>
              </Button>
            )}

            {onShareSuccess && (
              <Button
                onClick={onShareSuccess}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Success</span>
              </Button>
            )}

            {onProvideFeedback && (
              <Button
                onClick={onProvideFeedback}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Star className="h-4 w-4" />
                <span>Leave Feedback</span>
              </Button>
            )}
          </div>

          {/* Redirect Notice */}
          {kit.completion_redirect_url && (
            <div
              className={cn(
                'delay-1200 mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 transition-all duration-700',
                animationPhase >= 2
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              )}
            >
              <p className="text-sm text-blue-800">
                You will be automatically redirected to your client portal in a
                few moments, or{' '}
                <a
                  href={kit.completion_redirect_url}
                  className="font-medium underline hover:no-underline"
                  style={{ color: brandColor }}
                >
                  click here to continue
                </a>
                .
              </p>
            </div>
          )}
        </Card>

        {/* Footer Message */}
        <div
          className={cn(
            'delay-1400 mt-6 text-center transition-all duration-700',
            animationPhase >= 2
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          )}
        >
          <p className="text-sm text-gray-600">
            Thank you for choosing {companyName}. We&apos;re excited to work with
            you! ✨
          </p>
        </div>
      </div>
    </div>
  )
}
