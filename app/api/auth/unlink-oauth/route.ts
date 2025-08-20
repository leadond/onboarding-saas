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

const unlinkOAuthSchema = z.object({
  provider: z.enum(['google', 'azure'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider } = unlinkOAuthSchema.parse(body)

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

    // Get user identities first
    const { data: identities } = await supabase.auth.getUserIdentities()
    const targetProvider = provider === 'azure' ? 'azure' : 'google'
    const identity = identities?.identities?.find(id => id.provider === targetProvider)
    
    if (!identity) {
      return NextResponse.json(
        { error: `No ${provider} account linked to this user` },
        { status: 400 }
      )
    }

    // Unlink the OAuth identity
    const { error } = await supabase.auth.unlinkIdentity(identity)

    if (error) {
      console.error('OAuth unlinking error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to unlink OAuth account' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${provider} account unlinked successfully`
    })

  } catch (error) {
    console.error('Unlink OAuth error:', error)
    
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