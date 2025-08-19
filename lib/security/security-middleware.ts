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
import { applyRateLimit, authRateLimiter, generalRateLimiter, passwordResetRateLimiter, signupRateLimiter } from './rate-limiter'
import { createClient } from '@/lib/supabase/server'

// Security headers configuration
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

// Input validation and sanitization patterns
export const securityPatterns = {
  // SQL Injection patterns
  sqlInjection: [
    /(\s|^)(OR|AND)\s+\d+\s*=\s*\d+/i,
    /(\s|^)(OR|AND)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/i,
    /(\s|^)(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\s+/i,
    /(\s|^)(--|\/\*|\*\/|;)\s*$/,
    /['"]\s*(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/i
  ],
  
  // XSS patterns
  xss: [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:[^>]*/i,
    /on\w+\s*=\s*["'][^"']*["']/i,
    /<iframe[^>]*>.*?<\/iframe>/i,
    /<object[^>]*>.*?<\/object>/i,
    /<embed[^>]*>.*?<\/embed>/i,
    /<applet[^>]*>.*?<\/applet>/i,
    /<meta[^>]*>.*?<\/meta>/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:\s*text\/html/i
  ],
  
  // Path traversal patterns
  pathTraversal: [
    /\.\.\//g,
    /\.\.\\/,
    /~[^\/]*/,
    /\/etc\/passwd/,
    /\/windows\/system32/,
    /c:\\windows\\system32/i,
    /\$\{[^}]*\}/g // Template injection
  ],
  
  // Command injection patterns
  commandInjection: [
    /[;&|`$()\n\r]/,
    /\/bin\/sh/,
    /cmd\.exe/,
    /\/bin\/bash/,
    /powershell/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /shell_exec\s*\(/i,
    /passthru\s*\(/i
  ],
  
  // NoSQL injection patterns
  noSqlInjection: [
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$regex/i,
    /\$in/i,
    /\$nin/i,
    /\$exists/i,
    /\$or/i,
    /\$and/i,
    /\$not/i
  ]
}

// Input sanitization function
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input
  
  let sanitized = input
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters except whitespace
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()
  
  // Remove potentially dangerous HTML entities
  sanitized = sanitized.replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  return sanitized
}

// Comprehensive input validation
export function validateInput(input: string, type: 'email' | 'password' | 'name' | 'general' = 'general'): {
  isValid: boolean
  sanitized: string
  errors: string[]
} {
  const errors: string[] = []
  let sanitized = sanitizeInput(input)
  
  // Type-specific validation
  switch (type) {
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
        errors.push('Invalid email format')
      }
      if (sanitized.length > 254) {
        errors.push('Email too long')
      }
      break
      
    case 'password':
      if (sanitized.length < 8) {
        errors.push('Password must be at least 8 characters')
      }
      if (sanitized.length > 128) {
        errors.push('Password too long')
      }
      if (!/(?=.*[a-z])/.test(sanitized)) {
        errors.push('Password must contain lowercase letter')
      }
      if (!/(?=.*[A-Z])/.test(sanitized)) {
        errors.push('Password must contain uppercase letter')
      }
      if (!/(?=.*\\d)/.test(sanitized)) {
        errors.push('Password must contain number')
      }
      if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(sanitized)) {
        errors.push('Password must contain special character')
      }
      break
      
    case 'name':
      if (sanitized.length < 2) {
        errors.push('Name too short')
      }
      if (sanitized.length > 100) {
        errors.push('Name too long')
      }
      if (!/^[a-zA-Z\s'-]+$/.test(sanitized)) {
        errors.push('Name contains invalid characters')
      }
      break
      
    case 'general':
      if (sanitized.length > 1000) {
        errors.push('Input too long')
      }
      break
  }
  
  // Check for security patterns
  for (const [category, patterns] of Object.entries(securityPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(sanitized)) {
        errors.push(`Potential ${category.replace(/([A-Z])/g, ' $1').toLowerCase()} detected`)
        break
      }
    }
  }
  
  // Common password blacklist check
  if (type === 'password') {
    const commonPasswords = [
      'password', '123456', '12345678', '123456789', '12345',
      'qwerty', 'abc123', 'password1', 'admin', 'welcome',
      'letmein', 'monkey', 'dragon', 'master', 'hello'
    ]
    
    if (commonPasswords.includes(sanitized.toLowerCase())) {
      errors.push('Password is too common')
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  }
}

// Security middleware function
export async function securityMiddleware(req: NextRequest): Promise<NextResponse | null> {
  // Validate request method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  if (!allowedMethods.includes(req.method)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-forwarded-host',
    'x-forwarded-proto'
  ]
  
  const headers = Object.fromEntries(req.headers.entries())
  for (const header of suspiciousHeaders) {
    if (headers[header] && typeof headers[header] === 'string') {
      // Check for header injection attempts
      if (headers[header].includes('\n') || headers[header].includes('\r')) {
        return NextResponse.json(
          { error: 'Invalid header format' },
          { status: 400 }
        )
      }
    }
  }
  
  // Validate content type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers.get('content-type')
    if (contentType && !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 415 }
      )
    }
  }
  
  return null
}

// Request body validation middleware
export async function validateRequestBody(req: NextRequest, schema: any): Promise<{
  isValid: boolean
  data?: any
  error?: NextResponse
}> {
  try {
    const body = await req.json()
    
    // Validate each field in the request body
    const validatedData: any = {}
    const errors: string[] = []
    
    for (const [key, value] of Object.entries(body)) {
      const fieldSchema = schema.shape[key]
      if (fieldSchema) {
        const fieldType = fieldSchema._def.typeName
        
        let validationType: 'email' | 'password' | 'name' | 'general' = 'general'
        
        if (key === 'email') validationType = 'email'
        else if (key === 'password' || key === 'confirmPassword') validationType = 'password'
        else if (key === 'fullName' || key === 'name') validationType = 'name'
        
        const validation = validateInput(String(value), validationType)
        
        if (!validation.isValid) {
          errors.push(...validation.errors)
        } else {
          validatedData[key] = validation.sanitized
        }
      } else {
        validatedData[key] = value
      }
    }
    
    if (errors.length > 0) {
      return {
        isValid: false,
        error: NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        )
      }
    }
    
    return {
      isValid: true,
      data: validatedData
    }
  } catch (error) {
    return {
      isValid: false,
      error: NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
  }
}

// Security logging function
export async function logSecurityEvent(
  event: string,
  details: any,
  req: NextRequest,
  userId?: string
): Promise<void> {
  try {
    const supabase = createClient()
    
    await supabase.from('security_logs').insert({
      event,
      details,
      user_id: userId,
      ip_address: req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown',
      user_agent: req.headers.get('user-agent'),
      path: new URL(req.url).pathname,
      method: req.method,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

// CSRF protection (for state-changing operations)
export function validateCSRFToken(req: NextRequest): boolean {
  // For API routes, we'll use a simpler approach with origin checking
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  
  // Allow same-origin requests
  if (origin && host) {
    const originUrl = new URL(origin)
    return originUrl.hostname === host
  }
  
  // Allow requests with authorization header (for API clients)
  return !!req.headers.get('authorization')
}

// Security helper functions
export const securityHelpers = {
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
  
  isSecureConnection: (req: NextRequest): boolean => {
    return req.headers.get('x-forwarded-proto') === 'https' || 
           req.nextUrl.protocol === 'https:'
  },
  
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  },
  
  validatePasswordStrength: (password: string): {
    score: number
    feedback: string[]
  } => {
    const feedback: string[] = []
    let score = 0
    
    if (password.length >= 8) score += 1
    else feedback.push('Password must be at least 8 characters')
    
    if (password.length >= 12) score += 1
    else feedback.push('Password should be at least 12 characters')
    
    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Password must contain lowercase letters')
    
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Password must contain uppercase letters')
    
    if (/\d/.test(password)) score += 1
    else feedback.push('Password must contain numbers')
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push('Password must contain special characters')
    
    return { score, feedback }
  }
}