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

/**
 * Mock Data for Development and Fallback
 * Provides sample kit data when database is unavailable
 */

export interface MockKit {
  id: string
  name: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  step_count: number
  created_at: string
  updated_at: string
  user_id: string
}

export interface MockKitStep {
  id: string
  kit_id: string
  step_order: number
  step_type: 'welcome_message' | 'intake_form' | 'file_upload' | 'confirmation'
  title: string
  description?: string
  content: any
  is_required: boolean
  is_active: boolean
  settings: any
  conditional_logic: any
  created_at: string
  updated_at: string
}

// Generate mock kits for development
export const mockKits: MockKit[] = [
  {
    id: 'mock-kit-1',
    name: 'Client Onboarding Template',
    description: 'A comprehensive onboarding workflow for new clients',
    status: 'published',
    step_count: 4,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    user_id: 'mock-user-1'
  },
  {
    id: 'mock-kit-2',
    name: 'Service Agreement Flow',
    description: 'Streamlined process for service agreements and contracts',
    status: 'draft',
    step_count: 3,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    user_id: 'mock-user-1'
  },
  {
    id: 'mock-kit-3',
    name: 'Project Kickoff Kit',
    description: 'Everything needed to start a new project with clients',
    status: 'published',
    step_count: 5,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    user_id: 'mock-user-1'
  },
  {
    id: 'mock-kit-4',
    name: 'Website Design Onboarding',
    description: 'Complete workflow for website design clients',
    status: 'published',
    step_count: 6,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    user_id: 'mock-user-1'
  },
  {
    id: 'mock-kit-5',
    name: 'Marketing Campaign Setup',
    description: 'Onboarding process for marketing campaign clients',
    status: 'draft',
    step_count: 4,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    user_id: 'mock-user-1'
  },
  {
    id: 'mock-kit-6',
    name: 'Consulting Engagement',
    description: 'Professional consulting client onboarding',
    status: 'published',
    step_count: 7,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    user_id: 'mock-user-1'
  }
]


export const mockKitSteps: MockKitStep[] = [
  // Steps for Client Onboarding Template (mock-kit-1)
  {
    id: 'mock-step-1-1',
    kit_id: 'mock-kit-1',
    step_order: 1,
    step_type: 'welcome_message',
    title: 'Welcome to Our Service',
    description: 'Introduction and overview of the onboarding process',
    content: { message: 'Welcome! We\'re excited to work with you.' },
    is_required: true,
    is_active: true,
    settings: {},
    conditional_logic: {},
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'mock-step-1-2',
    kit_id: 'mock-kit-1',
    step_order: 2,
    step_type: 'intake_form',
    title: 'Client Information Form',
    description: 'Please provide your business details and requirements',
    content: { 
      fields: [
        { type: 'text', label: 'Company Name', required: true },
        { type: 'email', label: 'Business Email', required: true },
        { type: 'textarea', label: 'Project Description', required: true }
      ]
    },
    is_required: true,
    is_active: true,
    settings: {},
    conditional_logic: {},
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
]

/**
 * Check if we should use mock data (fallback mode)
 */
export function shouldUseMockData(): boolean {
  // Use mock data in development when database is unavailable
  return process.env.NODE_ENV === 'development' ||
         process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
}

/**
 * API Response wrapper for mock data
 */
export function createMockApiResponse<T>(data: T, pagination?: any) {
  return {
    success: true,
    data,
    pagination: pagination || {
      page: 1,
      limit: 10,
      total: Array.isArray(data) ? data.length : 1,
      total_pages: 1
    },
    message: 'Mock data response (database unavailable)',
    mock: true
  }
}

/**
 * Simulate API delay for realistic behavior
 */
export function simulateNetworkDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}