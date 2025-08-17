import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { stepUpdateSchema } from '@/lib/validations/kit'

// GET /api/kits/[kitId]/steps/[stepId] - Get a specific step
export async function GET(
  request: NextRequest,
  { params }: { params: { kitId: string; stepId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate parameters
    const kitId = z.string().uuid().parse(params.kitId)
    const stepId = z.string().uuid().parse(params.stepId)

    // Verify kit ownership and fetch step
    const { data: step, error } = await supabase
      .from('kit_steps')
      .select(
        `
        *,
        kits!inner (
          id,
          user_id
        )
      `
      )
      .eq('id', stepId)
      .eq('kit_id', kitId)
      .eq('kits.user_id', user.id)
      .single()

    if (error || !step) {
      if (error?.code === 'PGRST116') {
        // No rows found
        return NextResponse.json({ error: 'Step not found' }, { status: 404 })
      }
      console.error('Error fetching step:', error)
      return NextResponse.json(
        { error: 'Failed to fetch step' },
        { status: 500 }
      )
    }

    // Remove the nested kits object from response
    const { kits, ...stepData } = step

    return NextResponse.json({
      success: true,
      data: stepData,
    })
  } catch (error) {
    console.error('GET /api/kits/[kitId]/steps/[stepId] error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
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

// PATCH /api/kits/[kitId]/steps/[stepId] - Update a step
export async function PATCH(
  request: NextRequest,
  { params }: { params: { kitId: string; stepId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate parameters
    const kitId = z.string().uuid().parse(params.kitId)
    const stepId = z.string().uuid().parse(params.stepId)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = stepUpdateSchema.parse({
      ...body,
      id: stepId,
    })

    // Verify step exists and user owns the kit
    const { data: existingStep, error: fetchError } = await supabase
      .from('kit_steps')
      .select(
        `
        id,
        title,
        step_order,
        kits!inner (
          id,
          user_id,
          name
        )
      `
      )
      .eq('id', stepId)
      .eq('kit_id', kitId)
      .eq('kits.user_id', user.id)
      .single()

    if (fetchError || !existingStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Prepare update data
    const { id, ...updateData } = validatedData

    // Handle step order conflicts if order is being changed
    if (
      updateData.step_order !== undefined &&
      updateData.step_order !== existingStep.step_order
    ) {
      // Check if another step already has this order
      const { data: conflictingStep } = await supabase
        .from('kit_steps')
        .select('id')
        .eq('kit_id', kitId)
        .eq('step_order', updateData.step_order)
        .neq('id', stepId)
        .single()

      if (conflictingStep) {
        // Shift other steps to make room
        // Fetch all steps to reorder manually
        const { data: allSteps } = await supabase
          .from('kit_steps')
          .select('id, step_order')
          .eq('kit_id', kitId)
          .order('step_order')

        if (allSteps) {
          const updates = []
          if (updateData.step_order > existingStep.step_order) {
            // Moving down - shift steps up
            for (const step of allSteps) {
              if (
                step.step_order > existingStep.step_order &&
                step.step_order <= updateData.step_order &&
                step.id !== stepId
              ) {
                updates.push({ id: step.id, step_order: step.step_order - 1 })
              }
            }
          } else {
            // Moving up - shift steps down
            for (const step of allSteps) {
              if (
                step.step_order >= updateData.step_order &&
                step.step_order < existingStep.step_order &&
                step.id !== stepId
              ) {
                updates.push({ id: step.id, step_order: step.step_order + 1 })
              }
            }
          }

          // Apply updates
          for (const update of updates) {
            await supabase
              .from('kit_steps')
              .update({ step_order: update.step_order })
              .eq('id', update.id)
          }
        }
      }
    }

    // Update the step
    const { data: updatedStep, error: updateError } = await supabase
      .from('kit_steps')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating step:', updateError)
      return NextResponse.json(
        { error: 'Failed to update step' },
        { status: 500 }
      )
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      resource_type: 'step',
      resource_id: stepId,
      details: {
        updated_fields: Object.keys(updateData),
        step_title: updatedStep.title,
        kit_id: kitId,
        kit_name: existingStep.kits.name,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedStep,
      message: 'Step updated successfully',
    })
  } catch (error) {
    console.error('PATCH /api/kits/[kitId]/steps/[stepId] error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid step data',
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

// DELETE /api/kits/[kitId]/steps/[stepId] - Delete a step
export async function DELETE(
  request: NextRequest,
  { params }: { params: { kitId: string; stepId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate parameters
    const kitId = z.string().uuid().parse(params.kitId)
    const stepId = z.string().uuid().parse(params.stepId)

    // Verify step exists and user owns the kit
    const { data: step, error: fetchError } = await supabase
      .from('kit_steps')
      .select(
        `
        id,
        title,
        step_order,
        kits!inner (
          id,
          user_id,
          name,
          status
        )
      `
      )
      .eq('id', stepId)
      .eq('kit_id', kitId)
      .eq('kits.user_id', user.id)
      .single()

    if (fetchError || !step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Check if kit is published - warn about deleting steps from published kits
    if (step.kits.status === 'published') {
      // Allow deletion but warn that it might affect active clients
      const { count: activeClients } = await supabase
        .from('client_progress')
        .select('*', { count: 'exact', head: true })
        .eq('step_id', stepId)
        .neq('status', 'completed')

      if (activeClients && activeClients > 0) {
        return NextResponse.json(
          {
            error:
              'Cannot delete step with active clients. Please wait for clients to complete or manually move them to another step.',
          },
          { status: 400 }
        )
      }
    }

    // Delete the step
    const { error: deleteError } = await supabase
      .from('kit_steps')
      .delete()
      .eq('id', stepId)

    if (deleteError) {
      console.error('Error deleting step:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete step' },
        { status: 500 }
      )
    }

    // Reorder remaining steps to fill gap
    const { data: stepsToReorder } = await supabase
      .from('kit_steps')
      .select('id, step_order')
      .eq('kit_id', kitId)
      .gt('step_order', step.step_order)

    if (stepsToReorder) {
      for (const stepToReorder of stepsToReorder) {
        await supabase
          .from('kit_steps')
          .update({ step_order: stepToReorder.step_order - 1 })
          .eq('id', stepToReorder.id)
      }
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'delete',
      resource_type: 'step',
      resource_id: stepId,
      details: {
        step_title: step.title,
        step_order: step.step_order,
        kit_id: kitId,
        kit_name: step.kits.name,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Step deleted successfully',
    })
  } catch (error) {
    console.error('DELETE /api/kits/[kitId]/steps/[stepId] error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
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
