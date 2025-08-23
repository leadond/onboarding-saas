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

import { getSupabaseClient } from '@/lib/supabase'
import { stepReorderSchema } from '@/lib/validations/kit'

// POST /api/kits/[kitId]/steps/reorder - Reorder steps in a kit
export async function POST(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const supabase = await getSupabaseClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = stepReorderSchema.parse(body)

    // Verify kit ownership
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('id, name, user_id')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    // Verify all step IDs belong to this kit
    const stepIds = validatedData.step_orders.map(item => item.id)
    const { data: existingSteps, error: stepsError } = await supabase
      .from('kit_steps')
      .select('id')
      .eq('kit_id', kitId)
      .in('id', stepIds)

    if (
      stepsError ||
      !existingSteps ||
      existingSteps.length !== stepIds.length
    ) {
      return NextResponse.json(
        {
          error: 'One or more steps not found or do not belong to this kit',
        },
        { status: 400 }
      )
    }

    // Validate step orders are sequential starting from 0
    const orders = validatedData.step_orders
      .map(item => item.step_order)
      .sort((a, b) => a - b)
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i) {
        return NextResponse.json(
          {
            error: 'Step orders must be sequential starting from 0',
          },
          { status: 400 }
        )
      }
    }

    // Perform batch update of step orders
    const updatePromises = validatedData.step_orders.map(({ id, step_order }) =>
      supabase
        .from('kit_steps')
        .update({
          step_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('kit_id', kitId)
    )

    const updateResults = await Promise.all(updatePromises)

    // Check if any updates failed
    const failedUpdates = updateResults.filter(result => result.error)
    if (failedUpdates.length > 0) {
      console.error('Error updating step orders:', failedUpdates)
      return NextResponse.json(
        {
          error: 'Failed to update some step orders',
          details: failedUpdates.map(result => result.error),
        },
        { status: 500 }
      )
    }

    // Fetch updated steps to return
    const { data: updatedSteps, error: fetchError } = await supabase
      .from('kit_steps')
      .select('*')
      .eq('kit_id', kitId)
      .order('step_order', { ascending: true })

    if (fetchError) {
      console.error('Error fetching updated steps:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch updated steps' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      resource_type: 'kit',
      resource_id: kitId,
      details: {
        action: 'reorder_steps',
        kit_name: kit.name,
        step_count: validatedData.step_orders.length,
        new_order: validatedData.step_orders.map(item => ({
          step_id: item.id,
          new_order: item.step_order,
        })),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedSteps,
      message: 'Steps reordered successfully',
    })
  } catch (error) {
    console.error('POST /api/kits/[kitId]/steps/reorder error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid reorder data',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
