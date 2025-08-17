import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
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

    const supabase = await createClient()

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      
      // Handle specific auth errors
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
            message: 'Please check your email and click the confirmation link before signing in.',
          },
          { status: 401 }
        )
      }

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

    // Try to get user profile data (optional, won't fail if table doesn't exist)
    let userProfile = null
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()
      userProfile = profile
    } catch (profileError) {
      console.log('User profile not found, using auth data only')
    }

    // Create response
    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: userProfile?.full_name || data.user.user_metadata?.full_name,
        companyName: userProfile?.company_name,
        avatarUrl: userProfile?.avatar_url || data.user.user_metadata?.avatar_url,
        subscriptionStatus: userProfile?.subscription_status || 'free',
        subscriptionTier: userProfile?.subscription_tier || 'free',
        trialEndsAt: userProfile?.trial_ends_at,
        onboardingCompletedAt: userProfile?.onboarding_completed_at,
        createdAt: userProfile?.created_at || data.user.created_at,
        updatedAt: userProfile?.updated_at,
      },
      session: data.session,
    })

    return response
  } catch (error) {
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
