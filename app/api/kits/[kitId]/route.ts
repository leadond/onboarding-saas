import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { kitUpdateSchema } from '@/lib/validations/kit'
import {
  handleApiError,
  handleDatabaseError,
  createUnauthorizedErrorResponse,
  createNotFoundErrorResponse,
  createConflictErrorResponse
} from '@/lib/utils/api-error-handler'

// GET /api/kits/[kitId] - Get a specific kit with steps
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

    // Debug: Log the actual kitId value being passed
    console.log('🔍 DEBUG: Received kitId parameter:', {
      kitId: params.kitId,
      type: typeof params.kitId,
      length: params.kitId?.length
    })

    // Validate kitId parameter with graceful error handling
    const kitIdResult = z.string().uuid().safeParse(params.kitId)
    if (!kitIdResult.success) {
      console.warn('Invalid kitId parameter:', params.kitId, kitIdResult.error.errors)
      return NextResponse.json(
        {
          error: 'Invalid kit ID format. Please provide a valid UUID.',
          details: kitIdResult.error.errors
        },
        { status: 400 }
      )
    }
    const kitId = kitIdResult.data

    // Fetch kit with steps
    const { data: kit, error } = await supabase
      .from('kits')
      .select(
        `
        *,
        kit_steps (
          id,
          step_order,
          step_type,
          title,
          description,
          content,
          is_required,
          is_active,
          settings,
          conditional_logic,
          created_at,
          updated_at
        )
      `
      )
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createNotFoundErrorResponse('Kit')
      }
      return handleDatabaseError(error, 'fetch', 'Kit')
    }

    // Sort steps by order
    if (kit.kit_steps) {
      kit.kit_steps.sort((a: any, b: any) => a.step_order - b.step_order)
    }

    return NextResponse.json({
      success: true,
      data: kit,
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/kits/[kitId]')
  }
}

// PATCH /api/kits/[kitId] - Update a kit
export async function PATCH(
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

    // Debug: Log the actual kitId value being passed
    console.log('🔍 DEBUG PATCH: Received kitId parameter:', {
      kitId: params.kitId,
      type: typeof params.kitId,
      length: params.kitId?.length
    })

    // Validate kitId parameter with graceful error handling
    const kitIdResult = z.string().uuid().safeParse(params.kitId)
    if (!kitIdResult.success) {
      console.warn('Invalid kitId parameter:', params.kitId, kitIdResult.error.errors)
      return NextResponse.json(
        {
          error: 'Invalid kit ID format. Please provide a valid UUID.',
          details: kitIdResult.error.errors
        },
        { status: 400 }
      )
    }
    const kitId = kitIdResult.data

    // Parse and validate request body
    const body = await request.json()
    const validatedData = kitUpdateSchema.parse({
      ...body,
      id: kitId,
    })

    // Check if kit exists and user owns it
    const { data: existingKit, error: fetchError } = await supabase
      .from('kits')
      .select('id, slug')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingKit) {
      return createNotFoundErrorResponse('Kit')
    }

    // Handle slug update - ensure uniqueness
    const { id, steps, ...updateData } = validatedData

    if (validatedData.slug && validatedData.slug !== existingKit.slug) {
      // Check if new slug is unique
      const { data: slugCheck } = await supabase
        .from('kits')
        .select('id')
        .eq('slug', validatedData.slug)
        .neq('id', kitId)
        .single()

      if (slugCheck) {
        return createConflictErrorResponse('A kit with this slug already exists')
      }
    }

    // Update the kit
    const { data: updatedKit, error: updateError } = await supabase
      .from('kits')
      .update(updateData)
      .eq('id', kitId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return handleDatabaseError(updateError, 'update', 'Kit')
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      resource_type: 'kit',
      resource_id: kitId,
      details: {
        updated_fields: Object.keys(updateData),
        kit_name: updatedKit.name,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedKit,
      message: 'Kit updated successfully',
    })
  } catch (error) {
    return handleApiError(error, 'PATCH /api/kits/[kitId]')
  }
}

// DELETE /api/kits/[kitId] - Delete a kit
export async function DELETE(
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

    // Debug: Log the actual kitId value being passed
    console.log('🔍 DEBUG DELETE: Received kitId parameter:', {
      kitId: params.kitId,
      type: typeof params.kitId,
      length: params.kitId?.length
    })

    // Validate kitId parameter with graceful error handling
    const kitIdResult = z.string().uuid().safeParse(params.kitId)
    if (!kitIdResult.success) {
      console.warn('Invalid kitId parameter:', params.kitId, kitIdResult.error.errors)
      return NextResponse.json(
        {
          error: 'Invalid kit ID format. Please provide a valid UUID.',
          details: kitIdResult.error.errors
        },
        { status: 400 }
      )
    }
    const kitId = kitIdResult.data

    // Check if kit exists and user owns it
    const { data: kit, error: fetchError } = await supabase
      .from('kits')
      .select('id, name, status')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !kit) {
      return createNotFoundErrorResponse('Kit')
    }

    // Check if kit has active clients
    const { count: activeClients } = await supabase
      .from('client_progress')
      .select('*', { count: 'exact', head: true })
      .eq('kit_id', kitId)
      .neq('status', 'completed')

    if (activeClients && activeClients > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete kit with active clients. Please complete or archive the kit first.',
        },
        { status: 400 }
      )
    }

    // Delete the kit (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('kits')
      .delete()
      .eq('id', kitId)
      .eq('user_id', user.id)

    if (deleteError) {
      return handleDatabaseError(deleteError, 'delete', 'Kit')
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'delete',
      resource_type: 'kit',
      resource_id: kitId,
      details: { kit_name: kit.name, status: kit.status },
    })

    return NextResponse.json({
      success: true,
      message: 'Kit deleted successfully',
    })
  } catch (error) {
    return handleApiError(error, 'DELETE /api/kits/[kitId]')
  }
}
