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
import { IntegrationManager } from '@/lib/integrations/manager'

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const connected = searchParams.get('connected') === 'true'

    const manager = new IntegrationManager(supabase)

    if (connected) {
      // Get user's connected integrations
      const userIntegrations = await manager.getUserIntegrations(user.id)
      
      return NextResponse.json({
        success: true,
        data: {
          integrations: userIntegrations,
          total: userIntegrations.length
        }
      })
    } else {
      // Get available providers
      const providers = await manager.getProviders(category || undefined)
      
      // Get user's connected integrations to mark which are connected
      const userIntegrations = await manager.getUserIntegrations(user.id)
      const connectedSlugs = new Set(userIntegrations.map(i => i.provider_slug))
      
      const providersWithStatus = providers.map(provider => ({
        ...provider,
        is_connected: connectedSlugs.has(provider.slug),
        connection: userIntegrations.find(i => i.provider_slug === provider.slug) || null
      }))

      return NextResponse.json({
        success: true,
        data: {
          providers: providersWithStatus,
          categories: Array.from(new Set(providers.map(p => p.category))),
          total: providers.length,
          connected: userIntegrations.length
        }
      })
    }
  } catch (error) {
    console.error('Integrations API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { provider_slug, auth_data, settings = {}, metadata = {} } = body

    if (!provider_slug || !auth_data) {
      return NextResponse.json(
        { success: false, error: 'Provider slug and auth data are required' },
        { status: 400 }
      )
    }

    const manager = new IntegrationManager(supabase)
    const integration = await manager.connectIntegration(
      user.id,
      provider_slug,
      auth_data,
      settings,
      metadata
    )

    return NextResponse.json({
      success: true,
      data: { integration },
      message: 'Integration connected successfully'
    })
  } catch (error) {
    console.error('Connect integration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect integration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const providerSlug = searchParams.get('provider')

    if (!providerSlug) {
      return NextResponse.json(
        { success: false, error: 'Provider slug is required' },
        { status: 400 }
      )
    }

    const manager = new IntegrationManager(supabase)
    await manager.disconnectIntegration(user.id, providerSlug)

    return NextResponse.json({
      success: true,
      message: 'Integration disconnected successfully'
    })
  } catch (error) {
    console.error('Disconnect integration error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect integration' },
      { status: 500 }
    )
  }
}