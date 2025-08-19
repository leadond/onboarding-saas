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

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

interface SecurityConfig {
  maxLoginAttempts: number
  lockoutDuration: number // minutes
  sessionTimeout: number // minutes
  requireMFA: boolean
  allowedDomains?: string[]
  ipWhitelist?: string[]
}

const ENTERPRISE_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 10,
  requireMFA: process.env.NODE_ENV === 'production',
  allowedDomains: process.env.ALLOWED_EMAIL_DOMAINS?.split(','),
  ipWhitelist: process.env.IP_WHITELIST?.split(',')
}

export class EnterpriseSecurityManager {
  private supabase = createClient()

  async validateLoginAttempt(email: string, ip: string): Promise<{
    allowed: boolean
    reason?: string
    lockoutUntil?: Date
  }> {
    // Check IP whitelist if configured
    if (ENTERPRISE_CONFIG.ipWhitelist?.length) {
      if (!ENTERPRISE_CONFIG.ipWhitelist.includes(ip)) {
        await this.logSecurityEvent('IP_BLOCKED', { email, ip })
        return { allowed: false, reason: 'IP address not whitelisted' }
      }
    }

    // Check domain restrictions
    if (ENTERPRISE_CONFIG.allowedDomains?.length) {
      const domain = email.split('@')[1]
      if (!ENTERPRISE_CONFIG.allowedDomains.includes(domain)) {
        await this.logSecurityEvent('DOMAIN_BLOCKED', { email, domain })
        return { allowed: false, reason: 'Email domain not allowed' }
      }
    }

    // Check failed login attempts
    const { data: attempts } = await this.supabase
      .from('security_logs')
      .select('*')
      .eq('event_type', 'FAILED_LOGIN')
      .eq('metadata->>email', email)
      .gte('created_at', new Date(Date.now() - ENTERPRISE_CONFIG.lockoutDuration * 60000).toISOString())
      .order('created_at', { ascending: false })

    if (attempts && attempts.length >= ENTERPRISE_CONFIG.maxLoginAttempts) {
      const lockoutUntil = new Date(attempts[0].created_at)
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + ENTERPRISE_CONFIG.lockoutDuration)
      
      if (new Date() < lockoutUntil) {
        await this.logSecurityEvent('ACCOUNT_LOCKED', { email, ip, attempts: attempts.length })
        return { 
          allowed: false, 
          reason: 'Account temporarily locked due to failed login attempts',
          lockoutUntil 
        }
      }
    }

    return { allowed: true }
  }

  async logSecurityEvent(eventType: string, metadata: any): Promise<void> {
    try {
      await this.supabase.from('security_logs').insert({
        event_type: eventType,
        metadata,
        ip_address: metadata.ip,
        user_agent: metadata.userAgent,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  async validateSession(request: NextRequest): Promise<{
    valid: boolean
    reason?: string
    user?: any
  }> {
    const supabase = createClient()
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return { valid: false, reason: 'No valid session' }
      }

      // Check session timeout
      const lastActivity = request.cookies.get('last_activity')?.value
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity)
        if (timeSinceActivity > ENTERPRISE_CONFIG.sessionTimeout * 60000) {
          await this.logSecurityEvent('SESSION_TIMEOUT', { 
            userId: user.id, 
            timeSinceActivity 
          })
          return { valid: false, reason: 'Session expired due to inactivity' }
        }
      }

      // Validate user status
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('status, mfa_enabled')
        .eq('id', user.id)
        .single()

      if (userProfile?.status === 'suspended') {
        await this.logSecurityEvent('SUSPENDED_USER_ACCESS', { userId: user.id })
        return { valid: false, reason: 'Account suspended' }
      }

      // Check MFA requirement
      if (ENTERPRISE_CONFIG.requireMFA && !userProfile?.mfa_enabled) {
        return { valid: false, reason: 'MFA required for enterprise access' }
      }

      return { valid: true, user }
    } catch (error) {
      console.error('Session validation error:', error)
      return { valid: false, reason: 'Session validation failed' }
    }
  }

  async enforcePasswordPolicy(password: string): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    // Check against common passwords
    const commonPasswords = [
      'password123', 'admin123', 'welcome123', 'company123'
    ]
    if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
      errors.push('Password contains common patterns and is not secure')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  async detectAnomalousActivity(userId: string, ip: string, userAgent: string): Promise<boolean> {
    try {
      // Get recent login locations
      const { data: recentLogins } = await this.supabase
        .from('security_logs')
        .select('metadata')
        .eq('event_type', 'SUCCESSFUL_LOGIN')
        .eq('metadata->>userId', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentLogins && recentLogins.length > 0) {
        const recentIPs = recentLogins.map(log => log.metadata.ip).filter(Boolean)
        const recentUserAgents = recentLogins.map(log => log.metadata.userAgent).filter(Boolean)

        // Check for new IP
        if (!recentIPs.includes(ip)) {
          await this.logSecurityEvent('NEW_IP_LOGIN', { userId, ip, userAgent })
          return true
        }

        // Check for new device/browser
        if (!recentUserAgents.includes(userAgent)) {
          await this.logSecurityEvent('NEW_DEVICE_LOGIN', { userId, ip, userAgent })
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Anomaly detection error:', error)
      return false
    }
  }
}

export const enterpriseSecurity = new EnterpriseSecurityManager()