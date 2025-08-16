import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import type { Database, Tables } from '@/lib/supabase/database.types'
import { kitSchema, kitFilterSchema } from '@/lib/validations/kit'
import {
  handleApiError,
  handleDatabaseError,
  createUnauthorizedErrorResponse,
  createConflictErrorResponse
} from '@/lib/utils/api-error-handler'
import {
  mockKits,
  createMockApiResponse,
  simulateNetworkDelay,
  shouldUseMockData
} from '@/lib/utils/mock-data'

// GET /api/kits - List kits with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return createUnauthorizedErrorResponse()
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      status: searchParams.get('status')?.split(','),
      search: searchParams.get('search') || undefined,
      is_template: searchParams.get('is_template') === 'true',
      created_after: searchParams.get('created_after') || undefined,
      created_before: searchParams.get('created_before') || undefined,
      sort_by: searchParams.get('sort_by') || 'updated_at',
      sort_order: searchParams.get('sort_order') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    }

    const validatedParams = kitFilterSchema.parse(queryParams)

    // Build query
    let query = supabase
      .from('kits')
      .select(
        `
        *
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)

    // Apply filters
    if (validatedParams.status && validatedParams.status.length > 0) {
      query = query.in('status', validatedParams.status)
    }

    if (validatedParams.search) {
      query = query.or(
        `name.ilike.%${validatedParams.search}%,description.ilike.%${validatedParams.search}%`
      )
    }

    if (validatedParams.is_template !== undefined) {
      query = query.eq('is_template', validatedParams.is_template)
    }

    if (validatedParams.created_after) {
      query = query.gte('created_at', validatedParams.created_after)
    }

    if (validatedParams.created_before) {
      query = query.lte('created_at', validatedParams.created_before)
    }

    // Apply sorting and pagination
    query = query.order(validatedParams.sort_by, {
      ascending: validatedParams.sort_order === 'asc',
    })
    query = query.range(
      (validatedParams.page - 1) * validatedParams.limit,
      validatedParams.page * validatedParams.limit - 1
    )

    const { data: kits, error, count } = await query

    if (error) {
      // Check for schema cache issues (PGRST205) or connection problems
      if (error.code === 'PGRST205' || shouldUseMockData()) {
        console.log('🔄 Database unavailable, using mock data fallback:', error.code)
        
        // Simulate network delay for realistic behavior
        await simulateNetworkDelay(200)
        
        // Apply basic filtering to mock data
        let filteredMockKits = mockKits
        
        if (validatedParams.search) {
          const searchLower = validatedParams.search.toLowerCase()
          filteredMockKits = mockKits.filter(kit =>
            kit.name.toLowerCase().includes(searchLower) ||
            kit.description?.toLowerCase().includes(searchLower)
          )
        }
        
        if (validatedParams.status && validatedParams.status.length > 0) {
          filteredMockKits = filteredMockKits.filter(kit =>
            validatedParams.status!.includes(kit.status)
          )
        }

        // Apply pagination
        const startIndex = (validatedParams.page - 1) * validatedParams.limit
        const endIndex = startIndex + validatedParams.limit
        const paginatedKits = filteredMockKits.slice(startIndex, endIndex)

        return NextResponse.json({
          success: true,
          data: paginatedKits,
          pagination: {
            page: validatedParams.page,
            limit: validatedParams.limit,
            total: filteredMockKits.length,
            total_pages: Math.ceil(filteredMockKits.length / validatedParams.limit),
          },
          message: 'Using mock data - database temporarily unavailable',
          mock: true
        })
      }
      
      return handleDatabaseError(error, 'fetch', 'Kits')
    }

    // Calculate step counts for each kit
    const kitsWithStepCounts = await Promise.all(
      (kits || []).map(async kit => {
        const { count: stepCount } = await supabase
          .from('kit_steps')
          .select('*', { count: 'exact', head: true })
          .eq('kit_id', kit.id)

        return {
          ...kit,
          step_count: stepCount || 0,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: kitsWithStepCounts,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / validatedParams.limit),
      },
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/kits')
  }
}

// POST /api/kits - Create a new kit
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return createUnauthorizedErrorResponse()
    }

    // Check if user has reached kit limit
    const { data: hasLimit } = await supabase.rpc('user_within_kit_limit')
    if (!hasLimit) {
      return NextResponse.json(
        {
          error:
            'Kit limit reached. Please upgrade your plan to create more kits.',
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = kitSchema.parse({
      ...body,
      user_id: user.id,
    })

    // Generate unique slug if not provided
    let slug = validatedData.slug
    if (!slug) {
      const { data: generatedSlug } = await supabase.rpc(
        'generate_unique_slug',
        {
          name: validatedData.name,
        }
      )
      slug =
        generatedSlug ||
        validatedData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }

    // Create the kit
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        slug,
        description: validatedData.description,
        welcome_message: validatedData.welcome_message,
        brand_color: validatedData.brand_color,
        logo_url: validatedData.logo_url,
        status: validatedData.status,
        is_template: validatedData.is_template,
        completion_redirect_url: validatedData.completion_redirect_url,
        custom_domain: validatedData.custom_domain,
        seo_title: validatedData.seo_title,
        seo_description: validatedData.seo_description,
        analytics_enabled: validatedData.analytics_enabled,
        password_protected: validatedData.password_protected,
        password_hash: validatedData.password_hash,
      })
      .select()
      .single()

    if (kitError) {
      if (kitError.code === '23505') {
        return createConflictErrorResponse('A kit with this name already exists')
      }
      return handleDatabaseError(kitError, 'create', 'Kit')
    }

    // Create steps if provided
    if (validatedData.steps && validatedData.steps.length > 0) {
      const stepsToInsert = validatedData.steps.map((step, index) => ({
        kit_id: kit.id,
        step_order: step.step_order ?? index,
        step_type: step.step_type,
        title: step.title,
        description: step.description,
        content: step.content,
        is_required: step.is_required,
        is_active: step.is_active,
        settings: step.settings,
        conditional_logic: step.conditional_logic,
      }))

      const { error: stepsError } = await supabase
        .from('kit_steps')
        .insert(stepsToInsert)

      if (stepsError) {
        console.error('Error creating kit steps:', stepsError)
        // Don't fail the entire request if steps fail, but log it
      }
    }

    // Track usage
    await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_resource_type: 'kits',
      p_resource_id: kit.id,
      p_usage_count: 1,
    })

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create',
      resource_type: 'kit',
      resource_id: kit.id,
      details: { kit_name: kit.name, status: kit.status },
    })

    return NextResponse.json(
      {
        success: true,
        data: kit,
        message: 'Kit created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, 'POST /api/kits')
  }
}
