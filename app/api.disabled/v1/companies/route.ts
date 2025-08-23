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
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Fetching companies for user:', user.id)

    // Try to fetch companies from the database
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('🏢 Companies found:', companies?.length || 0)
    console.log('❌ Companies error:', companiesError)

    if (companiesError) {
      console.error('Database error:', companiesError)
      return NextResponse.json({
        success: false,
        error: `Database error: ${companiesError.message}`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: companies || []
    })
  } catch (error) {
    console.error('Companies API error:', error)
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

    const supabase = await createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, legal_name, industry, website_url, email, phone, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    try {
      const { data: company, error: createError } = await supabase
        .from('companies')
        .insert({
          created_by: user.id,
          updated_by: user.id,
          name,
          legal_name: legal_name || null,
          industry: industry || null,
          website_url: website_url || null,
          email: email || null,
          phone: phone || null,
          description: description || null,
        })
        .select()
        .single()

      if (createError) {
        console.error('Database error:', createError)
        return NextResponse.json(
          { error: `Database error: ${createError.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: company
      })
    } catch (error) {
      console.error('Company creation error:', error)
      return NextResponse.json(
        { error: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Companies POST API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}