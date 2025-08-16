import { z } from 'zod'

// Base email schema
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()

// Base password schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Login form validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional().default(false),
})

// Signup form validation schema
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be less than 100 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Full name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(100, 'Company name must be less than 100 characters')
      .optional()
      .or(z.literal('')),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
    subscribeToNewsletter: z.boolean().optional().default(false),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Forgot password form validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password form validation schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Update password form validation schema
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

// Profile update form validation schema
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Full name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  email: emailSchema,
  avatarUrl: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
})

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

// OAuth provider schema
export const oauthProviderSchema = z.enum(['google', 'azure'])

// Session refresh schema
export const sessionRefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// User role schema (for future role-based access)
export const userRoleSchema = z.enum(['user', 'admin', 'owner'])

// Subscription status schema
export const subscriptionStatusSchema = z.enum([
  'active',
  'canceled',
  'past_due',
  'unpaid',
])

// Subscription tier schema
export const subscriptionTierSchema = z.enum([
  'free',
  'starter',
  'pro',
  'enterprise',
])

// Complete user profile schema (for API responses)
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  fullName: z.string().nullable(),
  companyName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  subscriptionStatus: subscriptionStatusSchema,
  subscriptionTier: subscriptionTierSchema,
  stripeCustomerId: z.string().nullable(),
  trialEndsAt: z.string().datetime().nullable(),
  onboardingCompletedAt: z.string().datetime().nullable(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// API response schemas
export const authResponseSchema = z.object({
  user: userProfileSchema.nullable(),
  session: z
    .object({
      accessToken: z.string(),
      refreshToken: z.string(),
      expiresAt: z.number(),
    })
    .nullable(),
  error: z.string().nullable(),
})

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
})

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>
export type OAuthProvider = z.infer<typeof oauthProviderSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>
export type SubscriptionTier = z.infer<typeof subscriptionTierSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type ApiError = z.infer<typeof apiErrorSchema>

// Form validation helpers
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password)
    return true
  } catch {
    return false
  }
}

// Password strength checker
export const getPasswordStrength = (
  password: string
): {
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Include an uppercase letter')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Include a lowercase letter')

  if (/[0-9]/.test(password)) score += 1
  else feedback.push('Include a number')

  if (/[^A-Za-z0-9]/.test(password)) score += 1
  else feedback.push('Include a special character')

  if (password.length >= 12) score += 1

  return { score, feedback }
}
