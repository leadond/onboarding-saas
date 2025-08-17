import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database configuration missing. Please configure Supabase environment variables.',
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 0
          }
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: kits, error } = await supabase
      .from('kits')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${error.message}`,
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 0
          }
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: kits || [],
      pagination: {
        page: 1,
        limit: 10,
        total: kits?.length || 0,
        total_pages: 1
      }
    })
  } catch (error) {
    console.error('Error fetching kits:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch kits: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          total_pages: 0
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Kit name is required' },
        { status: 400 }
      )
    }
    
    const newKit = {
      id: (mockKits.length + 1).toString(),
      name: body.name,
      description: body.description || '',
      status: 'draft' as const,
      step_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // In a real app, you would save to database
    mockKits.push(newKit)
    
    return NextResponse.json({
      success: true,
      data: newKit,
      message: 'Kit created successfully'
    })
  } catch (error) {
    console.error('Error creating kit:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create kit' },
      { status: 500 }
    )
  }
}