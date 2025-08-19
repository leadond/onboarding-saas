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

// Redis fallback utility for development/build environments

import { Redis } from '@upstash/redis'

let redis: Redis | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch (error) {
  console.warn('Redis not available, using fallback')
  redis = null
}

// Mock Redis interface for fallback
const mockRedis = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  incr: async () => 1,
  expire: async () => 1,
  exists: async () => 0,
  keys: async () => [],
  flushall: async () => 'OK',
}

export const getRedisClient = () => redis || mockRedis
export const isRedisAvailable = () => redis !== null
