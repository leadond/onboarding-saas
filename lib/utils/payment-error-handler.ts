import Stripe from 'stripe'

export interface PaymentError {
  code: string
  message: string
  userMessage: string
  retryable: boolean
  httpStatus: number
}

/**
 * Maps Stripe error codes to user-friendly messages
 */
const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  // Card errors
  card_declined: 'Your card was declined. Please try a different payment method.',
  expired_card: 'Your card has expired. Please use a different payment method.',
  incorrect_cvc: 'Your card\'s security code is incorrect. Please try again.',
  insufficient_funds: 'Your card has insufficient funds. Please try a different payment method.',
  processing_error: 'An error occurred while processing your card. Please try again.',

  // Rate limiting
  rate_limit: 'Too many requests. Please wait a moment and try again.',

  // API key errors
  invalid_api_key: 'Payment service configuration error. Please contact support.',

  // General errors
  api_connection_error: 'Unable to connect to payment service. Please check your connection and try again.',
  api_error: 'Payment service error. Please try again or contact support.',
  authentication_error: 'Payment service authentication error. Please contact support.',
  invalid_request_error: 'Invalid payment request. Please try again or contact support.',

  // Customer errors
  customer_not_found: 'Customer account not found. Please contact support.',

  // Payment method errors
  payment_method_not_available: 'This payment method is not available. Please try a different method.',

  // Setup intent errors
  setup_intent_authentication_failure: 'Card authentication failed. Please try again.',
  setup_intent_unexpected_state: 'Payment setup failed. Please try again.',
}

/**
 * Determines if a Stripe error is retryable
 */
const RETRYABLE_STRIPE_ERRORS = new Set([
  'api_connection_error',
  'api_error',
  'rate_limit',
  'processing_error',
])

/**
 * Maps Stripe error codes to HTTP status codes
 */
const STRIPE_ERROR_HTTP_STATUS: Record<string, number> = {
  card_declined: 400,
  expired_card: 400,
  incorrect_cvc: 400,
  insufficient_funds: 400,
  processing_error: 500,
  rate_limit: 429,
  invalid_api_key: 500,
  api_connection_error: 502,
  api_error: 500,
  authentication_error: 401,
  invalid_request_error: 400,
  customer_not_found: 404,
  payment_method_not_available: 400,
  setup_intent_authentication_failure: 400,
  setup_intent_unexpected_state: 500,
}

/**
 * Handles Stripe errors and converts them to PaymentError format
 */
export function handleStripeError(error: any): PaymentError {
  if (error instanceof Stripe.errors.StripeError) {
    const code = error.code || 'unknown_error'
    const message = error.message || 'An unknown error occurred'
    const userMessage = STRIPE_ERROR_MESSAGES[code] || 'An unexpected error occurred. Please try again or contact support.'
    const retryable = RETRYABLE_STRIPE_ERRORS.has(code)
    const httpStatus = STRIPE_ERROR_HTTP_STATUS[code] || 500

    return {
      code,
      message,
      userMessage,
      retryable,
      httpStatus,
    }
  }

  // Handle non-Stripe errors
  return {
    code: 'unknown_error',
    message: error.message || 'An unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
    retryable: false,
    httpStatus: 500,
  }
}

/**
 * Handles general API errors for payment endpoints
 */
export function handleAPIError(error: any): PaymentError {
  // If it's already a PaymentError, return as is
  if (error.code && error.userMessage) {
    return error as PaymentError
  }

  // Handle Stripe errors
  if (error instanceof Stripe.errors.StripeError) {
    return handleStripeError(error)
  }

  // Handle network/fetch errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      code: 'network_error',
      message: 'Network request failed',
      userMessage: 'Unable to connect to the server. Please check your connection and try again.',
      retryable: true,
      httpStatus: 502,
    }
  }

  // Handle timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return {
      code: 'timeout_error',
      message: 'Request timeout',
      userMessage: 'The request timed out. Please try again.',
      retryable: true,
      httpStatus: 408,
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return {
      code: 'validation_error',
      message: error.message,
      userMessage: 'Please check your input and try again.',
      retryable: false,
      httpStatus: 400,
    }
  }

  // Handle authorization errors
  if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
    return {
      code: 'unauthorized',
      message: 'Unauthorized request',
      userMessage: 'You are not authorized to perform this action. Please sign in and try again.',
      retryable: false,
      httpStatus: 401,
    }
  }

  // Default error handling
  return {
    code: 'unknown_error',
    message: error.message || 'An unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again or contact support.',
    retryable: false,
    httpStatus: 500,
  }
}

/**
 * Retry helper for retryable payment operations
 */
export async function retryPaymentOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const paymentError = handleAPIError(error)

      // Don't retry if the error is not retryable
      if (!paymentError.retryable || attempt === maxRetries) {
        throw paymentError
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw handleAPIError(lastError)
}

/**
 * Logs payment errors for monitoring and debugging
 */
export function logPaymentError(error: PaymentError, context: Record<string, any> = {}) {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      code: error.code,
      message: error.message,
      httpStatus: error.httpStatus,
      retryable: error.retryable,
    },
    context,
  }

  // In production, you would send this to your logging service
  console.error('[PAYMENT ERROR]', logData)

  // For critical errors, you might want to send alerts
  if (error.httpStatus >= 500) {
    // Send alert to monitoring service
    console.error('[CRITICAL PAYMENT ERROR]', logData)
  }
}