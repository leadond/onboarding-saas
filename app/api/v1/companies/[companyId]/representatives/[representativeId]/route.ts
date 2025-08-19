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

const updateRepresentativeSchema = z.object({
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
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  is_primary: z.boolean().optional(),
  can_approve: z.boolean().optional(),
  can_view_pricing: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
}).partial()

// GET /api/v1/companies/[companyId]/representatives/[representativeId] - Get representative by ID
export const GET = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId, representativeId } = context.params
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
      
      // Get representative
      const { data: representative, error } = await supabase
        .from('company_representatives')
        .select('*')
        .eq('id', representativeId)
        .eq('company_id', companyId)
        .single()
      
      if (error) {
        console.error('Error fetching representative:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to fetch representative' },
          { status: 500 }
        )
      }
      
      if (!representative) {
        return NextResponse.json(
          { success: false, error: 'Not found', message: 'Representative not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: representative
      })
    } catch (error) {
      console.error('Get representative error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to fetch representative' },
        { status: 500 }
      )
    }
  }
)

// PUT /api/v1/companies/[companyId]/representatives/[representativeId] - Update representative
export const PUT = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId, representativeId } = context.params
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
      const validatedData = updateRepresentativeSchema.parse(body)
      
      // Update representative
      const { data: representative, error } = await supabase
        .from('company_representatives')
        .update({
          ...validatedData,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', representativeId)
        .eq('company_id', companyId)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating representative:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to update representative' },
          { status: 500 }
        )
      }
      
      if (!representative) {
        return NextResponse.json(
          { success: false, error: 'Not found', message: 'Representative not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: representative,
        message: 'Representative updated successfully'
      })
      
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
      
      console.error('Update representative error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to update representative' },
        { status: 500 }
      )
    }
  }
)

// DELETE /api/v1/companies/[companyId]/representatives/[representativeId] - Delete representative
export const DELETE = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId, representativeId } = context.params
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
      
      // Delete representative
      const { error } = await supabase
        .from('company_representatives')
        .delete()
        .eq('id', representativeId)
        .eq('company_id', companyId)
      
      if (error) {
        console.error('Error deleting representative:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to delete representative' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Representative deleted successfully'
      })
      
    } catch (error) {
      console.error('Delete representative error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to delete representative' },
        { status: 500 }
      )
    }
  }
)