/*
 * Stripe client stub
 */

export const stripe = {
  customers: {
    create: async () => ({ id: 'cus_stub' }),
    retrieve: async () => ({ id: 'cus_stub' }),
  },
  subscriptions: {
    create: async () => ({ id: 'sub_stub' }),
    retrieve: async () => ({ id: 'sub_stub' }),
  },
  prices: {
    list: async () => ({ data: [] }),
  },
  products: {
    list: async () => ({ data: [] }),
  },
}

export default stripe