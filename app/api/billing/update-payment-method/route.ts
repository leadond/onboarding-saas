import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createSetupIntent,
  updateDefaultPaymentMethod,
  getOrCreateStripeCustomer,
} from '@/lib/stripe/billing'
import type { PaymentMethodUpdateRequest, User } from '@/types'

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
    const { setupIntentId } = body as PaymentMethodUpdateRequest

    if (!setupIntentId) {
      // Create a new setup intent for payment method collection
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

      const setupIntentResult = await createSetupIntent(customerId)

      if (!setupIntentResult.success || !setupIntentResult.data) {
        return NextResponse.json(
          { success: false, error: setupIntentResult.success ? 'No setup intent data' : (setupIntentResult as any).error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: setupIntentResult.data,
      })
    } else {
      // Update the payment method with the completed setup intent
      if (!user.stripe_customer_id) {
        return NextResponse.json(
          { success: false, error: 'No customer ID found' },
          { status: 400 }
        )
      }

      const updateResult = await updateDefaultPaymentMethod({
        customerId: user.stripe_customer_id,
        setupIntentId,
      })

      if (!updateResult.success) {
        return NextResponse.json(
          { success: false, error: updateResult.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Payment method updated successfully',
        data: updateResult.data,
      })
    }
  } catch (error) {
    console.error('Error in update payment method API:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    // Get or create Stripe customer and return setup intent
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

    const setupIntentResult = await createSetupIntent(customerId)

    if (!setupIntentResult.success || !setupIntentResult.data) {
      return NextResponse.json(
        { success: false, error: setupIntentResult.success ? 'No setup intent data' : (setupIntentResult as any).error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: setupIntentResult.data,
    })
  } catch (error) {
    console.error('Error in get setup intent API:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}