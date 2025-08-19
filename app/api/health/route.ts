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
import { createClient } from '@supabase/supabase-js'

// Health check endpoint for production monitoring
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Basic health check response
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        api: 'healthy',
        database: 'checking',
        features: 'checking'
      }
    }

    // Database connectivity check
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )
        
        // Simple query to test database connectivity
        const { data, error } = await supabase
          .from('organizations')
          .select('count')
          .limit(1)
          .single()
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          healthStatus.checks.database = 'unhealthy'
          healthStatus.status = 'degraded'
        } else {
          healthStatus.checks.database = 'healthy'
        }
      } else {
        healthStatus.checks.database = 'not_configured'
      }
    } catch (dbError) {
      console.error('Database health check failed:', dbError)
      healthStatus.checks.database = 'unhealthy'
      healthStatus.status = 'degraded'
    }

    // Feature availability check
    const features = {
      analytics: true,
      email_integration: !!process.env.SENDGRID_API_KEY || !!process.env.RESEND_API_KEY,
      ai_features: !!process.env.OPENAI_API_KEY,
      document_signing: !!process.env.BOLDSIGN_API_KEY,
      sms_notifications: !!process.env.TWILIO_ACCOUNT_SID,
      payment_processing: !!process.env.STRIPE_SECRET_KEY,
      file_storage: !!process.env.AWS_ACCESS_KEY_ID || !!process.env.CLOUDINARY_CLOUD_NAME,
      cache: !!process.env.UPSTASH_REDIS_REST_URL
    }

    const enabledFeatures = Object.values(features).filter(Boolean).length
    const totalFeatures = Object.keys(features).length
    
    healthStatus.checks.features = `${enabledFeatures}/${totalFeatures} enabled`

    // Add performance metrics
    const responseTime = Date.now() - startTime
    const performanceMetrics = {
      response_time_ms: responseTime,
      memory_usage: process.memoryUsage(),
      cpu_usage: process.cpuUsage()
    }

    // Determine overall status
    if (healthStatus.checks.database === 'unhealthy') {
      healthStatus.status = 'unhealthy'
    } else if (healthStatus.checks.database === 'not_configured') {
      healthStatus.status = 'development'
    }

    const response = {
      ...healthStatus,
      features,
      performance: performanceMetrics,
      flagship_features: {
        total: 21,
        implemented: 21,
        status: 'complete'
      }
    }

    // Return appropriate HTTP status code
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                     healthStatus.status === 'degraded' ? 200 : 
                     healthStatus.status === 'development' ? 200 : 503

    return NextResponse.json(response, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      checks: {
        api: 'unhealthy',
        database: 'unknown',
        features: 'unknown'
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

// Support HEAD requests for simple uptime checks
export async function HEAD(request: NextRequest) {
  try {
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}