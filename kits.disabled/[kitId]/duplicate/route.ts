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
import { kitDuplicateSchema } from '@/lib/validations/kit'

// POST /api/kits/[kitId]/duplicate - Duplicate a kit
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

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = kitDuplicateSchema.parse(body)

    // Fetch original kit with steps
    const { data: originalKit, error: fetchError } = await supabase
      .from('kits')
      .select(
        `
        *,
        kit_steps (*)
      `
      )
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !originalKit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    // Generate unique slug for duplicate
    const { data: generatedSlug } = await supabase.rpc('generate_unique_slug', {
      name: validatedData.name,
    })
    const slug =
      generatedSlug ||
      validatedData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')

    // Create duplicate kit
    const duplicateKitData = {
      user_id: user.id,
      name: validatedData.name,
      slug,
      description: validatedData.copy_settings ? originalKit.description : null,
      welcome_message: validatedData.copy_settings
        ? originalKit.welcome_message
        : null,
      brand_color: validatedData.copy_settings
        ? originalKit.brand_color
        : '#3B82F6',
      logo_url: validatedData.copy_settings ? originalKit.logo_url : null,
      status: 'draft' as const, // Always start as draft
      is_template: false, // Duplicates are never templates
      completion_redirect_url: validatedData.copy_settings
        ? originalKit.completion_redirect_url
        : null,
      custom_domain: null, // Never copy custom domain
      seo_title: validatedData.copy_settings ? originalKit.seo_title : null,
      seo_description: validatedData.copy_settings
        ? originalKit.seo_description
        : null,
      analytics_enabled: validatedData.copy_settings
        ? originalKit.analytics_enabled
        : true,
      password_protected: validatedData.copy_settings
        ? originalKit.password_protected
        : false,
      password_hash: validatedData.copy_settings
        ? originalKit.password_hash
        : null,
    }

    const { data: newKit, error: createError } = await supabase
      .from('kits')
      .insert(duplicateKitData)
      .select()
      .single()

    if (createError) {
      console.error('Error creating duplicate kit:', createError)
      if (createError.code === '23505') {
        // Unique constraint violation
        return NextResponse.json(
          {
            error: 'A kit with this name already exists',
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create duplicate kit' },
        { status: 500 }
      )
    }

    // Duplicate steps if requested
    if (
      validatedData.include_steps &&
      originalKit.kit_steps &&
      originalKit.kit_steps.length > 0
    ) {
      const stepsToInsert = originalKit.kit_steps.map((step: any) => ({
        kit_id: newKit.id,
        step_order: step.step_order,
        step_type: step.step_type,
        title: step.title,
        description: step.description,
        content: step.content,
        is_required: step.is_required,
        is_active: step.is_active,
        settings: validatedData.copy_settings ? step.settings : {},
        conditional_logic: validatedData.copy_settings
          ? step.conditional_logic
          : {},
      }))

      const { error: stepsError } = await supabase
        .from('kit_steps')
        .insert(stepsToInsert)

      if (stepsError) {
        console.error('Error duplicating kit steps:', stepsError)
        // Don't fail the entire request, but log it
      }
    }

    // Track usage
    await supabase.rpc('track_usage', {
      p_user_id: user.id,
      p_resource_type: 'kits',
      p_resource_id: newKit.id,
      p_usage_count: 1,
    })

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create',
      resource_type: 'kit',
      resource_id: newKit.id,
      details: {
        source: 'duplicate',
        original_kit_id: kitId,
        original_kit_name: originalKit.name,
        new_kit_name: newKit.name,
        include_steps: validatedData.include_steps,
        copy_settings: validatedData.copy_settings,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: newKit,
        message: 'Kit duplicated successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/kits/[kitId]/duplicate error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid duplication data',
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
