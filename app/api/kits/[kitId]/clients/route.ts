import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'

// GET /api/kits/[kitId]/clients - List clients for a kit
export async function GET(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Verify kit ownership
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('id, name')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query for client progress
    let query = supabase
      .from('client_progress')
      .select(`
        client_identifier,
        client_name,
        client_email,
        status,
        started_at,
        completed_at,
        last_activity_at,
        current_step_id,
        response_data,
        kit_steps!inner (
          title,
          step_order
        )
      `)
      .eq('kit_id', kitId)

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`client_email.ilike.%${search}%,client_name.ilike.%${search}%`)
    }

    // Get total count
    const { count } = await supabase
      .from('client_progress')
      .select('*', { count: 'exact', head: true })
      .eq('kit_id', kitId)

    // Execute query with pagination
    const { data: clientData, error } = await query
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      )
    }

    // Group by client and get latest progress for each
    const clientMap = new Map()
    
    clientData?.forEach((record: any) => {
      const clientId = record.client_identifier
      if (!clientMap.has(clientId) || 
          new Date(record.last_activity_at || record.started_at) > new Date(clientMap.get(clientId).last_activity_at || clientMap.get(clientId).started_at)) {
        clientMap.set(clientId, {
          client_identifier: record.client_identifier,
          client_name: record.client_name,
          client_email: record.client_email,
          status: record.status,
          started_at: record.started_at,
          completed_at: record.completed_at,
          last_activity_at: record.last_activity_at,
          current_step: record.kit_steps ? {
            title: record.kit_steps.title,
            step_order: record.kit_steps.step_order
          } : null,
          response_data: record.response_data
        })
      }
    })

    const clients = Array.from(clientMap.values())

    // Get summary statistics
    const stats = {
      total: count || 0,
      completed: clients.filter(c => c.status === 'completed').length,
      in_progress: clients.filter(c => c.status === 'in_progress').length,
      not_started: clients.filter(c => c.status === 'not_started').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        clients,
        stats,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      },
    })
  } catch (error) {
    console.error('GET /api/kits/[kitId]/clients error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/kits/[kitId]/clients - Assign kit to a client
export async function POST(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate kitId parameter
    const kitId = z.string().uuid().parse(params.kitId)

    // Verify kit ownership
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('id, name, status')
      .eq('id', kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    if (kit.status !== 'published') {
      return NextResponse.json(
        { error: 'Kit must be published before assigning to clients' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const assignmentSchema = z.object({
      client_email: z.string().email('Invalid email address'),
      client_name: z.string().min(1, 'Client name is required'),
      send_invitation: z.boolean().default(true),
      custom_message: z.string().optional(),
      due_date: z.string().datetime().optional(),
    })

    const validatedData = assignmentSchema.parse(body)

    // Check if client is already assigned to this kit
    const { data: existingAssignment } = await supabase
      .from('client_progress')
      .select('id')
      .eq('kit_id', kitId)
      .eq('client_identifier', validatedData.client_email)
      .single()

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Client is already assigned to this kit' },
        { status: 409 }
      )
    }

    // Get kit steps to create initial progress records
    const { data: steps, error: stepsError } = await supabase
      .from('kit_steps')
      .select('id, step_order, title, is_required')
      .eq('kit_id', kitId)
      .eq('is_active', true)
      .order('step_order', { ascending: true })

    if (stepsError) {
      console.error('Steps error:', stepsError)
      return NextResponse.json(
        { error: 'Failed to fetch kit steps' },
        { status: 500 }
      )
    }

    if (!steps || steps.length === 0) {
      return NextResponse.json(
        { error: 'Kit has no active steps' },
        { status: 400 }
      )
    }

    // Create progress records for each step
    const progressRecords = steps.map(step => ({
      kit_id: kitId,
      step_id: step.id,
      client_identifier: validatedData.client_email,
      client_name: validatedData.client_name,
      client_email: validatedData.client_email,
      status: 'not_started',
      started_at: new Date().toISOString(),
      due_date: validatedData.due_date,
    }))

    const { data: createdRecords, error: createError } = await supabase
      .from('client_progress')
      .insert(progressRecords)
      .select()

    if (createError) {
      console.error('Create error:', createError)
      return NextResponse.json(
        { error: 'Failed to create client assignment' },
        { status: 500 }
      )
    }

    // Send invitation email if requested
    if (validatedData.send_invitation) {
      try {
        await fetch(`${request.nextUrl.origin}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'kit_assigned',
            kitId,
            clientIdentifier: validatedData.client_email,
            clientName: validatedData.client_name,
            clientEmail: validatedData.client_email,
            customMessage: validatedData.custom_message,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError)
        // Don't fail the assignment if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          client_identifier: validatedData.client_email,
          client_name: validatedData.client_name,
          client_email: validatedData.client_email,
          status: 'not_started',
          steps_created: createdRecords?.length || 0,
        },
        message: 'Client assigned successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/kits/[kitId]/clients error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}