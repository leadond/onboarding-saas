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
import { createProtectedRoute } from '@/lib/api/gateway'
import { getSupabaseClient } from '@/lib/supabase'

// GET /api/v1/organizations/[organizationId]/users - List users in organization
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const { organizationId } = context.params
      const supabase = await getSupabaseClient()

      // Get current user
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Query users in the organization
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, role, created_at')
        .eq('organization_id', organizationId)
        .order('full_name')

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch users' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: users || [],
      })
    } catch (error) {
      console.error('Error in users API:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }
  }
)