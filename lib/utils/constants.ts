export const APP_CONFIG = {
  name: 'OnboardKit',
  description: 'Professional client onboarding platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '1.0.0',
}

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

export const SUBSCRIPTION_LIMITS = {
  [SUBSCRIPTION_TIERS.FREE]: {
    maxKits: 1,
    maxStepsPerKit: 3,
    customBranding: false,
    analytics: false,
    integrations: [],
    storage: '100MB',
  },
  [SUBSCRIPTION_TIERS.STARTER]: {
    maxKits: 5,
    maxStepsPerKit: 10,
    customBranding: true,
    analytics: true,
    integrations: ['docusign', 'calendar'],
    storage: '1GB',
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    maxKits: 25,
    maxStepsPerKit: -1, // unlimited
    customBranding: true,
    analytics: true,
    integrations: ['docusign', 'calendar', 'stripe', 'zapier'],
    storage: '10GB',
  },
  [SUBSCRIPTION_TIERS.ENTERPRISE]: {
    maxKits: -1, // unlimited
    maxStepsPerKit: -1,
    customBranding: true,
    analytics: true,
    integrations: 'all',
    storage: 'unlimited',
  },
} as const

export const STEP_TYPES = {
  WELCOME_MESSAGE: 'welcome_message',
  WELCOME_VIDEO: 'welcome_video',
  INTAKE_FORM: 'intake_form',
  FILE_UPLOAD: 'file_upload',
  CONTRACT_SIGNING: 'contract_signing',
  SCHEDULING: 'scheduling',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation',
} as const

export const KIT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const

export const FILE_UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  acceptedTypes: [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
} as const

export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  DATE: 'date',
  FILE: 'file',
} as const

export const NAVIGATION_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Kits',
    href: '/dashboard/kits',
    icon: 'Package',
  },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: 'Users',
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: 'BarChart3',
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: 'CreditCard',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: 'Settings',
  },
] as const

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
} as const

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    callback: '/api/auth/callback',
  },
  kits: {
    list: '/api/kits',
    create: '/api/kits',
    update: (id: string) => `/api/kits/${id}`,
    delete: (id: string) => `/api/kits/${id}`,
    steps: (id: string) => `/api/kits/${id}/steps`,
    progress: (id: string) => `/api/kits/${id}/progress`,
  },
  files: {
    upload: '/api/files/upload',
    download: (id: string) => `/api/files/${id}`,
  },
  webhooks: {
    stripe: '/api/webhooks/stripe',
    docusign: '/api/webhooks/docusign',
  },
  integrations: {
    docusign: '/api/integrations/docusign',
    calendar: '/api/integrations/calendar',
  },
} as const

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  NETWORK: 'Network error. Please check your connection.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
} as const

export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  SENT: 'Sent successfully!',
} as const
