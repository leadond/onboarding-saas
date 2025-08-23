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

// GET /api/v1/organizations/[organizationId]/teams - List teams
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

      // Query teams from database
      const { data: teams, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          description,
          settings,
          created_at,
          updated_at,
          created_by,
          team_members(
            id,
            role,
            user_id
          )
        `)
        .eq('organization_id', organizationId)

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch teams' },
          { status: 500 }
        )
      }

      // Transform the data to match the expected format
      const transformedTeams = teams?.map(team => {
        const memberCount = team.team_members?.length || 0
        const userMembership = team.team_members?.find(member => member.user_id === session.user.id)
        
        return {
          id: team.id,
          name: team.name,
          description: team.description,
          color: team.settings?.color || '#0066cc',
          member_count: memberCount,
          user_role: userMembership?.role || null,
          user_status: userMembership ? 'active' : null,
          created_at: team.created_at,
          updated_at: team.updated_at,
          team_lead: null // We'll need to determine this based on role
        }
      }) || []

      return NextResponse.json({
        success: true,
        data: transformedTeams,
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

      // Create the team in the database
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert({
          organization_id: organizationId,
          name: name.trim(),
          description: description?.trim() || '',
          settings: { color: color || '#0066cc' },
          created_by: session.user.id
        })
        .select()
        .single()

      if (teamError) {
        console.error('Database error creating team:', teamError)
        return NextResponse.json(
          { error: 'Failed to create team' },
          { status: 500 }
        )
      }

      // Add the creator as a team lead
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: newTeam.id,
          user_id: session.user.id,
          role: 'lead'
        })

      if (memberError) {
        console.error('Database error adding team member:', memberError)
        // Note: Team was created but member addition failed
        // In a production app, you might want to rollback the team creation
      }

      // Return the team in the expected format
      const responseTeam = {
        id: newTeam.id,
        name: newTeam.name,
        description: newTeam.description,
        color: newTeam.settings?.color || '#0066cc',
        member_count: 1,
        user_role: 'lead',
        user_status: 'active',
        created_at: newTeam.created_at,
        updated_at: newTeam.updated_at,
        team_lead: null
      }

      return NextResponse.json({
        success: true,
        data: responseTeam,
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
