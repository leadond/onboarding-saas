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
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createProtectedRoute } from '@/lib/api/enhanced-gateway'

const createOrganizationSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  industry: z.string().max(100).optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional(),
  website_url: z.string().url().optional()
})

// GET /api/v1/organizations - List user's organizations
export const GET = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { userContext } = context

    try {
      return NextResponse.json({
        success: true,
        data: userContext.organizations.map(org => ({
          id: org.organization_id,
          name: org.organization.name,
          slug: org.organization.slug,
          description: org.organization.description,
          industry: org.organization.industry,
          company_size: org.organization.company_size,
          subscription_tier: org.organization.subscription_tier,
          subscription_status: org.organization.subscription_status,
          role: org.role,
          status: org.status,
          member_count: 0, // TODO: Add member count
          created_at: org.organization.created_at
        }))
      })
    } catch (error) {
      console.error('Get organizations error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'Failed to fetch organizations'
        },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/organizations - Create new organization
export const POST = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const supabase = await createClient()

    try {
      const body = await request.json()
      const validatedData = createOrganizationSchema.parse(body)

      // Check if slug is available
      const { data: existingOrg, error: slugError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', validatedData.slug)
        .single()

      if (existingOrg) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: 'Organization slug already exists'
          },
          { status: 400 }
        )
      }

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          ...validatedData,
          created_by: user.id
        })
        .select()
        .single()

      if (orgError) {
        throw new Error('Failed to create organization')
      }

      // Add user as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          joined_at: new Date().toISOString()
        })

      if (memberError) {
        // Rollback organization creation
        await supabase.from('organizations').delete().eq('id', organization.id)
        throw new Error('Failed to add user as organization owner')
      }

      return NextResponse.json({
        success: true,
        data: organization,
        message: 'Organization created successfully'
      }, { status: 201 })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: 'Invalid organization data',
            details: error.errors
          },
          { status: 400 }
        )
      }

      console.error('Create organization error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'Failed to create organization'
        },
        { status: 500 }
      )
    }
  }
)