import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StripeService } from '@/lib/integrations/stripe-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { step_instance_id, amount, currency = 'usd', description } = await request.json()

    // Get step instance and session info
    const { data: stepInstance } = await supabase
      .from('step_instances')
      .select(`
        *,
        onboarding_sessions (
          id,
          client_name,
          client_email,
          company_kits (company_name)
        )
      `)
      .eq('id', step_instance_id)
      .single()

    if (!stepInstance) {
      return NextResponse.json({ error: 'Step instance not found' }, { status: 404 })
    }

    // Verify access
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_name')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile || stepInstance.onboarding_sessions?.company_kits?.company_name !== profile.company_name) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get company Stripe integration
    const { data: integration } = await supabase
      .from('company_integrations')
      .select('*')
      .eq('company_name', profile.company_name)
      .eq('integration_type', 'stripe')
      .eq('is_active', true)
      .single()

    if (!integration?.api_key_encrypted) {
      return NextResponse.json({ 
        error: 'Stripe integration not configured for this company' 
      }, { status: 400 })
    }

    // Create Stripe payment intent
    const stripeService = new StripeService(integration.api_key_encrypted) // In production, decrypt this
    const session = stepInstance.onboarding_sessions

    const paymentResult = await stripeService.createPaymentIntent(
      amount,
      currency,
      {
        company_name: profile.company_name,
        client_name: session.client_name,
        client_email: session.client_email,
        session_id: session.id,
        step_instance_id: step_instance_id
      }
    )

    if (!paymentResult.success) {
      return NextResponse.json({ error: paymentResult.error }, { status: 500 })
    }

    // Create payment request record
    const { data: paymentRequest, error: paymentError } = await supabase
      .from('payment_requests')
      .insert({
        step_instance_id,
        session_id: session.id,
        amount,
        currency,
        description,
        stripe_payment_intent_id: paymentResult.payment_intent_id,
        status: 'pending'
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 })
    }

    return NextResponse.json({
      payment_request: paymentRequest,
      client_secret: paymentResult.client_secret,
      publishable_key: integration.settings?.publishable_key
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}