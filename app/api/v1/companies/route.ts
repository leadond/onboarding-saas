import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { createProtectedRoute } from '@/lib/api/enhanced-gateway'

const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
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
})

const updateCompanySchema = createCompanySchema.partial()

// GET /api/v1/companies - List companies
export const GET = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const supabase = await createClient()
    
    try {
      // Get query parameters
      const url = new URL(request.url)
      const limit = parseInt(url.searchParams.get('limit') || '100')
      const offset = parseInt(url.searchParams.get('offset') || '0')
      
      // Get companies that the user has access to
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by', user.id)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching companies:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to fetch companies' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: companies,
        count: companies.length
      })
    } catch (error) {
      console.error('Get companies error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to fetch companies' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/companies - Create new company
export const POST = createProtectedRoute(
  async (request: NextRequest, context) => {
    const { user } = context
    const supabase = await createClient()
    
    try {
      const body = await request.json()
      const validatedData = createCompanySchema.parse(body)
      
      // Create company
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          ...validatedData,
          created_by: user.id,
          updated_by: user.id
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating company:', error)
        return NextResponse.json(
          { success: false, error: 'Database error', message: 'Failed to create company' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: company,
        message: 'Company created successfully'
      }, { status: 201 })
      
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
      
      console.error('Create company error:', error)
      return NextResponse.json(
        { success: false, error: 'Internal server error', message: 'Failed to create company' },
        { status: 500 }
      )
    }
  }
)