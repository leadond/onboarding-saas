import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe/client'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !endpointSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed.', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object
      console.log(`Subscription event received: ${event.type}`, subscription)
      // TODO: Update subscription status in your database
      break
    case 'invoice.paid':
      const invoice = event.data.object
      console.log('Invoice paid:', invoice)
      // TODO: Handle successful payment
      break
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object
      console.log('Invoice payment failed:', failedInvoice)
      // TODO: Handle failed payment
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}