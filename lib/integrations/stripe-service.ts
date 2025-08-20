import Stripe from 'stripe'

export class StripeService {
  private stripe: Stripe

  constructor(apiKey?: string) {
    this.stripe = new Stripe(apiKey || process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil'
    })
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return {
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id
      }
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment setup failed'
      }
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
      
      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      }
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      }
    }
  }

  async createCustomer(email: string, name?: string, metadata: Record<string, string> = {}) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      })

      return {
        success: true,
        customer_id: customer.id
      }
    } catch (error) {
      console.error('Stripe customer creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer creation failed'
      }
    }
  }
}