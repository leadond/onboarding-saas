import { NextRequest, NextResponse } from 'next/server'
import { nylasClient } from '@/lib/integrations/nylas-client'
import { protectedRoute } from '@/lib/auth/protected-route'

// GET /api/integrations/nylas - Get Nylas accounts and status
export async function GET(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const accounts = await nylasClient.getAccounts()
      
      return NextResponse.json({
        success: true,
        data: {
          accounts,
          connected: accounts.length > 0,
          features: {
            email: true,
            calendar: true,
            contacts: true,
            scheduling: true,
            webhooks: true,
            tracking: true,
          },
        },
      })
    } catch (error) {
      console.error('Nylas integration error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch Nylas accounts' },
        { status: 500 }
      )
    }
  })
}

// POST /api/integrations/nylas - Connect new Nylas account
export async function POST(request: NextRequest) {
  return protectedRoute(request, async (user) => {
    try {
      const body = await request.json()
      const { provider, email, credentials } = body

      // In a real implementation, this would handle OAuth flow
      // For now, we'll simulate account connection
      const mockAccount = {
        id: `acc-${Date.now()}`,
        email,
        provider,
        sync_state: 'running' as const,
        account_from_header_only: false,
        trial: false,
        billing_state: 'paid' as const,
      }

      return NextResponse.json({
        success: true,
        data: {
          account: mockAccount,
          message: 'Account connected successfully',
        },
      })
    } catch (error) {
      console.error('Nylas account connection error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to connect account' },
        { status: 500 }
      )
    }
  })
}