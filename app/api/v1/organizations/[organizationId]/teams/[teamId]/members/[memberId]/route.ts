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

// DELETE /api/v1/organizations/[organizationId]/teams/[teamId]/members/[memberId] - Remove team member
export const DELETE = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const { organizationId, teamId, memberId } = context.params
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

      // Check if the member exists
      const { data: member, error: memberError } = await supabase
        .from('team_members')
        .select('id, user_id')
        .eq('id', memberId)
        .eq('team_id', teamId)
        .single()

      if (memberError || !member) {
        return NextResponse.json(
          { error: 'Team member not found' },
          { status: 404 }
        )
      }

      // Remove the team member
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)
        .eq('team_id', teamId)

      if (deleteError) {
        console.error('Database error:', deleteError)
        return NextResponse.json(
          { error: 'Failed to remove team member' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Team member removed successfully'
      })
    } catch (error) {
      console.error('Error removing team member:', error)
      return NextResponse.json(
        { error: 'Failed to remove team member' },
        { status: 500 }
      )
    }
  }
)