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

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { rbacManager, UserContext } from '@/lib/auth/rbac'
import { rateLimits, RateLimitTier } from '@/lib/rate-limit'
import { z } from 'zod'

// Enhanced gateway configuration
interface EnhancedGatewayConfig {
  requireAuth?: boolean
  rateLimitTier?: RateLimitTier
  validateSchema?: z.ZodSchema
  permissions?: string[]
  roles?: string[]
  organizationRequired?: boolean
}

// Enhanced API Gateway with RBAC
export class EnhancedAPIGateway {
  private supabase = createClient()

  async handle(
    request: NextRequest,
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
    config: EnhancedGatewayConfig = {}
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
      let userContext: UserContext | null = null

      if (config.requireAuth) {
        const { data: { user: authUser }, error } = await this.supabase.auth.getUser()
        if (error || !authUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        user = authUser

        // Create user context for RBAC
        userContext = {
          id: user.id,
          email: user.email || '',
          roles: [], // Would be populated from database
          permissions: [], // Would be populated from database
          organizationId: null, // Would be populated from database
        }
      }

      // Authorization (RBAC)
      if (config.permissions && userContext) {
        const hasPermission = await rbacManager.hasPermission(
          userContext,
          config.permissions[0] // Simplified for now
        )
        if (!hasPermission) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
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

      // Create enhanced context
      const context = {
        user,
        userContext,
        supabase: this.supabase,
        request,
        rbac: rbacManager,
      }

      // Call handler
      return await handler(request, context)
    } catch (error) {
      console.error('Enhanced API Gateway error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  private getIdentifier(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return ip
  }
}

// Export singleton instance
export const enhancedApiGateway = new EnhancedAPIGateway()

// Helper function for API routes
export function withEnhancedGateway(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  config: EnhancedGatewayConfig = {}
) {
  return async (request: NextRequest) => {
    return enhancedApiGateway.handle(request, handler, config)
  }
}

// Helper function for protected routes
export function createProtectedRoute(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return withEnhancedGateway(handler, { requireAuth: true, rateLimitTier: 'pro' })
}

// Helper function for organization routes
export function createOrganizationRoute(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return withEnhancedGateway(handler, { 
    requireAuth: true, 
    rateLimitTier: 'pro',
    organizationRequired: true 
  })
}
