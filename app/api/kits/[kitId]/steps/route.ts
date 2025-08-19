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

import { createClient } from '@/lib/supabase/server'
import { kitStepSchema } from '@/lib/validations/kit'
import {
  handleApiError,
  handleDatabaseError,
  createUnauthorizedErrorResponse,
  createNotFoundErrorResponse,
  createConflictErrorResponse
} from '@/lib/utils/api-error-handler'

// GET /api/kits/[kitId]/steps - List steps for a kit
export async function GET(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return createUnauthorizedErrorResponse()
    }

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Verify kit ownership
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('id')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return createNotFoundErrorResponse('Kit')
    }

    // Fetch steps
    const { data: steps, error } = await supabase
      .from('kit_steps')
      .select('*')
      .eq('kit_id', kitId)
      .order('step_order', { ascending: true })

    if (error) {
      return handleDatabaseError(error, 'fetch', 'Steps')
    }

    return NextResponse.json({
      success: true,
      data: steps || [],
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/kits/[kitId]/steps')
  }
}

// POST /api/kits/[kitId]/steps - Create a new step
export async function POST(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return createUnauthorizedErrorResponse()
    }

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Verify kit ownership
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('id, name')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return createNotFoundErrorResponse('Kit')
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = kitStepSchema.parse({
      ...body,
      kit_id: kitId,
    })

    // If step_order not provided, add to end
    if (validatedData.step_order === undefined) {
      const { count } = await supabase
        .from('kit_steps')
        .select('*', { count: 'exact', head: true })
        .eq('kit_id', kitId)

      validatedData.step_order = count || 0
    }

    // Create the step
    const { data: step, error: createError } = await supabase
      .from('kit_steps')
      .insert({
        kit_id: kitId,
        step_order: validatedData.step_order,
        step_type: validatedData.step_type,
        title: validatedData.title,
        description: validatedData.description,
        content: validatedData.content,
        is_required: validatedData.is_required,
        is_active: validatedData.is_active,
        settings: validatedData.settings,
        conditional_logic: validatedData.conditional_logic,
      })
      .select()
      .single()

    if (createError) {
      if (createError.code === '23505') {
        return createConflictErrorResponse('A step with this order already exists')
      }
      return handleDatabaseError(createError, 'create', 'Step')
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create',
      resource_type: 'step',
      resource_id: step.id,
      details: {
        step_title: step.title,
        step_type: step.step_type,
        kit_id: kitId,
        kit_name: kit.name,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: step,
        message: 'Step created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error, 'POST /api/kits/[kitId]/steps')
  }
}
