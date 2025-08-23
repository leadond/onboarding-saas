import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { securityHeaders } from '@/lib/security/security-middleware'

const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/auth']
const publicApiRoutes = ['/api/auth', '/api/health', '/api/test-email', '/api/webhooks']
const adminRoutes = ['/admin', '/dashboard/admin']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers }
  })

  const pathname = request.nextUrl.pathname

  // Block debug route in production
  if (pathname === '/debug' && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Allow public routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return response
  }

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return response
  }

  // Check authentication for protected routes
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}