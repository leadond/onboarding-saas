/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

'use client'

import * as React from 'react'
import { CreditCard, CheckCircle2, AlertCircle, Lock } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { ClientProgress } from '@/types/database'

interface PaymentStepProps {
  step: KitStep
  clientData?: any
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: ClientProgress
  className?: string
}

export function PaymentStep({
  step,
  clientData,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
  progress,
  className,
}: PaymentStepProps) {
  const { content, title, description } = step
  const paymentConfig = content.payment_config

  const [paymentStatus, setPaymentStatus] = React.useState<
    'idle' | 'processing' | 'completed' | 'failed'
  >('idle')
  const [paymentData, setPaymentData] = React.useState<any>(null)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  // Check if payment is already completed
  React.useEffect(() => {
    if (progress?.status === 'completed' && progress.response_data) {
      const payment = progress.response_data as any
      setPaymentData(payment)
      setPaymentStatus('completed')
    }
  }, [progress])

  const handlePayment = async () => {
    if (!paymentConfig) return

    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      // In production, this would integrate with Stripe or another payment processor
      if (process.env.NODE_ENV === 'development') {
        // Mock payment processing
        await new Promise(resolve => setTimeout(resolve, 2000))

        const mockPayment = {
          payment_id: `mock_payment_${Date.now()}`,
          amount: paymentConfig.amount,
          currency: paymentConfig.currency,
          description: paymentConfig.description,
          status: 'completed',
          paid_at: new Date().toISOString(),
          payment_method: 'card',
          receipt_url: 'https://example.com/receipt/mock123',
        }

        setPaymentData(mockPayment)
        setPaymentStatus('completed')

        // Save payment completion
        await onComplete({
          step_id: step.id,
          response_data: mockPayment,
          status: 'completed',
        })

        // Auto-advance if configured
        if (step.settings?.auto_advance && onNext) {
          setTimeout(() => {
            onNext()
          }, 2000)
        }
      } else {
        // Production Stripe integration would go here
        // This is a placeholder for the actual Stripe implementation
        const stripe = (window as any).Stripe?.(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        )

        if (!stripe) {
          throw new Error('Stripe not initialized')
        }

        // Create payment intent
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: paymentConfig.amount,
            currency: paymentConfig.currency,
            description: paymentConfig.description,
            clientData,
          }),
        })

        const { client_secret } = await response.json()

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          client_secret,
          {
            payment_method: {
              card: {
                // Card element would be here
              },
            },
          }
        )

        if (error) {
          throw new Error(error.message)
        }

        const completedPayment = {
          payment_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          description: paymentConfig.description,
          status: paymentIntent.status,
          paid_at: new Date().toISOString(),
          receipt_url: paymentIntent.receipt_url,
        }

        setPaymentData(completedPayment)
        setPaymentStatus('completed')

        await onComplete({
          step_id: step.id,
          response_data: completedPayment,
          status: 'completed',
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('failed')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Payment failed. Please try again.'
      )
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100) // Assuming amount is in cents
  }

  if (!paymentConfig) {
    return (
      <Card className={cn('mx-auto w-full max-w-2xl', className)}>
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Payment configuration has not been set up for this step.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('mx-auto w-full max-w-2xl', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-2 text-base">
            {description}
          </CardDescription>
        )}
        {content.instructions && (
          <div
            className="prose prose-sm mt-4 max-w-none text-left"
            dangerouslySetInnerHTML={{ __html: content.instructions }}
          />
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Completed */}
        {paymentStatus === 'completed' && paymentData && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" />
            <h3 className="mb-2 text-lg font-semibold text-green-800">
              Payment Successful!
            </h3>
            <p className="mb-4 text-green-700">
              Thank you for your payment of{' '}
              {formatAmount(paymentData.amount, paymentData.currency)}.
            </p>
            <div className="space-y-1 text-sm text-green-600">
              <p>Payment ID: {paymentData.payment_id}</p>
              <p>
                Paid on: {new Date(paymentData.paid_at).toLocaleDateString()}
              </p>
              {paymentData.receipt_url && (
                <p>
                  <a
                    href={paymentData.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    View Receipt
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Payment Form */}
        {paymentStatus !== 'completed' && (
          <>
            {/* Payment Details */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-blue-900">
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Description:</span>
                  <span className="font-medium text-blue-900">
                    {paymentConfig.description}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Amount:</span>
                  <span className="text-xl font-bold text-blue-900">
                    {formatAmount(paymentConfig.amount, paymentConfig.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700">Payment Methods:</span>
                  <span className="text-blue-900">
                    {paymentConfig.payment_methods?.join(', ') ||
                      'Credit/Debit Card'}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
              <Lock className="mr-2 h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                Your payment information is secure and encrypted
              </span>
            </div>

            {/* Payment Button */}
            <div className="text-center">
              {paymentStatus === 'processing' ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="md" className="mr-3" />
                  <span className="text-lg">Processing payment...</span>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="w-full bg-green-600 py-4 text-lg text-white hover:bg-green-700"
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  Pay{' '}
                  {formatAmount(paymentConfig.amount, paymentConfig.currency)}
                </Button>
              )}
            </div>

            {/* Error Message */}
            {paymentStatus === 'failed' && errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-800">
                    Payment Failed
                  </span>
                </div>
                <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPaymentStatus('idle')
                    setErrorMessage('')
                  }}
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            )}
          </>
        )}

        {/* Requirements */}
        {step.is_required && paymentStatus !== 'completed' && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Required:</strong> Payment must be completed to continue
              with the onboarding process.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
          {onPrevious ? (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading || paymentStatus === 'processing'}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {paymentStatus === 'completed' && onNext && (
            <Button type="button" onClick={onNext} disabled={isLoading}>
              Continue
            </Button>
          )}

          {!step.is_required && paymentStatus === 'idle' && onNext && (
            <Button
              type="button"
              variant="outline"
              onClick={onNext}
              disabled={isLoading}
            >
              Skip Payment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing payment step state
export function usePaymentStep() {
  const [paymentStatus, setPaymentStatus] = React.useState<
    'idle' | 'processing' | 'completed' | 'failed'
  >('idle')
  const [paymentData, setPaymentData] = React.useState<any>(null)
  const [errorMessage, setErrorMessage] = React.useState<string>('')

  const processPayment = async (paymentConfig: any, clientData: any) => {
    setPaymentStatus('processing')
    setErrorMessage('')

    try {
      // Payment processing logic would go here
      // This is a simplified mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockPayment = {
        payment_id: `payment_${Date.now()}`,
        amount: paymentConfig.amount,
        currency: paymentConfig.currency,
        status: 'completed',
        paid_at: new Date().toISOString(),
      }

      setPaymentData(mockPayment)
      setPaymentStatus('completed')
      return mockPayment
    } catch (error) {
      setPaymentStatus('failed')
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed')
      throw error
    }
  }

  const reset = () => {
    setPaymentStatus('idle')
    setPaymentData(null)
    setErrorMessage('')
  }

  return {
    paymentStatus,
    paymentData,
    errorMessage,
    processPayment,
    setPaymentStatus,
    setErrorMessage,
    reset,
  }
}
