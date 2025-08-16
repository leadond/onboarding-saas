import { stripe } from './client'
import { createClient } from '@/lib/supabase/server'
import { handleStripeError, logPaymentError } from '@/lib/utils/payment-error-handler'
import type { User } from '@/types'

interface CreateCustomerParams {
  email: string
  name?: string
  metadata?: Record<string, string>
}

interface UpdatePaymentMethodParams {
  customerId: string
  setupIntentId: string
}

/**
 * Creates a new Stripe customer
 */
export async function createStripeCustomer({
  email,
  name,
  metadata = {},
}: CreateCustomerParams) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    })

    return {
      success: true,
      data: customer,
    }
  } catch (error) {
    const paymentError = handleStripeError(error)
    logPaymentError(paymentError, { context: 'createStripeCustomer', email, name })
    return {
      success: false,
      error: paymentError.userMessage,
    }
  }
}

/**
 * Creates a setup intent for updating payment methods
 */
export async function createSetupIntent(customerId: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      payment_method_types: ['card'],
    })

    return {
      success: true,
      data: {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      },
    }
  } catch (error) {
    const paymentError = handleStripeError(error)
    logPaymentError(paymentError, { context: 'createSetupIntent', customerId })
    return {
      success: false,
      error: paymentError.userMessage,
    }
  }
}

/**
 * Updates the default payment method for a customer
 */
export async function updateDefaultPaymentMethod({
  customerId,
  setupIntentId,
}: UpdatePaymentMethodParams) {
  try {
    // Retrieve the setup intent to get the payment method
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)

    if (!setupIntent.payment_method) {
      throw new Error('No payment method found in setup intent')
    }

    // Update the customer's default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: setupIntent.payment_method as string,
      },
    })

    return {
      success: true,
      data: { paymentMethodId: setupIntent.payment_method },
    }
  } catch (error) {
    const paymentError = handleStripeError(error)
    logPaymentError(paymentError, { context: 'updateDefaultPaymentMethod', customerId, setupIntentId })
    return {
      success: false,
      error: paymentError.userMessage,
    }
  }
}

/**
 * Creates a customer portal session for self-service billing
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return {
      success: true,
      data: { url: session.url },
    }
  } catch (error) {
    const paymentError = handleStripeError(error)
    logPaymentError(paymentError, { context: 'createCustomerPortalSession', customerId, returnUrl })
    return {
      success: false,
      error: paymentError.userMessage,
    }
  }
}

/**
 * Gets customer billing information
 */
export async function getCustomerBilling(customerId: string) {
  try {
    const [customer, paymentMethods, subscriptions] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      }),
      stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
      }),
    ])

    return {
      success: true,
      data: {
        customer,
        paymentMethods: paymentMethods.data,
        subscriptions: subscriptions.data,
      },
    }
  } catch (error) {
    const paymentError = handleStripeError(error)
    logPaymentError(paymentError, { context: 'getCustomerBilling', customerId })
    return {
      success: false,
      error: paymentError.userMessage,
    }
  }
}

/**
 * Gets or creates a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(user: User) {
  if (user.stripe_customer_id) {
    try {
      // Verify customer exists in Stripe
      const customer = await stripe.customers.retrieve(user.stripe_customer_id)
      if (!customer.deleted) {
        return {
          success: true,
          data: { customerId: user.stripe_customer_id },
        }
      }
    } catch (error) {
      const paymentError = handleStripeError(error)
      logPaymentError(paymentError, { context: 'getOrCreateStripeCustomer_retrieve', customerId: user.stripe_customer_id })
    }
  }

  // Create new customer
  const customerResult = await createStripeCustomer({
    email: user.email,
    name: user.full_name || undefined,
    metadata: {
      user_id: user.id,
    },
  })

  if (!customerResult.success || !customerResult.data) {
    return customerResult
  }

  // Update user record with customer ID
  const supabase = createClient()
  const { error } = await supabase
    .from('users')
    .update({ stripe_customer_id: customerResult.data.id })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating user with customer ID:', error)
    return {
      success: false,
      error: 'Failed to update user record',
    }
  }

  return {
    success: true,
    data: { customerId: customerResult.data.id },
  }
}

/**
 * Handles webhook events from Stripe
 */
export async function handleStripeWebhook(
  payload: string | Buffer,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )

    return {
      success: true,
      data: event,
    }
  } catch (error) {
    console.error('Error constructing webhook event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid webhook signature',
    }
  }
}