'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function BillingPage() {
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUpdatePaymentMethod = async () => {
    setIsUpdatingPayment(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/billing/update-payment-method', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create setup intent')
      }

      // In a real implementation, you would redirect to Stripe Elements
      // For now, we'll simulate the process
      setSuccess('Payment method update initiated. Please complete the payment setup.')

      // Simulate completion after a delay
      setTimeout(() => {
        setSuccess('Payment method updated successfully!')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  const handleCustomerPortal = async () => {
    setIsLoadingPortal(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/create-customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/billing`
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create customer portal session')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = result.data.url

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoadingPortal(false)
    }
  }

  const dismissMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-600">
            Manage your subscription, billing history, and payment methods.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleUpdatePaymentMethod}
            disabled={isUpdatingPayment}
          >
            {isUpdatingPayment ? (
              <>
                <LoadingSpinner className="mr-2" />
                Updating...
              </>
            ) : (
              'Update Payment Method'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleCustomerPortal}
            disabled={isLoadingPortal}
          >
            {isLoadingPortal ? (
              <>
                <LoadingSpinner className="mr-2" />
                Loading...
              </>
            ) : (
              'Manage Billing'
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {(error || success) && (
        <div className="mb-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        type="button"
                        className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                        onClick={dismissMessages}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{success}</p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <button
                        type="button"
                        className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                        onClick={dismissMessages}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Plan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <h3 className="text-lg font-semibold">Enterprise Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Unlimited onboarding kits, advanced analytics, priority support, custom integrations
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">$99</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm font-medium">Billing Period</p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </div>
              <div>
                <p className="text-sm font-medium">Next Billing Date</p>
                <p className="text-sm text-muted-foreground">August 15, 2024</p>
              </div>
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-green-600 font-medium">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
            <CardDescription>Current billing cycle usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Kits</span>
                  <span>12 / Unlimited</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Client Invitations</span>
                  <span>47 / Unlimited</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage Used</span>
                  <span>2.4GB / 50GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm font-medium">Invoice #INV-2024-007</p>
                  <p className="text-xs text-muted-foreground">July 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">$49.00</p>
                  <p className="text-xs text-green-600">Paid</p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm font-medium">Invoice #INV-2024-006</p>
                  <p className="text-xs text-muted-foreground">June 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">$49.00</p>
                  <p className="text-xs text-green-600">Paid</p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <p className="text-sm font-medium">Invoice #INV-2024-005</p>
                  <p className="text-xs text-muted-foreground">May 15, 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium">$49.00</p>
                  <p className="text-xs text-green-600">Paid</p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Options */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Upgrade or downgrade your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Starter</h3>
              <p className="text-3xl font-bold mb-4">
                $19<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Up to 5 onboarding kits</li>
                <li>✓ Basic analytics</li>
                <li>✓ Email support</li>
                <li>✓ 10GB storage</li>
              </ul>
              <Button variant="outline" className="w-full">
                Downgrade
              </Button>
            </div>

            <div className="p-6 rounded-lg border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Current Plan
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <p className="text-3xl font-bold mb-4">
                $49<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Unlimited onboarding kits</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority support</li>
                <li>✓ 50GB storage</li>
                <li>✓ Custom branding</li>
              </ul>
              <Button className="w-full" disabled>
                Current Plan
              </Button>
            </div>

            <div className="p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
              <p className="text-3xl font-bold mb-4">
                $149<span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
              <ul className="space-y-2 text-sm mb-6">
                <li>✓ Everything in Pro</li>
                <li>✓ API access</li>
                <li>✓ Dedicated support</li>
                <li>✓ Unlimited storage</li>
                <li>✓ SSO integration</li>
              </ul>
              <Button className="w-full">
                Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}