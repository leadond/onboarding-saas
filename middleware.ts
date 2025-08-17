import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth',
]

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/signup', 
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/health',
]

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    // Allow public routes and API routes
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      return NextResponse.next()
    }

    if (publicApiRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      return NextResponse.next()
    }

    // For now, allow all dashboard routes to pass through
    // In production, you would implement proper authentication checking
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.next()
    }

    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
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