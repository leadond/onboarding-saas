import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { UpdateStepInstanceRequest } from '@/types/onboarding-kits'
import { TwilioService } from '@/lib/integrations/twilio-service-stub'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const { stepId } = await params
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: step, error } = await supabase
      .from('step_instances')
      .select(`
        *,
        company_kit_steps (*),
        onboarding_sessions (
          client_name,
          client_email,
          company_kits (company_name)
        ),
        document_instances (*),
        form_submissions (*),
        file_uploads (*),
        payment_requests (*)
      `)
      .eq('id', stepId)
      .single()

    if (error || !step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Verify user has access to this step
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_name')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || step.onboarding_sessions?.company_kits?.company_name !== profile.company_name) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ step })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const { stepId } = await params
    const supabase = await getSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateStepInstanceRequest = await request.json()

    // Get current step data
    const { data: currentStep } = await supabase
      .from('step_instances')
      .select(`
        *,
        onboarding_sessions (
          id,
          client_name,
          client_email,
          client_phone,
          assigned_user_id,
          company_kits (company_name)
        ),
        company_kit_steps (name, responsibility)
      `)
      .eq('id', stepId)
      .single()

    if (!currentStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Verify access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_name, id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || currentStep.onboarding_sessions?.company_kits?.company_name !== profile.company_name) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update the step
    const updateData: any = {}
    if (body.status) {
      updateData.status = body.status
      if (body.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else if (body.status === 'in_progress' && !currentStep.started_at) {
        updateData.started_at = new Date().toISOString()
      }
    }
    if (body.completion_data) {
      updateData.completion_data = body.completion_data
    }
    if (body.notes) {
      updateData.notes = body.notes
    }

    const { data: updatedStep, error: updateError } = await supabase
      .from('step_instances')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Send notifications if step was completed
    if (body.status === 'completed') {
      await sendStepCompletionNotifications(
        currentStep,
        profile.id,
        supabase
      )

      // Update session progress
      await updateSessionProgress(currentStep.session_id, supabase)
    }

    return NextResponse.json({ step: updatedStep })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendStepCompletionNotifications(
  step: any,
  completedByUserId: string,
  supabase: any
) {
  try {
    const session = step.onboarding_sessions
    const stepInfo = step.company_kit_steps

    // Determine who completed the step
    const completedBy = step.assigned_to === 'client' ? 'client' : 'company'

    // Get company integration settings for notifications
    const { data: integrations } = await supabase
      .from('company_integrations')
      .select('*')
      .eq('company_name', session.company_kits.company_name)
      .eq('integration_type', 'twilio')
      .eq('is_active', true)
      .single()

    // Send SMS notification if Twilio is configured
    if (integrations?.api_key_encrypted && session.client_phone) {
      const twilioService = new TwilioService(
        integrations.settings.account_sid,
        integrations.api_key_encrypted // In production, decrypt this
      )

      if (completedBy === 'client' && session.assigned_user_id) {
        // Notify assigned user that client completed step
        const { data: assignedUser } = await supabase
          .from('user_profiles')
          .select('phone')
          .eq('id', session.assigned_user_id)
          .single()

        if (assignedUser?.phone) {
          await twilioService.sendStepCompletionNotification(
            assignedUser.phone,
            stepInfo.name,
            session.client_name,
            'client'
          )
        }
      } else if (completedBy === 'company') {
        // Notify client that company completed step
        await twilioService.sendStepCompletionNotification(
          session.client_phone,
          stepInfo.name,
          session.client_name,
          'company'
        )
      }
    }

    // Send email notification (implement with your email service)
    // await sendEmailNotification(...)

  } catch (error) {
    console.error('Error sending step completion notifications:', error)
  }
}

async function updateSessionProgress(sessionId: string, supabase: any) {
  try {
    // Get all step instances for the session
    const { data: steps } = await supabase
      .from('step_instances')
      .select('status')
      .eq('session_id', sessionId)

    if (!steps || steps.length === 0) return

    const completedSteps = steps.filter(step => step.status === 'completed').length
    const progressPercentage = Math.round((completedSteps / steps.length) * 100)

    // Update session progress
    const updateData: any = { progress_percentage: progressPercentage }
    
    // Mark session as completed if all steps are done
    if (progressPercentage === 100) {
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
    }

    await supabase
      .from('onboarding_sessions')
      .update(updateData)
      .eq('id', sessionId)

  } catch (error) {
    console.error('Error updating session progress:', error)
  }
}