import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/test-dashboard'
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      const errorMessage = error_description || 'Authentication failed'
      const redirectUrl = new URL('/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', errorMessage)
      return NextResponse.redirect(redirectUrl)
    }

    if (!code) {
      const redirectUrl = new URL('/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'Missing authentication code')
      return NextResponse.redirect(redirectUrl)
    }

    const supabase = createClient()

    // Exchange code for session
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.user) {
      console.error('Code exchange error:', exchangeError)
      const redirectUrl = new URL('/login', requestUrl.origin)
      redirectUrl.searchParams.set('error', 'Failed to authenticate')
      return NextResponse.redirect(redirectUrl)
    }

    // Determine redirect destination
    let redirectTo = next

    // Ensure redirect URL is safe (same origin)
    const redirectUrl = new URL(redirectTo, requestUrl.origin)

    // Add success message for email verification
    if (!data.user.app_metadata?.provider) {
      redirectUrl.searchParams.set('message', 'Email verified successfully')
    } else {
      redirectUrl.searchParams.set('message', 'Successfully signed in')
    }

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Auth callback error:', error)
    const requestUrl = new URL(request.url)
    const redirectUrl = new URL('/login', requestUrl.origin)
    redirectUrl.searchParams.set('error', 'Authentication failed')
    return NextResponse.redirect(redirectUrl)
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
