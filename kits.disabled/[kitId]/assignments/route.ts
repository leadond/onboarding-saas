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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params;
    
    // Mock data for different kits
    const mockAssignments = {
      '1': [
        {
          id: '1',
          kit_id: '1',
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
            company_id: '2',
            company_name: 'Global Dynamics',
            assigned_at: '2024-01-16T14:20:00Z',
            is_active: true,
            status: 'completed',
            progress: 100
          },
          {
            id: '3',
            kit_id: '1',
            company_id: '5',
            company_name: 'Enterprise Corp',
            assigned_at: '2024-01-18T09:15:00Z',
            is_active: true,
            status: 'pending',
            progress: 0
          }
        ],
        '2': [
          {
            id: '4',
            kit_id: '2',
            company_id: '3',
            company_name: 'Innovate Solutions',
            assigned_at: '2024-01-17T11:45:00Z',
            is_active: true,
            status: 'in_progress',
            progress: 45
          },
          {
            id: '5',
            kit_id: '2',
            company_id: '4',
            company_name: 'TechStart Inc',
            assigned_at: '2024-01-19T08:30:00Z',
            is_active: true,
            status: 'in_progress',
            progress: 20
          }
        ],
        '3': [],
        '4': [
          {
            id: '6',
            kit_id: '4',
            company_id: '1',
            company_name: 'Acme Corporation',
            assigned_at: '2024-01-20T10:00:00Z',
            is_active: true,
            status: 'completed',
            progress: 100
          },
          {
            id: '7',
            kit_id: '4',
            company_id: '3',
            company_name: 'Innovate Solutions',
            assigned_at: '2024-01-20T15:30:00Z',
            is_active: true,
            status: 'in_progress',
            progress: 75
          }
        ]
      }

      const assignments = mockAssignments[kitId as keyof typeof mockAssignments] || []

      return NextResponse.json({
        success: true,
        data: assignments
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

    // Try to fetch assignments from the database
    try {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('kit_assignments')
        .select(`
          *,
          companies (
            name
          )
        `)
        .eq('kit_id', kitId)
        .order('assigned_at', { ascending: false })

      if (assignmentsError) {
        console.error('Database error:', assignmentsError)
        return NextResponse.json({
          success: true,
          data: []
        })
      }

      // Transform the data to match the expected format
      const transformedAssignments = (assignments || []).map(assignment => ({
        ...assignment,
        company_name: assignment.companies?.name || 'Unknown Company'
      }))

      return NextResponse.json({
        success: true,
        data: transformedAssignments
      })
    } catch (error) {
      console.log('Kit assignments table not found, returning empty array')
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('Kit assignments API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params
    const body = await request.json()

      const mockAssignment = {
        id: Date.now().toString(),
        kit_id: kitId,
        company_id,
        company_name: company_name || 'Unknown Company',
        assigned_at: new Date().toISOString(),
        is_active: true,
        status: 'pending',
        progress: 0
      }

      return NextResponse.json({
        success: true,
        data: mockAssignment
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

    const { company_id } = body

    if (!company_id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    try {
      const { data: assignment, error: createError } = await supabase
        .from('kit_assignments')
        .insert({
          kit_id: kitId,
          company_id,
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

      if (createError) {
        console.error('Database error:', createError)
        return NextResponse.json(
          { error: 'Failed to create assignment' },
          { status: 500 }
        )
      }

      // Transform the data to match the expected format
      const transformedAssignment = {
        ...assignment,
        company_name: assignment.companies?.name || 'Unknown Company'
      }

      return NextResponse.json({
        success: true,
        data: transformedAssignment
      })
    } catch (error) {
      console.error('Assignment creation error:', error)
      return NextResponse.json(
        { error: 'Database not configured. Please set up your database first.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Kit assignments POST API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}