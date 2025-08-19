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

// GET /api/kits/[kitId]/settings - Get kit settings
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Verify kit ownership and get settings
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('*')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    // Structure the settings response using actual database fields
    const settings = {
      basic: {
        name: kit.name,
        description: kit.description,
        slug: kit.slug,
        status: kit.status,
      },
      branding: {
        logo_url: kit.logo_url,
        primary_color: kit.brand_color || '#3b82f6',
        secondary_color: '#64748b', // Default value since field doesn't exist
        font_family: 'Inter', // Default value since field doesn't exist
      },
      analytics: {
        enabled: kit.analytics_enabled || false,
      },
      notifications: {
        enabled: false, // Default since field doesn't exist
        email_notifications: [],
        sms_notifications: false,
        webhook_url: null,
        webhook_events: [],
      },
      security: {
        password_protected: kit.password_protected || false,
        require_authentication: false, // Default since field doesn't exist
        allowed_domains: [],
        access_restrictions: {},
        session_timeout: 3600,
        max_attempts: 3,
      },
      advanced: {
        custom_domain: null,
        completion_redirect_url: null,
        custom_css: null,
        custom_js: null,
      },
      seo: {
        meta_title: null,
        meta_description: kit.description,
        social_image_url: null,
      },
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('GET /api/kits/[kitId]/settings error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid kit ID',
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

// PUT /api/kits/[kitId]/settings - Update kit settings
export async function PUT(
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const settingsSchema = z.object({
      basic: z.object({
        name: z.string().min(1, 'Kit name is required').max(100),
        description: z.string().max(500).optional(),
        slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
      }).optional(),
      branding: z.object({
        logo_url: z.string().url().optional().or(z.literal('')),
        primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
        secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
        font_family: z.string().max(50).optional(),
      }).optional(),
      analytics: z.object({
        enabled: z.boolean(),
      }).optional(),
      notifications: z.object({
        enabled: z.boolean(),
        email_notifications: z.array(z.string()).optional(),
        sms_notifications: z.boolean().optional(),
        webhook_url: z.string().url().optional().or(z.literal('')),
        webhook_events: z.array(z.string()).optional(),
      }).optional(),
      security: z.object({
        password_protected: z.boolean(),
        password: z.string().min(6).optional(),
        require_authentication: z.boolean().optional(),
        allowed_domains: z.array(z.string()).optional(),
        session_timeout: z.number().min(300).max(86400).optional(),
        max_attempts: z.number().min(1).max(10).optional(),
      }).optional(),
      advanced: z.object({
        custom_domain: z.string().optional().or(z.literal('')),
        completion_redirect_url: z.string().url().optional().or(z.literal('')),
        custom_css: z.string().optional(),
        custom_js: z.string().optional(),
      }).optional(),
      seo: z.object({
        meta_title: z.string().max(60).optional(),
        meta_description: z.string().max(160).optional(),
        social_image_url: z.string().url().optional().or(z.literal('')),
      }).optional(),
    })

    const validatedData = settingsSchema.parse(body)

    // Build update object
    const updateData: any = {}

    if (validatedData.basic) {
      updateData.name = validatedData.basic.name
      updateData.description = validatedData.basic.description
      updateData.slug = validatedData.basic.slug
    }

    if (validatedData.branding) {
      updateData.logo_url = validatedData.branding.logo_url
      updateData.brand_color = validatedData.branding.primary_color
      // Note: secondary_color and font_family not supported in current schema
    }

    if (validatedData.analytics) {
      updateData.analytics_enabled = validatedData.analytics.enabled
    }

    if (validatedData.security) {
      updateData.password_protected = validatedData.security.password_protected
      // Note: other security fields not supported in current schema
    }

    // Note: notifications, advanced, and seo sections not supported in current schema

    // Check if slug is unique (if being updated)
    if (validatedData.basic?.slug && validatedData.basic.slug !== kit.name) {
      const { data: existingKit } = await supabase
        .from('kits')
        .select('id')
        .eq('slug', validatedData.basic.slug)
        .eq('user_id', user.id)
        .neq('id', kitId)
        .single()

      if (existingKit) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
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
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update kit settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedKit,
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('PUT /api/kits/[kitId]/settings error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid settings data',
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