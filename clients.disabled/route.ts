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

export async function GET(request: NextRequest) {
  try {

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
      // Fetch clients from the database
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select(`
          *,
          kit_assignments (
            kit_id,
            progress,
            status,
            kits (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('invited_at', { ascending: false })

      if (clientsError) {
        console.error('Database error:', clientsError)
        return NextResponse.json({
          success: true,
          data: {
            clients: [],
            stats: { total: 0, active: 0, completed: 0, invited: 0 }
          }
        })
      }

      // Calculate stats
      const stats = {
        total: clients?.length || 0,
        active: clients?.filter(c => c.status === 'active').length || 0,
        completed: clients?.filter(c => c.status === 'completed').length || 0,
        invited: clients?.filter(c => c.status === 'invited').length || 0
      }

      return NextResponse.json({
        success: true,
        data: {
          clients: clients || [],
          stats
        }
      })
    } catch (error) {
      console.log('Clients table not found, returning empty array')
      return NextResponse.json({
        success: true,
        data: {
          clients: [],
          stats: { total: 0, active: 0, completed: 0, invited: 0 }
        }
      })
    }
  } catch (error) {
    console.error('Clients API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, company } = body

    const supabase = await getSupabaseClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user subscription tier and roles for permission checks
    const { data: userRolesData, error: rolesError } = await supabase
      .from('organization_members')
      .select('role, subscription_tier')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    const subscriptionTier = userRolesData?.subscription_tier || 'FREE'
    const userRole = userRolesData?.role || 'viewer'

    // Create userContext for RBACManager
    const userContext = {
      id: user.id,
      email: user.email || '',
      roles: [userRole],
      permissions: ['read'], // Default permissions, can be enhanced
      organizationId: null,
      subscriptionTier
    }

    // Enforce subscription tier limits on client creation
    if (request.method === 'POST') {
      // Count existing clients for user
      const { data: existingClients, error: countError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (countError) {
        return NextResponse.json(
          { error: 'Failed to count existing clients' },
          { status: 500 }
        )
      }

      const currentClientCount = existingClients ?? 0
      const SUBSCRIPTION_LIMITS: Record<string, { maxClients: number }> = {
        FREE: { maxClients: 10 },
        STARTER: { maxClients: 100 },
        PRO: { maxClients: 1000 },
        ENTERPRISE: { maxClients: Infinity },
        ADMIN: { maxClients: Infinity }
      }

      if (currentClientCount >= (SUBSCRIPTION_LIMITS[subscriptionTier] || 0)) {
        return NextResponse.json(
          { error: `Client limit reached for your subscription tier (${subscriptionTier})` },
          { status: 403 }
        )
      }
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    try {
      // Check if client with this email already exists for this user
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .eq('user_id', user.id)
        .single()

      if (existingClient) {
        return NextResponse.json(
          { error: 'A client with this email already exists' },
          { status: 409 }
        )
      }

      // Create the client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name,
          email,
          phone: phone || null,
          company: company || null,
          status: 'invited',
          invited_at: new Date().toISOString(),
          user_id: user.id
        })
        .select()
        .single()

      if (clientError) {
        console.error('Client creation error:', clientError)
        return NextResponse.json(
          { error: 'Failed to create client' },
          { status: 500 }
        )
      }

      // TODO: Send invitation email here
      console.log(`📧 Would send invitation email to ${email}`)

      return NextResponse.json({
        success: true,
        data: client,
        message: `Invitation sent to ${name} at ${email}`
      })
    } catch (error) {
      console.error('Client creation error:', error)
      return NextResponse.json(
        { error: 'Database not configured. Please set up your database first.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Clients POST API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}