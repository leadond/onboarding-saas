// Global type declarations for OnboardKit

declare global {
  interface Window {
    // PWA install prompt
    deferredPrompt?: any
    // Service worker
    workbox?: any
  }
}

// Supabase table extensions
declare module '@supabase/supabase-js' {
  interface Database {
    public: {
      Tables: {
        // Add missing table types here as needed
        organizations: any
        organization_members: any
        teams: any
        team_members: any
        roles: any
        permissions: any
        role_permissions: any
        activity_logs: any
        webhook_endpoints: any
        webhook_deliveries: any
        user_integrations: any
        api_keys: any
        experiments: any
        // Add more as needed
        [key: string]: any
      }
      Views: {
        [key: string]: any
      }
      Functions: {
        [key: string]: any
      }
      Enums: {
        [key: string]: any
      }
    }
  }
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success?: boolean
}

// Form data types
export interface FormData {
  [key: string]: any
}

export {}
