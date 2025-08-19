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

import * as React from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils/cn'

interface VideoPlayerProps {
  src?: string
  youtubeId?: string
  vimeoId?: string
  poster?: string
  title?: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
  onPlay?: () => void
  onPause?: () => void
  autoPlay?: boolean
  controls?: boolean
  muted?: boolean
  loop?: boolean
  className?: string
}

interface VideoPlayerState {
  isPlaying: boolean
  isMuted: boolean
  isFullscreen: boolean
  currentTime: number
  duration: number
  buffered: number
  volume: number
  isLoading: boolean
  error: string | null
  hasPlayedOnce: boolean
}

export function VideoPlayer({
  src,
  youtubeId,
  vimeoId,
  poster,
  title,
  onProgress,
  onComplete,
  onPlay,
  onPause,
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  className,
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const progressIntervalRef = React.useRef<NodeJS.Timeout>()

  const [state, setState] = React.useState<VideoPlayerState>({
    isPlaying: false,
    isMuted: muted,
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    isLoading: true,
    error: null,
    hasPlayedOnce: false,
  })

  // Determine video type and source
  const videoType = React.useMemo(() => {
    if (youtubeId) return 'youtube'
    if (vimeoId) return 'vimeo'
    if (src) return 'direct'
    return null
  }, [src, youtubeId, vimeoId])

  // Generate embed URLs
  const embedUrl = React.useMemo(() => {
    if (youtubeId) {
      const params = new URLSearchParams({
        enablejsapi: '1',
        modestbranding: '1',
        rel: '0',
        ...(autoPlay && { autoplay: '1' }),
        ...(muted && { mute: '1' }),
        ...(loop && { loop: '1', playlist: youtubeId }),
      })
      return `https://www.youtube.com/embed/${youtubeId}?${params}`
    }

    if (vimeoId) {
      const params = new URLSearchParams({
        ...(autoPlay && { autoplay: '1' }),
        ...(muted && { muted: '1' }),
        ...(loop && { loop: '1' }),
      })
      return `https://player.vimeo.com/video/${vimeoId}?${params}`
    }

    return null
  }, [youtubeId, vimeoId, autoPlay, muted, loop])

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setState(prev => ({
        ...prev,
        duration: videoRef.current!.duration,
        isLoading: false,
      }))
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const duration = videoRef.current.duration
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0

      setState(prev => ({
        ...prev,
        currentTime,
      }))

      onProgress?.(progress)
    }
  }

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const buffered = videoRef.current.buffered.end(0)
      const duration = videoRef.current.duration
      const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0

      setState(prev => ({
        ...prev,
        buffered: bufferedPercent,
      }))
    }
  }

  const handlePlay = () => {
    setState(prev => ({
      ...prev,
      isPlaying: true,
      hasPlayedOnce: true,
    }))
    onPlay?.()
  }

  const handlePause = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
    }))
    onPause?.()
  }

  const handleEnded = () => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }))
    onComplete?.()

    if (loop && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }

  const handleError = () => {
    setState(prev => ({
      ...prev,
      error: 'Failed to load video',
      isLoading: false,
    }))
  }

  // Control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (state.isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !state.isMuted
      videoRef.current.muted = newMuted
      setState(prev => ({ ...prev, isMuted: newMuted }))
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const progress = clickX / rect.width
      const newTime = progress * state.duration

      videoRef.current.currentTime = newTime
      setState(prev => ({ ...prev, currentTime: newTime }))
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!state.isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }

  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      setState(prev => ({ ...prev, currentTime: 0 }))
    }
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Fullscreen event listeners
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Progress tracking interval
  React.useEffect(() => {
    if (state.isPlaying && onProgress) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const progress =
            (videoRef.current.currentTime / videoRef.current.duration) * 100
          onProgress(progress)
        }
      }, 1000)
    } else if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [state.isPlaying, onProgress])

  if (!videoType) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-gray-100 p-8',
          className
        )}
      >
        <p className="text-gray-500">No video source provided</p>
      </div>
    )
  }

  // Render embedded videos (YouTube/Vimeo)
  if (videoType !== 'direct') {
    return (
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden rounded-lg bg-black',
          className
        )}
      >
        <iframe
          src={embedUrl || undefined}
          title={title || 'Video player'}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setState(prev => ({ ...prev, isLoading: false }))}
        />
        {state.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    )
  }

  // Render direct video player
  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-lg bg-black',
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={state.isMuted}
        autoPlay={autoPlay}
        loop={loop}
        className="h-full w-full object-contain"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Loading overlay */}
      {state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error overlay */}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <p className="text-center text-white">{state.error}</p>
        </div>
      )}

      {/* Controls overlay */}
      {controls && !state.isLoading && !state.error && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* Play/Pause button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              className="h-16 w-16 rounded-full text-white hover:bg-white/20"
            >
              {state.isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="ml-1 h-8 w-8" />
              )}
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
            {/* Progress bar */}
            <div
              className="h-1 w-full cursor-pointer rounded-full bg-white/30"
              onClick={handleSeek}
            >
              <div className="relative h-full">
                {/* Buffered progress */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-white/50"
                  style={{ width: `${state.buffered}%` }}
                />
                {/* Current progress */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-white"
                  style={{
                    width: `${(state.currentTime / state.duration) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={restart}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {state.isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-sm text-white">
                  {formatTime(state.currentTime)} / {formatTime(state.duration)}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
