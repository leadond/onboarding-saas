import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
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
    
    // Fetch clients for authenticated user
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Send welcome email using AWS SES
    try {
      const { sendWelcomeEmail } = await import('@/lib/aws/ses')
      const kitUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/welcome?email=${encodeURIComponent(body.email)}`
      
      await sendWelcomeEmail(body.email, body.name, kitUrl)
      console.log('Welcome email sent successfully')
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the client creation if email fails
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