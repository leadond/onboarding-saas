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

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RateLimitData {
  count: number
  resetTime: number
  blocked: boolean
}

interface RateLimitConfig {
  windowMs: number // Window in milliseconds
  max: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful auth requests
  keyGenerator?: (req: NextRequest) => string // Custom key generator
  message?: string // Custom message
}

export class RateLimiter {
  private config: RateLimitConfig
  private store: Map<string, RateLimitData> = new Map()

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      max: config.max,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      message: config.message || 'Too many requests, please try again later'
    }
  }

  private defaultKeyGenerator(req: NextRequest): string {
    // Get IP address from various headers
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               req.headers.get('cf-connecting-ip') ||
               'unknown'
    
    // For authentication endpoints, also consider the email to prevent account enumeration
    const url = new URL(req.url)
    const isAuthEndpoint = url.pathname.includes('/auth/')
    
    if (isAuthEndpoint && req.method === 'POST') {
      // Try to get email from request body for auth endpoints
      const email = this.extractEmailFromRequest(req)
      return `${ip}:${email || 'no-email'}`
    }
    
    return ip
  }

  private async extractEmailFromRequest(req: NextRequest): Promise<string | null> {
    try {
      const body = await req.clone().json()
      return body.email || null
    } catch {
      return null
    }
  }

  private getCurrentWindow(): number {
    return Math.floor(Date.now() / this.config.windowMs)
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key)
      }
    }
  }

  async check(req: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    limit: number
    response?: NextResponse
  }> {
    this.cleanup()
    
    const key = this.config.keyGenerator(req)
    const now = Date.now()
    const currentWindow = this.getCurrentWindow()
    
    let data = this.store.get(key)
    
    if (!data || now > data.resetTime) {
      // Create new rate limit entry
      data = {
        count: 1,
        resetTime: now + this.config.windowMs,
        blocked: false
      }
      this.store.set(key, data)
    } else if (!data.blocked) {
      // Increment counter
      data.count++
      
      // Block if exceeded limit
      if (data.count > this.config.max) {
        data.blocked = true
        data.resetTime = now + this.config.windowMs // Extend block time
      }
    }
    
    const remaining = Math.max(0, this.config.max - data.count)
    const allowed = !data.blocked && data.count <= this.config.max
    
    return {
      allowed,
      remaining,
      resetTime: data.resetTime,
      limit: this.config.max,
      response: !allowed ? this.createRateLimitResponse(data.resetTime) : undefined
    }
  }

  private createRateLimitResponse(resetTime: number): NextResponse {
    return NextResponse.json(
      { 
        error: this.config.message,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': this.config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString()
        }
      }
    )
  }

  // Method to handle successful auth requests (if skipSuccessfulRequests is true)
  async onSuccess(req: NextRequest): Promise<void> {
    if (!this.config.skipSuccessfulRequests) return
    
    const key = this.config.keyGenerator(req)
    const data = this.store.get(key)
    
    if (data && data.count > 0) {
      data.count-- // Decrement count for successful requests
    }
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many authentication attempts. Please try again later or reset your password.'
})

export const generalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests. Please slow down.'
})

export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts. Please try again later.'
})

export const signupRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signup attempts per hour per IP
  message: 'Too many signup attempts. Please try again later.'
})

// Middleware function to apply rate limiting
export async function applyRateLimit(
  req: NextRequest,
  limiter: RateLimiter
): Promise<NextResponse | null> {
  const result = await limiter.check(req)
  
  if (!result.allowed) {
    return result.response!
  }
  
  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', result.limit.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
  
  return null
}

// Database-backed rate limiter for production (more reliable)
export class DatabaseRateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async check(req: NextRequest): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
    limit: number
    response?: NextResponse
  }> {
    const supabase = createClient()
    const key = this.config.keyGenerator?.(req) || this.defaultKeyGenerator(req)
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Clean up old entries
      await supabase
        .from('rate_limits')
        .delete()
        .lt('reset_time', windowStart)

      // Get current count
      const { data: current } = await supabase
        .from('rate_limits')
        .select('count, reset_time')
        .eq('key', key)
        .single()

      let count = 0
      let resetTime = now + this.config.windowMs

      if (current) {
        count = current.count
        resetTime = current.reset_time

        // Reset if window has passed
        if (now > resetTime) {
          count = 0
          resetTime = now + this.config.windowMs
        }
      }

      // Increment count
      count++

      // Check if limit exceeded
      const allowed = count <= this.config.max
      const remaining = Math.max(0, this.config.max - count)

      // Update database
      if (allowed) {
        await supabase
          .from('rate_limits')
          .upsert({
            key,
            count,
            reset_time: resetTime,
            updated_at: new Date().toISOString()
          })
      }

      if (!allowed) {
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          limit: this.config.max,
          response: this.createRateLimitResponse(resetTime)
        }
      }

      return {
        allowed: true,
        remaining,
        resetTime,
        limit: this.config.max
      }
    } catch (error) {
      console.error('Rate limiter database error:', error)
      // Fail open - allow request but log error
      return {
        allowed: true,
        remaining: this.config.max,
        resetTime: now + this.config.windowMs,
        limit: this.config.max
      }
    }
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'unknown'
    
    const url = new URL(req.url)
    const isAuthEndpoint = url.pathname.includes('/auth/')
    
    if (isAuthEndpoint && req.method === 'POST') {
      return `${ip}:${url.pathname}`
    }
    
    return `${ip}:${url.pathname}`
  }

  private createRateLimitResponse(resetTime: number): NextResponse {
    return NextResponse.json(
      { 
        error: this.config.message,
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': this.config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString()
        }
      }
    )
  }
}