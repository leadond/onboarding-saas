import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Signout error:', error)
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      )
    }

    // Create response
    const response = NextResponse.json({
      message: 'Successfully signed out',
    })

    // Clear any auth cookies
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')

    return response
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