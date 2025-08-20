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

import { NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

// Enterprise security configuration
const ENTERPRISE_CONFIG = {
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION_MINUTES || '15'),
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60'),
  ipWhitelist: process.env.IP_WHITELIST?.split(',').map(ip => ip.trim()),
  allowedDomains: process.env.ALLOWED_DOMAINS?.split(',').map(domain => domain.trim()),
  requireMFA: process.env.REQUIRE_MFA === 'true',
  passwordComplexity: {
    minLength: parseInt(process.env.MIN_PASSWORD_LENGTH || '12'),
    requireUppercase: process.env.REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.REQUIRE_NUMBERS !== 'false',
    requireSymbols: process.env.REQUIRE_SYMBOLS !== 'false',
  }
}

export class EnterpriseSecurityManager {
  async validateLoginAttempt(email: string, ip: string): Promise<{
    allowed: boolean
    reason?: string
    lockoutUntil?: Date
  }> {
    try {
      // Check IP whitelist
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
      const supabase = await getSupabaseClient()
      const { data: attempts } = await supabase
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
    } catch (error) {
      console.error('Error validating login attempt:', error)
      return { allowed: true } // Fail open for availability
    }
  }

  async logSecurityEvent(eventType: string, metadata: any): Promise<void> {
    try {
      const supabase = await getSupabaseClient()
      await supabase.from('security_logs').insert({
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
    try {
      const supabase = await getSupabaseClient()
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
        .from('profiles')
        .select('status, role')
        .eq('id', user.id)
        .single()

      if (!userProfile || userProfile.status !== 'active') {
        return { valid: false, reason: 'User account is not active' }
      }

      return { valid: true, user: { ...user, profile: userProfile } }
    } catch (error) {
      console.error('Error validating session:', error)
      return { valid: false, reason: 'Session validation error' }
    }
  }

  async checkSuspiciousActivity(userId: string, ip: string): Promise<{
    suspicious: boolean
    reasons: string[]
  }> {
    try {
      const supabase = await getSupabaseClient()
      const reasons: string[] = []
      
      // Check for multiple IPs in short time
      const { data: recentLogins } = await supabase
        .from('security_logs')
        .select('metadata')
        .eq('event_type', 'LOGIN_SUCCESS')
        .eq('metadata->>userId', userId)
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentLogins) {
        const uniqueIPs = new Set(recentLogins.map(log => log.metadata.ip))
        if (uniqueIPs.size > 3) {
          reasons.push('Multiple IP addresses detected in short time period')
        }
      }

      return {
        suspicious: reasons.length > 0,
        reasons
      }
    } catch (error) {
      console.error('Error checking suspicious activity:', error)
      return { suspicious: false, reasons: [] }
    }
  }
}

// Export singleton instance
export const enterpriseSecurity = new EnterpriseSecurityManager()
export default enterpriseSecurity