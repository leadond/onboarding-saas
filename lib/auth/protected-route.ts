import { NextRequest, NextResponse } from 'next/server'

export async function protectedRoute(
  request: NextRequest,
  handler: (user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Mock authentication - in production, use real auth
    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
    }

    return await handler(mockUser)
  } catch (error) {
    console.error('Protected route error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
