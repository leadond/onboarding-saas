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

// GET /api/v1/organizations/[organizationId]/teams/[teamId]/members - List team members
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const { organizationId, teamId } = context.params
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

      // For now, return mock team members data
      // In a production environment, this would query the actual database
      const mockMembers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'lead',
          joinedAt: '2024-01-15T00:00:00.000Z',
          avatar_url: null
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'member',
          joinedAt: '2024-01-16T00:00:00.000Z',
          avatar_url: null
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          role: 'member',
          joinedAt: '2024-01-18T00:00:00.000Z',
          avatar_url: null
        }
      ]

      return NextResponse.json({
        success: true,
        data: mockMembers,
      })
    } catch (error) {
      console.error('Error in team members API:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/organizations/[organizationId]/teams/[teamId]/members - Add team member
export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const { organizationId, teamId } = context.params
      const body = await request.json()
      const { email, role } = body

      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

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

      // For now, return a mock created member
      // In a production environment, this would create a real team member
      const newMember = {
        id: Date.now().toString(),
        name: email.split('@')[0], // Extract name from email as placeholder
        email: email,
        role: role || 'member',
        joinedAt: new Date().toISOString(),
        avatar_url: null
      }

      return NextResponse.json({
        success: true,
        data: newMember,
      })
    } catch (error) {
      console.error('Error adding team member:', error)
      return NextResponse.json(
        { error: 'Failed to add team member' },
        { status: 500 }
      )
    }
  }
)
