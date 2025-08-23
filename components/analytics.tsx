'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return

    const url = pathname + searchParams.toString()

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

// Enhanced goal tracking functions for onboarding funnel
export const trackGoal = (goalName: string, value?: number, customParameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: GA_MEASUREMENT_ID,
      event_category: 'Goal',
      event_label: goalName,
      value: value,
      ...customParameters,
    })
  }
}

// Onboarding funnel tracking
export const trackSignup = (method?: string) => {
  trackGoal('signup', undefined, { method: method || 'email' })
  
  // Enhanced ecommerce tracking for signup
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method || 'email',
      event_category: 'engagement',
      event_label: 'user_signup'
    })
  }
}

export const trackLogin = (method?: string) => {
  trackGoal('login', undefined, { method: method || 'email' })
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method || 'email',
      event_category: 'engagement',
      event_label: 'user_login'
    })
  }
}

export const trackTrialStart = () => {
  trackGoal('trial_start', 0)
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: 0,
      event_category: 'ecommerce',
      event_label: 'free_trial_start'
    })
  }
}

export const trackDemoRequest = () => {
  trackGoal('demo_request')
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'engagement',
      event_label: 'demo_request',
      value: 1
    })
  }
}

// Client onboarding specific tracking
export const trackOnboardingStep = (stepName: string, stepNumber: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'onboarding_step', {
      event_category: 'onboarding',
      event_label: stepName,
      custom_parameter_1: stepNumber,
      non_interaction: false
    })
  }
}

export const trackOnboardingComplete = (timeToComplete?: number) => {
  trackGoal('onboarding_complete', timeToComplete)
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'onboarding_complete', {
      event_category: 'onboarding',
      event_label: 'completed',
      value: timeToComplete || 0,
      custom_parameter_1: 'success'
    })
  }
}

// Feature usage tracking
export const trackFeatureUsage = (featureName: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'feature_usage', {
      event_category: 'engagement',
      event_label: featureName,
      non_interaction: false
    })
  }
}

// Client success metrics
export const trackClientSuccess = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'client_success', {
      event_category: 'business_metrics',
      event_label: metric,
      value: value,
      custom_parameter_1: metric
    })
  }
}