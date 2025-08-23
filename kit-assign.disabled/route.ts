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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kitId, companyId, clientIds = [] } = body

      // Mock company names for the assignment
      const companyNames = {
        '1': 'Acme Corporation',
        '2': 'Global Dynamics',
        '3': 'Innovate Solutions',
        '4': 'TechStart Inc',
        '5': 'Enterprise Corp'
      }

      const mockAssignment = {
        id: Date.now().toString(),
        kit_id: kitId,
        company_id: companyId,
        company_name: companyNames[companyId as keyof typeof companyNames] || 'Unknown Company',
        client_ids: clientIds,
        assigned_at: new Date().toISOString(),
        is_active: true,
        status: 'pending',
        progress: 0,
        assigned_by: 'dev-user'
      }

      console.log('🎯 Kit assignment created:', {
        kitId,
        companyId,
        companyName: mockAssignment.company_name,
        clientCount: clientIds.length
      })

      return NextResponse.json({
        success: true,
        data: mockAssignment,
        message: 'Kit assigned successfully'
      })
    }

    const supabase = await getSupabaseClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!kitId || !companyId) {
      return NextResponse.json(
        { error: 'Kit ID and Company ID are required' },
        { status: 400 }
      )
    }

    try {
      // Check if kit exists and belongs to user
      const { data: kit, error: kitError } = await supabase
        .from('kits')
        .select('id, name')
        .eq('id', kitId)
        .eq('user_id', user.id)
        .single()

      if (kitError || !kit) {
        return NextResponse.json(
          { error: 'Kit not found or access denied' },
          { status: 404 }
        )
      }

      // Check if company exists and belongs to user
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', companyId)
        .eq('user_id', user.id)
        .single()

      if (companyError || !company) {
        return NextResponse.json(
          { error: 'Company not found or access denied' },
          { status: 404 }
        )
      }

      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from('kit_assignments')
        .select('id')
        .eq('kit_id', kitId)
        .eq('company_id', companyId)
        .single()

      if (existingAssignment) {
        return NextResponse.json(
          { error: 'Kit is already assigned to this company' },
          { status: 409 }
        )
      }

      // Create the assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('kit_assignments')
        .insert({
          kit_id: kitId,
          company_id: companyId,
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
          is_active: true,
          status: 'pending',
          progress: 0
        })
        .select(`
          *,
          companies (
            name
          )
        `)
        .single()

      if (assignmentError) {
        console.error('Assignment creation error:', assignmentError)
        return NextResponse.json(
          { error: 'Failed to create assignment' },
          { status: 500 }
        )
      }

      // If specific clients were selected, create client assignments
      if (clientIds && clientIds.length > 0) {
        const clientAssignments = clientIds.map((clientId: string) => ({
          assignment_id: assignment.id,
          client_id: clientId,
          assigned_at: new Date().toISOString(),
          status: 'pending'
        }))

        const { error: clientAssignmentError } = await supabase
          .from('client_assignments')
          .insert(clientAssignments)

        if (clientAssignmentError) {
          console.error('Client assignment error:', clientAssignmentError)
          // Don't fail the main assignment if client assignments fail
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          ...assignment,
          company_name: assignment.companies?.name || company.name
        },
        message: 'Kit assigned successfully'
      })
    } catch (error) {
      console.error('Kit assignment error:', error)
      return NextResponse.json(
        { error: 'Database not configured. Please set up your database first.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Kit assign API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Mock data for development
    const mockAssignments = [
      {
        id: '1',
        kit_id: '1',
        kit_name: 'Standard Client Onboarding',
        company_id: '1',
        company_name: 'Acme Corporation',
        assigned_at: '2024-01-15T10:30:00Z',
        is_active: true,
        status: 'in_progress',
        progress: 75
      },
      {
          id: '2',
          kit_id: '1',
          kit_name: 'Enterprise Client Onboarding',
          company_id: '2',
          company_name: 'Global Dynamics',
          assigned_at: '2024-01-16T14:20:00Z',
          is_active: true,
          status: 'completed',
          progress: 100
        },
        {
          id: '3',
          kit_id: '2',
          kit_name: 'SaaS Product Onboarding',
          company_id: '3',
          company_name: 'Innovate Solutions',
          assigned_at: '2024-01-17T11:45:00Z',
          is_active: true,
          status: 'in_progress',
          progress: 45
        }
      ]

      return NextResponse.json({
        success: true,
        data: mockAssignments
      })
    }

    const supabase = await getSupabaseClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    try {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('kit_assignments')
        .select(`
          *,
          kits (
            name
          ),
          companies (
            name
          )
        `)
        .eq('kits.user_id', user.id)
        .order('assigned_at', { ascending: false })

      if (assignmentsError) {
        console.error('Database error:', assignmentsError)
        return NextResponse.json({
          success: true,
          data: []
        })
      }

      return NextResponse.json({
        success: true,
        data: assignments || []
      })
    } catch (error) {
      console.log('Kit assignments table not found, returning empty array')
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('Kit assignments GET API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}