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
import { createClient } from '@/lib/supabase/server'
import { enterpriseSecurity } from '@/lib/auth/enterprise-security'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, remember } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }
    
    // Get client info for security logging
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Enterprise security validation
    try {
      const securityCheck = await enterpriseSecurity.validateLoginAttempt(email, ip)
      if (!securityCheck.allowed) {
        await enterpriseSecurity.logSecurityEvent('BLOCKED_LOGIN_ATTEMPT', {
          email,
          ip,
          userAgent,
          reason: securityCheck.reason
        })
        
        return NextResponse.json(
          { 
            error: securityCheck.reason,
            lockoutUntil: securityCheck.lockoutUntil 
          },
          { status: 403 }
        )
      }
    } catch (securityError) {
      console.warn('Security check failed, proceeding with login:', securityError)
    }

    const supabase = await createClient()
    
    // Attempt login
    console.log('Attempting login for:', email)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log('Login failed:', error.message)
      // Log failed attempt
      try {
        await enterpriseSecurity.logSecurityEvent('FAILED_LOGIN', {
          email,
          ip,
          userAgent,
          error: error.message
        })
      } catch (logError) {
        console.warn('Failed to log security event:', logError)
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check for anomalous activity
    let isAnomalous = false
    try {
      isAnomalous = await enterpriseSecurity.detectAnomalousActivity(
        data.user.id,
        ip,
        userAgent
      )
    } catch (anomalyError) {
      console.warn('Anomaly detection failed:', anomalyError)
    }

    // Log successful login
    try {
      await enterpriseSecurity.logSecurityEvent('SUCCESSFUL_LOGIN', {
        userId: data.user.id,
        email,
        ip,
        userAgent,
        anomalous: isAnomalous
      })
    } catch (logError) {
      console.warn('Failed to log successful login:', logError)
    }

    // Check if user needs to change password
    let forcePasswordChange = false
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('force_password_change')
        .eq('id', data.user.id)
        .single()
      
      forcePasswordChange = profile?.force_password_change || false
    } catch (profileError) {
      console.warn('Failed to check password change requirement:', profileError)
    }

    // Set session cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        emailVerified: data.user.email_confirmed_at !== null
      },
      requiresMFA: false,
      anomalousLogin: isAnomalous,
      forcePasswordChange
    })

    // Set activity tracking cookie
    response.cookies.set('last_activity', Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}