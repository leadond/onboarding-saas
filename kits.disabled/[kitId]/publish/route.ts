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
import { kitPublishSchema } from '@/lib/validations/kit'

// POST /api/kits/[kitId]/publish - Publish or unpublish a kit
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
    const validatedData = kitPublishSchema.parse(body)

    // Fetch kit with steps
    const { data: kit, error: fetchError } = await supabase
      .from('kits')
      .select(
        `
        id,
        name,
        status,
        kit_steps (
          id,
          step_type,
          title,
          is_active,
          is_required,
          content
        )
      `
      )
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    // Validate kit is ready for publishing if status is being set to published
    if (validatedData.status === 'published') {
      const validationErrors: string[] = []

      // Check if kit has steps
      if (!kit.kit_steps || kit.kit_steps.length === 0) {
        validationErrors.push('Kit must have at least one step to be published')
      }

      // Check if all active steps have basic content (more lenient validation)
      kit.kit_steps?.forEach((step: any, index: number) => {
        if (!step.is_active) return

        // Basic validation - just check that steps have titles
        if (!step.title || step.title.trim() === "") {
          validationErrors.push(
            `Step ${index + 1} needs a title`
          )
        }

        // More lenient content validation - only require complex config for advanced features
        switch (step.step_type) {
          case "welcome_message":
            // Welcome message just needs instructions or can be empty for basic setup
            break
          case "welcome_video":
            // Video step can work with just instructions, video_url is optional
            break
          case "intake_form":
            // Intake form can work with basic setup, form_fields will be auto-generated if not provided
            break
          case "file_upload":
            // File upload can work with default config
            break
          case "contract_signing":
            // Contract signing can work with basic setup
            break
          case "scheduling":
            // Scheduling can work with basic setup
            break
          case "payment":
            // Payment needs at least amount and description if configured
            if (step.content?.payment_config && 
                (!step.content.payment_config.amount || !step.content.payment_config.description)) {
              validationErrors.push(
                `Step ${index + 1} (${step.title}) payment configuration needs amount and description`
              )
            }
            break
        }
      })
      if (validationErrors.length > 0) {
        return NextResponse.json(
          {
            error: 'Kit validation failed',
            details: validationErrors,
          },
          { status: 400 }
        )
      }
    }

    // Update kit status
    const { data: updatedKit, error: updateError } = await supabase
      .from('kits')
      .update({
        status: validatedData.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', kitId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating kit status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update kit status' },
        { status: 500 }
      )
    }

    // Track analytics event for publishing
    if (validatedData.status === 'published') {
      await supabase.rpc('track_kit_event', {
        p_kit_id: kitId,
        p_event_name: 'kit_published',
        p_event_data: {
          publish_message: validatedData.publish_message,
          step_count: kit.kit_steps?.length || 0,
        },
      })
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      resource_type: 'kit',
      resource_id: kitId,
      details: {
        action: validatedData.status === 'published' ? 'publish' : 'unpublish',
        kit_name: kit.name,
        previous_status: kit.status,
        new_status: validatedData.status,
        message: validatedData.publish_message,
      },
    })

    const actionText =
      validatedData.status === 'published' ? 'published' : 'unpublished'

    return NextResponse.json({
      success: true,
      data: updatedKit,
      message: `Kit ${actionText} successfully`,
    })
  } catch (error) {
    console.error('POST /api/kits/[kitId]/publish error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid publish data',
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
