import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/api/gateway'

// GET /api/v1/api-keys/[keyId] - Get API key
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const url = new URL(request.url)
      const keyId = url.pathname.split('/').pop()

      // Mock API key data
      const apiKey = {
        id: keyId,
        name: 'Sample API Key',
        permissions: ['read'],
        created_at: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        data: apiKey,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch API key' },
        { status: 500 }
      )
    }
  }
)

// DELETE /api/v1/api-keys/[keyId] - Delete API key
export const DELETE = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      return NextResponse.json({
        success: true,
        message: 'API key deleted successfully',
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      )
    }
  }
)
