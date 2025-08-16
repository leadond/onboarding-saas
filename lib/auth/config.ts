import { Database } from '@/lib/supabase/database.types'

// Authentication configuration
export const AUTH_CONFIG = {
  // JWT expiry time (1 hour)
  JWT_EXPIRY: 3600,

  // Refresh token expiry (7 days)
  REFRESH_TOKEN_EXPIRY: 604800,

  // Session cookie name
  SESSION_COOKIE: 'supabase-auth-token',

  // Redirect URLs
  REDIRECTS: {
    SIGN_IN: '/dashboard',
    SIGN_OUT: '/login',
    SIGN_UP: '/dashboard',
    ERROR: '/auth/error',
    BILLING_REQUIRED: '/billing',
    ONBOARDING: '/onboarding',
  },

  // Password requirements
  PASSWORD_REQUIREMENTS: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
  },

  // Rate limiting
  RATE_LIMITS: {
    SIGN_IN: 5, // attempts per 15 minutes
    SIGN_UP: 3, // attempts per hour
    PASSWORD_RESET: 3, // attempts per hour
    EMAIL_VERIFICATION: 5, // attempts per hour
  },
} as const

// User roles and permissions
export enum UserRole {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
  ADMIN = 'admin',
}

// Feature permissions based on subscription tier
export const SUBSCRIPTION_FEATURES = {
  [UserRole.FREE]: {
    maxKits: 1,
    maxStepsPerKit: 3,
    maxClientsPerMonth: 10,
    maxStorageMB: 100,
    customBranding: false,
    analytics: false,
    integrations: [],
    priority_support: false,
    custom_domain: false,
    password_protection: false,
    remove_branding: false,
  },
  [UserRole.STARTER]: {
    maxKits: 5,
    maxStepsPerKit: 10,
    maxClientsPerMonth: 100,
    maxStorageMB: 1024, // 1GB
    customBranding: true,
    analytics: true,
    integrations: ['docusign', 'google_calendar'],
    priority_support: false,
    custom_domain: false,
    password_protection: true,
    remove_branding: false,
  },
  [UserRole.PRO]: {
    maxKits: 25,
    maxStepsPerKit: -1, // unlimited
    maxClientsPerMonth: 1000,
    maxStorageMB: 10240, // 10GB
    customBranding: true,
    analytics: true,
    integrations: ['docusign', 'google_calendar', 'stripe', 'zapier', 'slack'],
    priority_support: true,
    custom_domain: true,
    password_protection: true,
    remove_branding: true,
  },
  [UserRole.ENTERPRISE]: {
    maxKits: -1, // unlimited
    maxStepsPerKit: -1, // unlimited
    maxClientsPerMonth: -1, // unlimited
    maxStorageMB: -1, // unlimited
    customBranding: true,
    analytics: true,
    integrations: 'all',
    priority_support: true,
    custom_domain: true,
    password_protection: true,
    remove_branding: true,
  },
  [UserRole.ADMIN]: {
    maxKits: -1, // unlimited
    maxStepsPerKit: -1, // unlimited
    maxClientsPerMonth: -1, // unlimited
    maxStorageMB: -1, // unlimited
    customBranding: true,
    analytics: true,
    integrations: 'all',
    priority_support: true,
    custom_domain: true,
    password_protection: true,
    remove_branding: true,
  },
} as const

// Security configuration
export const SECURITY_CONFIG = {
  // CORS origins
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
  ],

  // API rate limits
  API_RATE_LIMITS: {
    DEFAULT: 100, // requests per minute
    UPLOAD: 10, // file uploads per minute
    WEBHOOK: 1000, // webhook calls per minute
    AUTH: 20, // auth requests per minute
  },

  // File upload security
  UPLOAD_SECURITY: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ],
    VIRUS_SCAN: true,
    QUARANTINE_SUSPICIOUS: true,
  },

  // Session security
  SESSION_SECURITY: {
    SECURE: process.env.NODE_ENV === 'production',
    HTTP_ONLY: true,
    SAME_SITE: 'lax' as const,
    MAX_AGE: 7 * 24 * 60 * 60, // 7 days
  },

  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': ["'self'", 'https://api.stripe.com', 'wss://'],
    'frame-src': ["'self'", 'https://js.stripe.com'],
    'media-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  },
} as const

// Stripe configuration
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  // Subscription prices
  PRICES: {
    STARTER_MONTHLY:
      process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    ENTERPRISE_MONTHLY:
      process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
  },

  // Webhook events to handle
  WEBHOOK_EVENTS: [
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'customer.created',
    'customer.updated',
  ],
} as const

// OAuth provider configuration
export const OAUTH_CONFIG = {
  GOOGLE: {
    enabled: !!process.env.GOOGLE_CLIENT_ID,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  MICROSOFT: {
    enabled: !!process.env.MICROSOFT_CLIENT_ID,
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  },
} as const

// Type definitions
export type SubscriptionTier = keyof typeof SUBSCRIPTION_FEATURES
export type SubscriptionFeatures =
  (typeof SUBSCRIPTION_FEATURES)[SubscriptionTier]

// Helper functions
export function hasFeature(
  userTier: SubscriptionTier,
  feature: keyof SubscriptionFeatures
): boolean {
  const features = SUBSCRIPTION_FEATURES[userTier]
  return !!features[feature]
}

export function getFeatureLimit(
  userTier: SubscriptionTier,
  feature: keyof SubscriptionFeatures
): number | boolean | string[] | string | readonly string[] {
  const features = SUBSCRIPTION_FEATURES[userTier]
  return features[feature] as
    | number
    | boolean
    | string[]
    | string
    | readonly string[]
}

export function canCreateKit(
  userTier: SubscriptionTier,
  currentCount: number
): boolean {
  const maxKits = getFeatureLimit(userTier, 'maxKits') as number
  return maxKits === -1 || currentCount < maxKits
}

export function canAddStep(
  userTier: SubscriptionTier,
  currentCount: number
): boolean {
  const maxSteps = getFeatureLimit(userTier, 'maxStepsPerKit') as number
  return maxSteps === -1 || currentCount < maxSteps
}

export function getRemainingStorage(
  userTier: SubscriptionTier,
  usedMB: number
): number {
  const maxStorageMB = getFeatureLimit(userTier, 'maxStorageMB') as number
  return maxStorageMB === -1 ? -1 : maxStorageMB - usedMB
}
