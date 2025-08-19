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

export const APP_CONFIG = {
  name: 'Onboard Hero',
  description: 'Professional client onboarding platform',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

export const STRIPE_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
}

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}
export const AUTH_CONFIG = {
  secret: process.env.NEXTAUTH_SECRET!,

  provider: 'resend',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@onboardhero.com',
  fromName: process.env.RESEND_FROM_NAME || 'Onboard Hero',
}

export const FEATURES = {
  aiInsights: process.env.FEATURE_AI_INSIGHTS === 'true',
  mobileApps: process.env.FEATURE_MOBILE_APPS === 'true',
  whiteLabel: process.env.FEATURE_WHITE_LABEL === 'true',
  enterpriseSSO: process.env.FEATURE_ENTERPRISE_SSO === 'true',
  advancedAnalytics: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
  workflowAutomation: process.env.FEATURE_WORKFLOW_AUTOMATION === 'true',
  templateMarketplace: process.env.FEATURE_TEMPLATE_MARKETPLACE === 'true',
}

export const INTEGRATIONS = {
  nylas: {
    enabled: true,
    apiKey: process.env.NYLAS_API_KEY,
    apiUri: process.env.NYLAS_API_URI,
  },
  boldsign: {
    enabled: true,
    apiKey: process.env.BOLDSIGN_API_KEY,
  },
  stripe: {
    enabled: true,
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}

export const STORAGE = {
  provider: 'supabase',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
}

export const SECURITY = {
  rateLimit: {
    requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '100'),
    requestsPerHour: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR || '1000'),
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
}

export const COMPLIANCE = {
  gdpr: process.env.GDPR_ENABLED === 'true',
  hipaa: process.env.HIPAA_ENABLED === 'true',
  rateLimit: {
    requestsPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '100', 10) || 100,
    requestsPerHour:   parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR   || '1000', 10) || 1000,
  },
}
