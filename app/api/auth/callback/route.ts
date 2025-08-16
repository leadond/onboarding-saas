import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/dashboard'
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

    // Check if user profile exists in our database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // If user doesn't exist in our database (OAuth signup), create profile
    if (profileError && profileError.code === 'PGRST116') {
      // Calculate trial end date (14 days from now)
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 14)

      const { error: createProfileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.user_metadata?.display_name ||
            null,
          avatar_url:
            data.user.user_metadata?.avatar_url ||
            data.user.user_metadata?.picture ||
            null,
          subscription_status: 'unpaid',
          subscription_tier: 'free',
          trial_ends_at: trialEndDate.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (createProfileError) {
        console.error('Failed to create user profile:', createProfileError)
        const redirectUrl = new URL('/login', requestUrl.origin)
        redirectUrl.searchParams.set('error', 'Failed to create user profile')
        return NextResponse.redirect(redirectUrl)
      }

      // Log audit event for OAuth signup
      await supabase.from('audit_logs').insert({
        user_id: data.user.id,
        action: 'create',
        resource_type: 'user',
        resource_id: data.user.id,
        details: {
          method: 'oauth_signup',
          provider: data.user.app_metadata?.provider || 'unknown',
          user_agent: request.headers.get('user-agent'),
        },
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1',
      })
    } else if (userProfile) {
      // Update last login for existing users
      await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)

      // Log audit event for login
      await supabase.from('audit_logs').insert({
        user_id: data.user.id,
        action: 'login',
        resource_type: 'user',
        resource_id: data.user.id,
        details: {
          method: data.user.app_metadata?.provider
            ? 'oauth_login'
            : 'email_verification',
          provider: data.user.app_metadata?.provider || null,
          user_agent: request.headers.get('user-agent'),
        },
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1',
      })
    }

    // Determine redirect destination
    let redirectTo = next

    // If this is a first-time OAuth signup, redirect to onboarding
    if (profileError && profileError.code === 'PGRST116') {
      redirectTo = '/dashboard/onboarding'
    }

    // Ensure redirect URL is safe (same origin)
    const redirectUrl = new URL(redirectTo, requestUrl.origin)

    // Add success message for email verification
    if (!data.user.app_metadata?.provider) {
      redirectUrl.searchParams.set('message', 'Email verified successfully')
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
