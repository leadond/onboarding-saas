/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/api/gateway'

// GET /api/v1/experiments/[experimentId] - Get experiment
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const url = new URL(request.url)
      const experimentId = url.pathname.split('/').pop()

      // Mock experiment data
      const experiment = {
        id: experimentId,
        name: 'Sample Experiment',
        status: 'active',
        created_at: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        data: experiment,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch experiment' },
        { status: 500 }
      )
    }
  }
)
