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
import { createClient } from '@/lib/supabase/server'

// GET /api/v1/organizations/[organizationId]/teams - List teams
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const { organizationId } = context.params
      const supabase = await createClient()

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

      // For now, we'll use a simplified approach without the RPC functions
      // In a production environment, you'd want to add proper permission checking here
      
      // Mock teams data for now - we'll replace this with real data once we fix the schema
      const mockTeams = [
        {
          id: '1',
          name: 'Development Team',
          description: 'Frontend and backend development',
          color: '#10B981',
          memberCount: 3,
          role: 'lead',
          createdAt: '2024-01-15T00:00:00.000Z',
          isTeamLead: true
        },
        {
          id: '2',
          name: 'Design Team',
          description: 'UI/UX design and branding',
          color: '#3B82F6',
          memberCount: 2,
          role: 'member',
          createdAt: '2024-01-10T00:00:00.000Z',
          isTeamLead: false
        }
      ]

      return NextResponse.json({
        success: true,
        data: mockTeams,
      })
    } catch (error) {
      console.error('Error in teams API:', error)
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/organizations/[organizationId]/teams - Create a new team
export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const { organizationId } = context.params
      const body = await request.json()
      const { name, description, color } = body

      if (!name) {
        return NextResponse.json(
          { error: 'Team name is required' },
          { status: 400 }
        )
      }

      const supabase = await createClient()

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

      // For now, return a mock created team
      // Once the database schema is properly set up, we'll replace this with real database operations
      const newTeam = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description?.trim() || '',
        color: color || '#0066cc',
        memberCount: 1,
        role: 'lead',
        createdAt: new Date().toISOString(),
        isTeamLead: true
      }

      return NextResponse.json({
        success: true,
        data: newTeam,
      })
    } catch (error) {
      console.error('Error creating team:', error)
      return NextResponse.json(
        { error: 'Failed to create team' },
        { status: 500 }
      )
    }
  }
)
