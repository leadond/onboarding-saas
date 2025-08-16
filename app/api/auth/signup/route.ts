import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/validations/auth'
import {
  securityMiddleware,
  validateRequestBody,
  logSecurityEvent,
  validateCSRFToken
} from '@/lib/security/security-middleware'
import { signupRateLimiter } from '@/lib/security/rate-limiter'
import { applyRateLimit } from '@/lib/security/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const securityResponse = await securityMiddleware(request)
    if (securityResponse) {
      return securityResponse
    }

    // Apply rate limiting
    const rateLimitResponse = await applyRateLimit(request, signupRateLimiter)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    // Validate CSRF token
    if (!validateCSRFToken(request)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    // Validate and sanitize request body
    const validation = await validateRequestBody(request, signupSchema)
    if (!validation.isValid) {
      return validation.error!
    }

    const { email, password, fullName, companyName } = validation.data!
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    // Check if user already exists (use generic error to prevent enumeration)
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      await logSecurityEvent('signup_duplicate_email', {
        email,
        user_agent: request.headers.get('user-agent'),
      }, request)

      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
      },
    })

    if (authError) {
      // Log failed signup attempt
      await logSecurityEvent('signup_failed', {
        email,
        error: authError.message,
        user_agent: request.headers.get('user-agent'),
      }, request)

      // Handle specific auth errors
      if (authError.message === 'User already registered') {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      // Generic error message for other auth failures
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 400 }
      )
    }

    // Calculate trial end date (14 days from now)
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14)

    // Create user profile in our users table using admin client
    const { error: profileError } = await adminSupabase.from('users').insert({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: fullName,
      company_name: companyName || null,
      subscription_status: 'unpaid',
      subscription_tier: 'free',
      trial_ends_at: trialEndDate.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Failed to create user profile:', profileError)

      // Log security event
      await logSecurityEvent('signup_profile_creation_failed', {
        email,
        error: profileError.message,
        user_agent: request.headers.get('user-agent'),
      }, request)

      // Clean up auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Log successful signup
    await logSecurityEvent('signup_success', {
      method: 'email_signup',
      full_name: fullName,
      company_name: companyName,
      user_agent: request.headers.get('user-agent'),
    }, request, authData.user.id)

    // If user is immediately confirmed (e.g., in development)
    if (authData.session) {
      const { data: userProfile } = await adminSupabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      const response = NextResponse.json({
        user: {
          id: authData.user.id,
          email: authData.user.email,
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
        session: authData.session,
        message: 'Account created successfully',
      })

      // Set secure session cookie
      if (authData.session?.access_token) {
        response.cookies.set('access_token', authData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60, // 1 day
          path: '/',
        })
      }

      return response
    }

    // Return success message for email confirmation flow
    return NextResponse.json({
      user: null,
      session: null,
      message:
        'Account created successfully! Please check your email to confirm your account.',
      requiresEmailConfirmation: true,
    })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
