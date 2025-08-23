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
import { createProtectedRoute } from '@/lib/api/gateway'

// GET /api/v1/kits - List kits
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    const { user } = context

    try {
      // Mock kits data
      const kits = [
        {
          id: '1',
          title: 'Sample Onboarding Kit',
          description: 'A sample kit for testing',
          user_id: user.id,
          is_published: true,
          created_at: new Date().toISOString(),
        }
      ]

      return NextResponse.json({
        success: true,
        data: kits,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch kits' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/kits - Create kit
export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    const { user } = context

    try {
      const body = await request.json()

      // Mock kit creation
      const newKit = {
        id: Date.now().toString(),
        title: body.title || 'New Kit',
        description: body.description || '',
        user_id: user.id,
        is_published: false,
        created_at: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        data: newKit,
      }, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to create kit' },
        { status: 500 }
      )
    }
  }
)
