import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'
import { z } from 'zod'
import {
  securityMiddleware,
  validateRequestBody,
  logSecurityEvent,
  validateCSRFToken
} from '@/lib/security/security-middleware'
import { authRateLimiter, applyRateLimit } from '@/lib/security/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, authRateLimiter)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Basic request body parsing with validation
    const body = await request.json()
    const { email, password, remember } = body

    // Basic input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Basic password length validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }
    const supabase = createClient()

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log failed login attempt
      await logSecurityEvent('login_failed', {
        email,
        error: error.message,
        user_agent: request.headers.get('user-agent'),
      }, request)

      // Handle specific auth errors with generic messages
      if (error.message === 'Invalid login credentials') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      if (error.message === 'Email not confirmed') {
        return NextResponse.json(
          {
            error: 'Email not confirmed',
            message:
              'Please check your email and click the confirmation link before signing in.',
          },
          { status: 401 }
        )
      }

      // Generic error message for other auth failures
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Update last login timestamp
    await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.user.id)

    // Log successful login
    await logSecurityEvent('login_success', {
      method: 'email_password',
      remember_me: remember,
      user_agent: request.headers.get('user-agent'),
    }, request, data.user.id)

    // Get user profile data
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // Create response with security headers
    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: userProfile?.full_name,
        companyName: userProfile?.company_name,
        avatarUrl: userProfile?.avatar_url,
        subscriptionStatus: userProfile?.subscription_status,
        subscriptionTier: userProfile?.subscription_tier,
        trialEndsAt: userProfile?.trial_ends_at,
        onboardingCompletedAt: userProfile?.onboarding_completed_at,
        createdAt: userProfile?.created_at,
        updatedAt: userProfile?.updated_at,
      },
      session: data.session,
    })

    // Set secure session cookie flags
    if (data.session?.access_token) {
      response.cookies.set('access_token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days if remember, else 1 day
        path: '/',
      })
    }

    return response
  } catch (error) {
    // Log security event for unexpected errors
    await logSecurityEvent('login_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      user_agent: request.headers.get('user-agent'),
    }, request)

    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS with security headers
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  
  // Apply security headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Max-Age', '86400')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  return response
}
