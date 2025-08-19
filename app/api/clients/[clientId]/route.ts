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

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('owner_id', user.id)
      .single()

    if (error || !client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    // Check for active kit assignments
    const { data: assignments } = await supabase
      .from('kit_assignments')
      .select(`
        *,
        kits!inner(title, status)
      `)
      .eq('client_id', clientId)
      .eq('kits.user_id', user.id)
      .order('assigned_at', { ascending: false })

    // Determine client status based on kit assignments
    let clientStatus = 'No Active Kit Assigned'
    let statusDuration = ''
    
    if (assignments && assignments.length > 0) {
      const activeAssignment = assignments[0]
      const daysSince = Math.floor((Date.now() - new Date(activeAssignment.assigned_at).getTime()) / (1000 * 60 * 60 * 24))
      
      switch (activeAssignment.status) {
        case 'assigned':
          clientStatus = 'Kit Assigned - Not Started'
          statusDuration = `${daysSince} days ago`
          break
        case 'started':
          // Get current step info if available
          const currentStep = activeAssignment.current_step || 'Step 1'
          clientStatus = `In Progress - ${currentStep}`
          statusDuration = `Started ${daysSince} days ago`
          break
        case 'completed':
          clientStatus = 'Completed'
          statusDuration = `Completed ${daysSince} days ago`
          break
        default:
          clientStatus = 'Kit Assigned'
          statusDuration = `${daysSince} days ago`
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        ...client, 
        status: clientStatus,
        statusDuration,
        assignments: assignments || []
      } 
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}