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

import { NylasDashboard } from '@/components/integrations/nylas-dashboard'

export default function NylasDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nylas Integration Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of Nylas integration with Onboard Hero. 
            Advanced email, calendar, and contact management for enhanced client onboarding.
          </p>
        </div>
        <NylasDashboard />
      </div>
    </div>
  )
}