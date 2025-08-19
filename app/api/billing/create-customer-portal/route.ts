import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCustomerPortalSession, getOrCreateStripeCustomer } from '@/lib/stripe/billing'
import { handleApiError } from '@/lib/utils/api-error-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { returnUrl } = body

    if (!returnUrl) {
      return NextResponse.json(
        { success: false, error: 'Return URL is required' },
        { status: 400 }
      )
    }

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
    let { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('users')
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
    const customerResult: any = await getOrCreateStripeCustomer(userProfile as any)
    if (!customerResult.success) {
      return NextResponse.json(customerResult, { status: 400 })
    }

    // Create customer portal session
    const customerId = (customerResult?.data?.customerId ?? (customerResult as any).customerId) as string;
    const portalResult = await createCustomerPortalSession(
      customerId,
      returnUrl
    )

    if (!portalResult.success) {
      return NextResponse.json(portalResult, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        url: portalResult.data.url,
      },
    })
  } catch (error) {
    return handleApiError(error, 'POST /api/billing/create-customer-portal')
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}