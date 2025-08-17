import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, companyName } = body

    // Basic input validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
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

    // Basic password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onboard.devapphero.com'}/api/auth/callback`,
      },
    })

    if (authError) {
      console.error('Signup error:', authError)
      
      // Handle specific auth errors
      if (authError.message === 'User already registered') {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

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

    // If user is immediately confirmed (e.g., in development)
    if (authData.session) {
      const response = NextResponse.json({
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: authData.user.user_metadata?.full_name || fullName,
          companyName: authData.user.user_metadata?.company_name || companyName,
          avatarUrl: authData.user.user_metadata?.avatar_url,
          subscriptionStatus: 'free',
          subscriptionTier: 'free',
          createdAt: authData.user.created_at,
        },
        session: authData.session,
        message: 'Account created successfully',
      })

      return response
    }

    // Return success message for email confirmation flow
    return NextResponse.json({
      user: null,
      session: null,
      message: 'Account created successfully! Please check your email to confirm your account.',
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
