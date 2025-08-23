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
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Handle authentication for protected routes
  if (!user && !publicRoutes.includes(pathname) && !pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Handle admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user has admin role (you'll need to implement this based on your user roles)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

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