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
import { getSupabaseClient } from '@/lib/supabase'
import { rateLimits, RateLimitTier } from '@/lib/rate-limit'
import { z } from 'zod'

// Request validation schemas
const apiRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  path: z.string(),
  body: z.any().optional(),
})

// API Gateway configuration
interface GatewayConfig {
  requireAuth?: boolean
  rateLimitTier?: RateLimitTier
  validateSchema?: z.ZodSchema
  permissions?: string[]
}

// Enhanced API Gateway
export class APIGateway {
  private supabase: any = null

  async handle(
    request: NextRequest,
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
    config: GatewayConfig = {}
  ): Promise<NextResponse> {
    try {
      // Rate limiting
      if (config.rateLimitTier) {
        const rateLimit = rateLimits[config.rateLimitTier]
        const identifier = this.getIdentifier(request)
        const { success, limit, remaining, reset } = await rateLimit.limit(identifier)

        if (!success) {
          return NextResponse.json(
            { error: 'Rate limit exceeded', limit, remaining, reset },
            { status: 429 }
          )
        }
      }

      // Authentication
      let user = null
      if (config.requireAuth) {
        const { data: { user: authUser }, error } = await this.supabase.auth.getUser()
        if (error || !authUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        user = authUser
      }

      // Request validation
      if (config.validateSchema) {
        const body = request.method !== 'GET' ? await request.json() : undefined
        const validation = config.validateSchema.safeParse({
          method: request.method,
          path: request.nextUrl.pathname,
          body,
        })

        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid request', details: validation.error.errors },
            { status: 400 }
          )
        }
      }

      // Create context
      const context = {
        user,
        supabase: this.supabase,
        request,
      }

      // Call handler
      return await handler(request, context)
    } catch (error) {
      console.error('API Gateway error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  private getIdentifier(request: NextRequest): string {
    // Try to get user ID from auth, fallback to IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    return ip
  }
}

// Export singleton instance
export const apiGateway = new APIGateway()

// Helper function for API routes
export function withGateway(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  config: GatewayConfig = {}
) {
  return async (request: NextRequest) => {
    return apiGateway.handle(request, handler, config)
  }
}

// Helper function for protected routes
export function createProtectedRoute(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return withGateway(handler, { requireAuth: true, rateLimitTier: 'pro' })
}

// Export APIGateway class as well
