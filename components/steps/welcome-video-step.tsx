'use client'

import * as React from 'react'
import { VideoPlayer } from '@/components/media/video-player'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { Tables } from '@/lib/supabase/database.types'

type ClientProgress = Tables<'client_progress'>

interface WelcomeVideoStepProps {
  step: KitStep
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: ClientProgress
  className?: string
}

export function WelcomeVideoStep({
  step,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
  progress,
  className,
}: WelcomeVideoStepProps) {
  const { content, title, description } = step
  const [hasWatched, setHasWatched] = React.useState(false)
  const [watchProgress, setWatchProgress] = React.useState(0)
  const [isCompleted, setIsCompleted] = React.useState(false)

  // Check if user has already completed this step
  React.useEffect(() => {
    if (progress?.status === 'completed') {
      setIsCompleted(true)
      setHasWatched(true)
      setWatchProgress(100)
    }
  }, [progress])

  // Extract video information from content
  const videoUrl = content.video_url
  const instructions = content.instructions

  // Parse video URL to determine type and ID
  const videoInfo = React.useMemo(() => {
    if (!videoUrl) return null

    // YouTube URL patterns
    const youtubeRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    const youtubeMatch = videoUrl.match(youtubeRegex)
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1] }
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/
    const vimeoMatch = videoUrl.match(vimeoRegex)
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] }
    }

    // Direct video URL
    return { type: 'direct', url: videoUrl }
  }, [videoUrl])

  const handleVideoProgress = (progress: number) => {
    setWatchProgress(progress)

    // Mark as watched when user has seen at least 80% or if not required
    if (progress >= 80 || !step.is_required) {
      if (!hasWatched) {
        setHasWatched(true)
        trackProgress(progress)
      }
    }
  }

  const handleVideoComplete = () => {
    setWatchProgress(100)
    setHasWatched(true)
    setIsCompleted(true)
    trackProgress(100)

    // Auto-advance if configured
    if (step.settings?.auto_advance && onNext) {
      setTimeout(() => {
        onNext()
      }, 1000) // Small delay to show completion
    }
  }

  const handleVideoPlay = () => {
    // Track that user started watching
    trackProgress(watchProgress, 'started')
  }

  const trackProgress = async (progress: number, action?: string) => {
    try {
      await onComplete({
        step_id: step.id,
        response_data: {
          watch_progress: progress,
          completed_at: progress >= 100 ? new Date().toISOString() : null,
          action,
        },
        status:
          progress >= 100 || (progress >= 80 && !step.is_required)
            ? 'completed'
            : 'in_progress',
      })
    } catch (error) {
      console.error('Error tracking video progress:', error)
    }
  }

  const handleContinue = async () => {
    if (!isCompleted && hasWatched) {
      setIsCompleted(true)
      await trackProgress(watchProgress)
    }

    if (onNext) {
      onNext()
    }
  }

  const canContinue = hasWatched || !step.is_required

  return (
    <Card className={cn('mx-auto w-full max-w-4xl', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-2 text-base">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Video Player */}
        {videoInfo && (
          <div className="w-full">
            <VideoPlayer
              {...(videoInfo.type === 'youtube'
                ? { youtubeId: videoInfo.id }
                : {})}
              {...(videoInfo.type === 'vimeo' ? { vimeoId: videoInfo.id } : {})}
              {...(videoInfo.type === 'direct' ? { src: videoInfo.url } : {})}
              title={title}
              onProgress={handleVideoProgress}
              onComplete={handleVideoComplete}
              onPlay={handleVideoPlay}
              controls={true}
              className="w-full"
            />
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: instructions }} />
          </div>
        )}

        {/* Progress Indicator */}
        {step.is_required && watchProgress > 0 && watchProgress < 100 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Watch Progress
              </span>
              <span className="text-sm text-blue-600">
                {Math.round(watchProgress)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-blue-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${watchProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-blue-600">
              {watchProgress >= 80
                ? 'Great! You can continue now.'
                : 'Please watch at least 80% of the video to continue.'}
            </p>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              ✓ Video completed! You can now proceed to the next step.
            </p>
          </div>
        )}

        {/* Requirements */}
        {step.is_required && !hasWatched && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              This video is required. Please watch at least 80% of the video to
              continue.
            </p>
          </div>
        )}

        {/* No Video Error */}
        {!videoInfo && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-sm text-red-800">
              No video has been configured for this step.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
          {onPrevious ? (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {!step.settings?.auto_advance && (
            <Button
              type="button"
              onClick={handleContinue}
              disabled={isLoading || !canContinue}
            >
              {isCompleted
                ? 'Continue'
                : hasWatched
                  ? 'Mark Complete & Continue'
                  : 'Continue'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing welcome video step state
export function useWelcomeVideoStep() {
  const [watchProgress, setWatchProgress] = React.useState(0)
  const [hasWatched, setHasWatched] = React.useState(false)
  const [isCompleted, setIsCompleted] = React.useState(false)

  const updateProgress = (progress: number) => {
    setWatchProgress(progress)
    if (progress >= 80 && !hasWatched) {
      setHasWatched(true)
    }
    if (progress >= 100 && !isCompleted) {
      setIsCompleted(true)
    }
  }

  const reset = () => {
    setWatchProgress(0)
    setHasWatched(false)
    setIsCompleted(false)
  }

  return {
    watchProgress,
    hasWatched,
    isCompleted,
    updateProgress,
    reset,
  }
}
