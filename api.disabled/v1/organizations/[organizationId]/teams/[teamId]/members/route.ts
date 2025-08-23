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

      // Query actual team members from database
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          joined_at,
          user:users(
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('team_id', teamId)

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch team members' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: members || [],
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
      const { user_id, email, role } = body

      // Accept either user_id or email
      if (!user_id && !email) {
        return NextResponse.json(
          { error: 'Either user_id or email is required' },
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

      let targetUserId = user_id

      // If email provided instead of user_id, find the user
      if (!targetUserId && email) {
        console.log('Looking up user by email:', email)
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('email', email.toLowerCase().trim())
          .single()

        console.log('User lookup result:', { user, userError })

        if (userError || !user) {
          console.log('User not found, error:', userError)
          return NextResponse.json(
            { error: `User not found with email: ${email}. Make sure the user has an account in this organization.` },
            { status: 404 }
          )
        }
        targetUserId = user.id
        console.log('Found user:', user.full_name, 'with ID:', targetUserId)
      }

      // Check if user is already a team member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', targetUserId)
        .single()

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a member of this team' },
          { status: 409 }
        )
      }

      // Add the team member
      console.log('Inserting team member:', { team_id: teamId, user_id: targetUserId, role: role || 'member' })
      
      const { data: newMember, error: insertError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: targetUserId,
          role: role || 'member'
        })
        .select(`
          id,
          role,
          joined_at,
          user:users(
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .single()

      console.log('Insert result:', { newMember, insertError })

      if (insertError) {
        console.error('Database error inserting team member:', insertError)
        return NextResponse.json(
          { error: `Failed to add team member: ${insertError.message}` },
          { status: 500 }
        )
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
