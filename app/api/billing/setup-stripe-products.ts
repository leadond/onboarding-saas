import { stripe } from '../../../lib/stripe/client'

async function createProductsAndPrices() {
  try {
    // Create products for each tier
    const products = {
      basic: await stripe.products.create({
        name: 'Basic Plan',
        description: 'Basic subscription plan',
      }),
      standard: await stripe.products.create({
        name: 'Standard Plan',
        description: 'Standard subscription plan',
      }),
      premium: await stripe.products.create({
        name: 'Premium Plan',
        description: 'Premium subscription plan (hidden from UI)',
      }),
    }

    // Create prices for each product (per user per month)
    const prices = {
      basic: await stripe.prices.create({
        unit_amount: 1500, // $15.00
        currency: 'usd',
        recurring: { interval: 'month' },
        product: products.basic.id,
      }),
      standard: await stripe.prices.create({
        unit_amount: 2500, // $25.00
        currency: 'usd',
        recurring: { interval: 'month' },
        product: products.standard.id,
      }),
      premium: await stripe.prices.create({
        unit_amount: 5000, // $50.00
        currency: 'usd',
        recurring: { interval: 'month' },
        product: products.premium.id,
      }),
    }

    console.log('Products and prices created successfully:')
    console.log({
      products,
      prices,
    })

    return { products, prices }
  } catch (error) {
    console.error('Error creating products and prices:', error)
    throw error
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createProductsAndPrices()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { createProductsAndPrices }