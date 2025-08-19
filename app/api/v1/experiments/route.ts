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

// GET /api/v1/experiments - List experiments
export const GET = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      // Mock experiments data
      const experiments = [
        {
          id: '1',
          name: 'Button Color Test',
          status: 'active',
          created_at: new Date().toISOString(),
        }
      ]

      return NextResponse.json({
        success: true,
        data: experiments,
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch experiments' },
        { status: 500 }
      )
    }
  }
)

// POST /api/v1/experiments - Create experiment
export const POST = createProtectedRoute(
  async (request: NextRequest, context: any) => {
    try {
      const body = await request.json()

      // Mock experiment creation
      const newExperiment = {
        id: Date.now().toString(),
        name: body.name || 'New Experiment',
        status: 'draft',
        created_at: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        data: newExperiment,
      }, { status: 201 })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to create experiment' },
        { status: 500 }
      )
    }
  }
)
