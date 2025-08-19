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
import { createClient } from '@/lib/supabase/server'
import { EmailService } from '@/lib/notifications/email-service'
import type { NotificationContext } from '@/lib/notifications/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      kitId,
      clientIdentifier,
      clientName,
      clientEmail,
      stepId,
      customSubject,
      customMessage,
      fromAdmin,
      daysSinceLastActivity,
    } = body

    // Validate required fields
    if (!type || !kitId || !clientIdentifier || !clientEmail) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: type, kitId, clientIdentifier, clientEmail',
        },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Get kit details with user info
    const { data: kit, error: kitError } = await supabase
      .from('kits')
      .select(
        `
        *,
        users!inner(*)
      `
      )
      .eq('id', kitId)
      .single()

    if (kitError) {
      console.error('Kit fetch error:', kitError)
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 })
    }

    // Get client progress
    const { data: progress, error: progressError } = await supabase
      .from('client_progress')
      .select('*')
      .eq('kit_id', kitId)
      .eq('client_identifier', clientIdentifier)

    if (progressError) {
      console.error('Progress fetch error:', progressError)
      return NextResponse.json(
        { error: 'Failed to fetch client progress' },
        { status: 500 }
      )
    }

    // Get kit steps for progress calculation
    const { data: steps, error: stepsError } = await supabase
      .from('kit_steps')
      .select('*')
      .eq('kit_id', kitId)
      .order('step_order')

    if (stepsError) {
      console.error('Steps fetch error:', stepsError)
      return NextResponse.json(
        { error: 'Failed to fetch kit steps' },
        { status: 500 }
      )
    }

    // Get specific step if provided
    let step = null
    if (stepId) {
      const { data: stepData, error: stepError } = await supabase
        .from('kit_steps')
        .select('*')
        .eq('id', stepId)
        .single()

      if (stepError) {
        console.error('Step fetch error:', stepError)
      } else {
        step = stepData
      }
    }

    // Calculate progress metrics
    const totalSteps = steps.length
    const completedSteps = progress.filter((p: any) => p.completed).length
    const completionPercentage =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

    // Create mock client object for context
    const client = {
      id: clientIdentifier,
      identifier: clientIdentifier,
      name: clientName || 'Client',
      email: clientEmail,
    }

    // Build notification context
    const context: NotificationContext = {
      kit,
      client,
      step,
      totalSteps,
      completedSteps,
      completionPercentage,
      ...(daysSinceLastActivity && { daysSinceLastActivity }),
      ...(customSubject && { customSubject }),
      ...(customMessage && { customMessage }),
      ...(fromAdmin !== undefined && { fromAdmin }),
    }

    // Create email service and send notification
    const emailService = new EmailService()
    let success = false

    console.log(`📧 Attempting to send ${type} email to ${clientEmail}`)

    switch (type) {
      case 'welcome':
        success = await emailService.sendWelcomeEmail(context)
        console.log(`📧 Welcome email result: ${success ? 'SUCCESS' : 'FAILED'}`)
        break

      case 'step_completion':
        success = await emailService.sendStepCompletionEmail(context)
        break

      case 'reminder':
        success = await emailService.sendReminderEmail(
          context,
          daysSinceLastActivity || 1
        )
        break

      case 'completion':
        success = await emailService.sendCompletionEmail(context)
        break

      case 'admin_new_client':
        success = await emailService.sendAdminNotification(
          'new_client',
          context
        )
        break

      case 'admin_client_completed':
        success = await emailService.sendAdminNotification(
          'client_completed',
          context
        )
        break

      case 'admin_client_stuck':
        success = await emailService.sendAdminNotification(
          'client_stuck',
          context
        )
        break

      case 'custom_message':
        if (!customSubject || !customMessage) {
          return NextResponse.json(
            {
              error: 'Custom message requires customSubject and customMessage',
            },
            { status: 400 }
          )
        }
        success = await emailService.sendCustomMessage(
          context,
          customSubject,
          customMessage,
          fromAdmin !== false
        )
        break

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      type,
      recipient: clientEmail,
    })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Notification logs endpoint - not implemented yet',
    supportedTypes: [
      'welcome',
      'step_completion',
      'reminder',
      'completion',
      'admin_new_client',
      'admin_client_completed',
      'admin_client_stuck',
      'custom_message',
    ],
  })
}
