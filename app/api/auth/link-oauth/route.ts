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
import { getSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const linkOAuthSchema = z.object({
  provider: z.enum(['google', 'azure'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider } = linkOAuthSchema.parse(body)

    // Create Supabase client
    const supabase = await getSupabaseClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Generate OAuth URL for linking
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : (process.env.NEXT_PUBLIC_APP_URL || 'https://onboard.devapphero.com')

    const { data, error } = await supabase.auth.linkIdentity({
      provider: provider === 'azure' ? 'azure' : 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback?link=true`,
      }
    })

    if (error) {
      console.error('OAuth linking error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to initiate OAuth linking' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      url: data.url
    })

  } catch (error) {
    console.error('Link OAuth error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}