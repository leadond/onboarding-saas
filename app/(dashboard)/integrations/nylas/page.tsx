import { Metadata } from 'next'
import { NylasDashboard } from '@/components/integrations/nylas-dashboard'

export const metadata: Metadata = {
  title: 'Nylas Integration - OnboardKit',
  description: 'Advanced email, calendar, and contact management with Nylas',
}

export default function NylasIntegrationPage() {
  return (
    <div className="container mx-auto py-6">
      <NylasDashboard />
    </div>
  )
}