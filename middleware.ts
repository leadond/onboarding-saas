import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/auth']
const publicApiRoutes = ['/api/auth', '/api/health', '/api/test-email', '/api/webhooks']
const adminRoutes = ['/admin', '/dashboard/admin']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Block debug route in production
  if (pathname === '/debug' && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow all routes for now (simplified for deployment)
  return NextResponse.next()
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