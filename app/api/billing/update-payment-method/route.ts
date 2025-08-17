import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSetupIntent, getOrCreateStripeCustomer } from '@/lib/stripe/billing'
import { handleApiError } from '@/lib/utils/api-error-handler'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
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

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          }
        ])
        .select()
        .single()

      if (createError || !newProfile) {
        return NextResponse.json(
          { success: false, error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      // Use the newly created profile
      userProfile = newProfile
    }

    // Get or create Stripe customer
    const customerResult = await getOrCreateStripeCustomer(userProfile)
    if (!customerResult.success) {
      return NextResponse.json(customerResult, { status: 400 })
    }

    // Create setup intent for payment method update
    const setupIntentResult = await createSetupIntent(customerResult.data.customerId)
    if (!setupIntentResult.success) {
      return NextResponse.json(setupIntentResult, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: setupIntentResult.data.client_secret,
        setupIntentId: setupIntentResult.data.id,
      },
    })
  } catch (error) {
    return handleApiError(error, 'GET /api/billing/update-payment-method')
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}