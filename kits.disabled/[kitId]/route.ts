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
    const { kitId } = await params

    const supabase = await getSupabaseClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try to fetch the kit from the database
    try {
      const { data: kit, error: kitError } = await supabase
        .from('kits')
        .select('*')
        .eq('id', kitId)
        .eq('user_id', user.id)
        .single()

      if (kitError || !kit) {
        return NextResponse.json(
          { error: 'Kit not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: kit
      })
    } catch (error) {
      console.error('Kit fetch error:', error)
      return NextResponse.json(
        { error: 'Database not configured. Please set up your database first.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Kit API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params
    const body = await request.json()

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
      const { data: kit, error: updateError } = await supabase
        .from('kits')
        .update(body)
        .eq('id', kitId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError || !kit) {
        return NextResponse.json(
          { error: 'Kit not found or update failed' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: kit
      })
    } catch (error) {
      console.error('Kit update error:', error)
      return NextResponse.json(
        { error: 'Database not configured. Please set up your database first.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Kit PUT API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kitId: string }> }
) {
  try {
    const { kitId } = await params

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
      const { error: deleteError } = await supabase
        .from('kits')
        .delete()
        .eq('id', kitId)
        .eq('user_id', user.id)

      if (deleteError) {
        return NextResponse.json(
          { error: 'Kit not found or delete failed' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Kit deleted successfully'
      })
    } catch (error) {
      console.error('Kit delete error:', error)
      return NextResponse.json(
        { error: 'Database not configured. Please set up your database first.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Kit DELETE API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}