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

import { Ratelimit } from '@upstash/ratelimit'
import { getRedisClient, isRedisAvailable } from '@/lib/redis-fallback'

// Create rate limiters with fallback
const createRateLimit = (requests: number, windowMs: number) => {
  const redis = getRedisClient()
  
  if (!isRedisAvailable()) {
    // Return a mock rate limiter for development
    return {
      limit: async () => ({
        success: true,
        limit: requests,
        remaining: requests - 1,
        reset: Date.now() + windowMs,
      }),
    }
  }

  return new Ratelimit({
    redis: redis as any, // Type assertion for compatibility
    limiter: Ratelimit.slidingWindow(requests, `${windowMs}ms`),
    analytics: true,
  })
}

export const rateLimits = {
  free: createRateLimit(10, 60000), // 10 requests per minute
  pro: createRateLimit(100, 60000), // 100 requests per minute
  enterprise: createRateLimit(1000, 60000), // 1000 requests per minute
  api: createRateLimit(1000, 3600000), // 1000 requests per hour
}

export type RateLimitTier = keyof typeof rateLimits
