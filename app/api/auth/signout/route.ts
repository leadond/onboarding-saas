import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current session to log the user out
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      // Log audit event before signing out
      await supabase.from('audit_logs').insert({
        user_id: session.user.id,
        action: 'logout',
        resource_type: 'user',
        resource_id: session.user.id,
        details: {
          method: 'manual_signout',
          user_agent: request.headers.get('user-agent'),
        },
        ip_address:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          '127.0.0.1',
      })
    }

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to sign out', message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Successfully signed out',
    })
  } catch (error) {
    console.error('Signout API error:', error)
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
