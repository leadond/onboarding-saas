import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Companies fetch error:', error)
        return NextResponse.json({ success: true, data: [] })
      }

      return NextResponse.json({
        success: true,
        data: companies || []
      })
    } catch (dbError) {
      console.log('Companies table not found, returning empty array')
      return NextResponse.json({ success: true, data: [] })
    }
  } catch (error) {
    console.error('Companies API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, legal_name, industry, website_url, email, phone } = body

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name,
          legal_name: legal_name || null,
          industry: industry || null,
          website_url: website_url || null,
          email: email || null,
          phone: phone || null,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Company creation error:', error)
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: company,
        message: 'Company created successfully'
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }
  } catch (error) {
    console.error('Companies POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}