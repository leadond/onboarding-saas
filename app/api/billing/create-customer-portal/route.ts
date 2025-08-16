import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createCustomerPortalSession,
  getOrCreateStripeCustomer,
} from '@/lib/stripe/billing'
import type { CustomerPortalRequest, User } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { returnUrl } = body as CustomerPortalRequest

    // Get or create Stripe customer
    const customerResult = await getOrCreateStripeCustomer(user as User)

    if (!customerResult.success || !customerResult.data) {
      return NextResponse.json(
        { success: false, error: customerResult.success ? 'No customer data' : (customerResult as any).error },
        { status: 500 }
      )
    }

    const customerId = 'customerId' in customerResult.data
      ? customerResult.data.customerId
      : customerResult.data.id

    // Create customer portal session
    const defaultReturnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
    const portalResult = await createCustomerPortalSession(
      customerId,
      returnUrl || defaultReturnUrl
    )

    if (!portalResult.success || !portalResult.data) {
      return NextResponse.json(
        { success: false, error: portalResult.success ? 'No portal data' : (portalResult as any).error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { url: portalResult.data.url },
    })
  } catch (error) {
    console.error('Error in create customer portal API:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}