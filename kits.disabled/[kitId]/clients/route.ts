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

export async function POST(
  request: NextRequest,
  { params }: { params: { kitId: string } }
) {
  try {
    const supabase = await getSupabaseClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { client_email, client_name, send_invitation, custom_message } = body

    if (!client_email || !client_name) {
      return NextResponse.json(
        { success: false, error: 'Client email and name are required' },
        { status: 400 }
      )
    }

    // Get kit details
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select('*')
      .eq('id', params.kitId)
      .eq('user_id', user.id)
      .single()

    if (kitError || !kit) {
      return NextResponse.json(
        { success: false, error: 'Kit not found' },
        { status: 404 }
      )
    }

    // Create or update client in clients table
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .upsert({
        email: client_email,
        name: client_name,
        owner_id: user.id,
        status: 'invited'
      }, {
        onConflict: 'email,owner_id'
      })
      .select()
      .single()

    if (clientError) {
      console.error('Error creating/updating client:', clientError)
      return NextResponse.json(
        { success: false, error: 'Failed to create client' },
        { status: 500 }
      )
    }

    // Create kit assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('kit_assignments')
      .insert({
        kit_id: params.kitId,
        client_id: client.id,
        assigned_by: user.id,
        status: 'assigned'
      })
      .select()
      .single()

    if (assignmentError) {
      console.error('Error creating assignment:', assignmentError)
      return NextResponse.json(
        { success: false, error: 'Failed to assign kit' },
        { status: 500 }
      )
    }

    // Send invitation email if requested
    if (send_invitation) {
      try {
        const kitUrl = `https://onboard.devapphero.com/kit/${params.kitId}?client=${client.id}`
        
        const emailPayload = {
          from: process.env.RESEND_FROM_EMAIL || 'onboard@devapphero.com',
          to: [client_email],
          subject: `${kit.title} - Your onboarding kit is ready!`,
          html: `
            <h1>Welcome, ${client_name}!</h1>
            <p>You've been assigned the onboarding kit: <strong>${kit.title}</strong></p>
            ${custom_message ? `<p><em>${custom_message}</em></p>` : ''}
            <p><a href="${kitUrl}" style="background:#0066cc;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Start Your Onboarding</a></p>
            <p>If the button doesn't work, copy this link: ${kitUrl}</p>
          `
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        })

        if (response.ok) {
          console.log('✅ Kit invitation email sent successfully')
        } else {
          console.error('❌ Kit invitation email failed')
        }
      } catch (emailError) {
        console.error('❌ Email error:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      data: { assignment, client },
      message: 'Kit assigned successfully'
    })

  } catch (error) {
    console.error('Error assigning kit:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to assign kit' },
      { status: 500 }
    )
  }
}