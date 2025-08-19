import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    console.log('📋 GET /api/clients called')
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          data: {
            clients: [],
            stats: { total: 0, active: 0, completed: 0 }
          }
        },
        { status: 401 }
      )
    }
    
    // Get search parameter
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    
    // Build query
    let query = supabase
      .from('clients')
      .select('*')
      .eq('owner_id', user.id)
    
    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }
    
    // Fetch clients for authenticated user
    const { data: clients, error: clientsError } = await query.order('created_at', { ascending: false })
    
    if (clientsError) {
      console.error('Supabase clients error:', clientsError)
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${clientsError.message}`,
          data: {
            clients: [],
            stats: { total: 0, active: 0, completed: 0 }
          }
        },
        { status: 500 }
      )
    }

    // Calculate stats
    const total = clients?.length || 0
    const active = clients?.filter(client => client.status === 'active').length || 0
    const completed = clients?.filter(client => client.status === 'completed').length || 0
    
    return NextResponse.json({
      success: true,
      data: {
        clients: clients || [],
        stats: { total, active, completed }
      }
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch clients: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: {
          clients: [],
          stats: { total: 0, active: 0, completed: 0 }
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    console.log('🔐 Checking authentication...')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('👤 User:', user?.id, user?.email)
    console.log('❌ Auth Error:', authError)

    if (authError || !user) {
      console.log('🚫 Authentication failed')
      return NextResponse.json(
        { success: false, error: 'Unauthorized', debug: { authError: authError?.message, hasUser: !!user } },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.email)
    console.log('🔍 Search term:', search)

    const body = await request.json()
    
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }
    
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([
        {
          name: body.name,
          email: body.email,
          company: body.company || null,
          phone: body.phone || null,
          owner_id: user.id,
          status: 'invited'
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating client:', error)
      return NextResponse.json(
        { success: false, error: `Failed to create client: ${error.message}` },
        { status: 500 }
      )
    }

    // Send welcome email using Resend
    console.log('🔄 Attempting to send email to:', body.email)
    console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY)
    console.log('📧 From email:', process.env.RESEND_FROM_EMAIL)
    
    try {
      const emailPayload = {
        from: process.env.RESEND_FROM_EMAIL || 'onboard@devapphero.com',
        to: [body.email],
        subject: `Welcome ${body.name}! Your onboarding is ready`,
        html: `<h1>Welcome, ${body.name}!</h1><p>You've been invited to complete your onboarding process.</p><p><a href="https://onboard.devapphero.com/client/welcome?email=${encodeURIComponent(body.email)}" style="background:#0066cc;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Start Onboarding</a></p>`
      }
      
      console.log('📤 Sending email payload:', JSON.stringify(emailPayload, null, 2))
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      })
      
      const responseText = await response.text()
      console.log('📨 Resend response status:', response.status)
      console.log('📨 Resend response:', responseText)
      
      if (response.ok) {
        console.log('✅ Welcome email sent successfully via Resend')
      } else {
        console.error('❌ Resend email failed:', responseText)
      }
    } catch (emailError) {
      console.error('❌ Email error:', emailError)
    }

    // Trigger integrations
    try {
      const { IntegrationManager } = await import('@/lib/integrations/manager')
      const manager = new IntegrationManager(supabase)
      
      await manager.triggerEvent(user.id, 'client.invited', {
        client_id: newClient.id,
        client_name: body.name,
        client_email: body.email,
        client_company: body.company,
        invited_at: new Date().toISOString()
      })
    } catch (integrationError) {
      console.error('Failed to trigger integrations:', integrationError)
      // Don't fail the client creation if integration triggers fail
    }
    
    return NextResponse.json({
      success: true,
      data: newClient,
      message: 'Client created and invitation sent successfully'
    })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    )
  }
}