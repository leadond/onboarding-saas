/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

export async function protectedRoute(
  request: NextRequest,
  handler: (user: any) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Extract token from cookie or Authorization header
    let token: string | undefined

    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')))
    token = cookies['session_token']

    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    // Pass user info to handler
    return await handler(payload)
  } catch (error) {
    console.error('Protected route error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
