import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Simple in-memory rate limiter store
const rateLimitStore = new Map()

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function getClientIp(request) {
  // Try to get IP from headers or fallback to connection remote address
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const now = Date.now()
    const record = rateLimitStore.get(ip) || { count: 0, startTime: now }

    if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
      // Reset window
      record.count = 0
      record.startTime = now
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
    }

    record.count++
    rateLimitStore.set(ip, record)

    if (request.headers.get('content-type') !== 'application/json') {
      return NextResponse.json({ error: 'Expected application/json' }, { status: 400 })
    }

    const body = await request.json()

    const parseResult = loginSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const { email, password } = parseResult.data

    // Use regular Supabase client for authentication
    const supabase = await createServerSupabaseClient()
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signInData.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Set token as secure HttpOnly cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: 'session_token',
      value: signInData.session.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}