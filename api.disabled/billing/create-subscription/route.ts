import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe/client'

// Mock function to get user ID from request (replace with real auth logic)
async function getUserIdFromRequest(req: Request): Promise<string | null> {
  // TODO: Implement real user auth/session retrieval
  return 'user_123'
}

// Mock function to get or create Stripe customer ID for user
async function getOrCreateCustomerId(userId: string): Promise<string> {
  // TODO: Replace with real DB lookup and creation logic
  // For demo, create a new customer every time (not ideal)
  const customer = await stripe.customers.create({
    metadata: { userId },
  })
  return customer.id
}

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, quantity } = await req.json()
    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
    }
    const qty = quantity && quantity > 0 ? quantity : 1

    const customerId = await getOrCreateCustomerId(userId)

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId, quantity: qty }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      status: subscription.status,
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}