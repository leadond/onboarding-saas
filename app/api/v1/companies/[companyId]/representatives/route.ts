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
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createProtectedRoute } from '@/lib/api/enhanced-gateway'

const createRepresentativeSchema = z.object({
  first_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  full_name: z.string().max(255).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  mobile_phone: z.string().max(50).optional().nullable(),
  job_title: z.string().max(150).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  preferred_contact_method: z.enum(['email', 'phone', 'mobile', 'video_call']).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  availability: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  is_primary: z.boolean().default(false),
  can_approve: z.boolean().default(false),
  can_view_pricing: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
})

const updateRepresentativeSchema = createRepresentativeSchema.partial()

// GET /api/v1/companies/[companyId]/representatives - List representatives for a company
export const GET = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId } = context.params
    const supabase = await createClient()
    
    try {
      // Get query parameters
      const url = new URL(request.url)
      const limit = parseInt(url.searchParams.get('limit') || '100')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      
      // Verify user has access to the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .eq('created_by', user.id)
        .single()
      
      if (companyError || !company) {
        return NextResponse.json(
          { success: false, error: 'Not found', message: 'Company not found' },
          { status: 404 }
        )
      }
      
      // Get representatives for the company
      const { data: representatives, error } = await supabase
        .from('company_representatives')
        .select('*')
        .eq('company_id', companyId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching representatives:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to fetch representatives' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: representatives,
        count: representatives.length
      })
    } catch (error) {
      console.error('Get representatives error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to fetch representatives' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/companies/[companyId]/representatives - Create new representative
export const POST = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId } = context.params
    const supabase = await createClient()
    
    try {
      // Verify user has access to the company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .eq('created_by', user.id)
        .single()
      
      if (companyError || !company) {
        return NextResponse.json(
          { success: false, error: 'Not found', message: 'Company not found' },
          { status: 404 }
        )
      }
      
      const body = await request.json()
      const validatedData = createRepresentativeSchema.parse(body)
      
      // Create representative
      const { data: representative, error } = await supabase
        .from('company_representatives')
        .insert({
          ...validatedData,
          company_id: companyId,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating representative:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to create representative' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: representative,
        message: 'Representative created successfully'
      }, { status: 201 })
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: 'Invalid representative data',
            details: error.errors
          },
          { status: 400 }
        )
      }
      
      console.error('Create representative error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to create representative' },
        { status: 500 }
      )
    }
  }
)