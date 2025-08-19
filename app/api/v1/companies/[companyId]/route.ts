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

const updateCompanySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  legal_name: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional().nullable(),
  founded_year: z.number().int().min(1800).max(2100).optional().nullable(),
  employee_count: z.number().int().min(0).optional().nullable(),
  street_address: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state_province: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  support_email: z.string().email().optional().nullable(),
  linkedin_url: z.string().url().optional().nullable(),
  twitter_url: z.string().url().optional().nullable(),
  facebook_url: z.string().url().optional().nullable(),
  tax_id: z.string().max(50).optional().nullable(),
  vat_number: z.string().max(50).optional().nullable(),
  duns_number: z.string().max(50).optional().nullable(),
}).partial()

// GET /api/v1/companies/[companyId] - Get company by ID
export const GET = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId } = context.params
    const supabase = await createClient()
    
    try {
      // Get company that the user has access to
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .eq('created_by', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching company:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to fetch company' },
          { status: 500 }
        )
      }
      
      if (!company) {
        return NextResponse.json(
          { success: false, error: 'Not found', message: 'Company not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: company
      })
    } catch (error) {
      console.error('Get company error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to fetch company' },
        { status: 500 }
      )
    }
  }
)

// PUT /api/v1/companies/[companyId] - Update company
export const PUT = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId } = context.params
    const supabase = await createClient()
    
    try {
      const body = await request.json()
      const validatedData = updateCompanySchema.parse(body)
      
      // Update company
      const { data: company, error } = await supabase
        .from('companies')
        .update({
          ...validatedData,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .eq('created_by', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating company:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to update company' },
          { status: 500 }
        )
      }
      
      if (!company) {
        return NextResponse.json(
          { success: false, error: 'Not found', message: 'Company not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: company,
        message: 'Company updated successfully'
      })
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            message: 'Invalid company data',
            details: error.errors
          },
          { status: 400 }
        )
      }
      
      console.error('Update company error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to update company' },
        { status: 500 }
      )
    }
  }
)

// DELETE /api/v1/companies/[companyId] - Delete company
export const DELETE = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const { companyId } = context.params
    const supabase = await createClient()
    
    try {
      // Delete company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)
        .eq('created_by', user.id)
      
      if (error) {
        console.error('Error deleting company:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to delete company' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Company deleted successfully'
      })
      
    } catch (error) {
      console.error('Delete company error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to delete company' },
        { status: 500 }
      )
    }
  }
)