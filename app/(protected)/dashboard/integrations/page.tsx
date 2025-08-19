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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function IntegrationsPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">
            Connect with your favorite tools and services
          </p>
        </div>
        <Button>Browse Integrations</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'Slack', icon: '💬', description: 'Team communication', status: 'Available' },
          { name: 'Google Drive', icon: '📁', description: 'File storage', status: 'Available' },
          { name: 'Stripe', icon: '💳', description: 'Payment processing', status: 'Available' },
          { name: 'Calendly', icon: '📅', description: 'Scheduling', status: 'Coming Soon' },
          { name: 'HubSpot', icon: '🎯', description: 'CRM integration', status: 'Coming Soon' },
          { name: 'Mailchimp', icon: '📧', description: 'Email marketing', status: 'Coming Soon' },
        ].map((integration) => (
          <Card key={integration.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    integration.status === 'Available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {integration.status}
                </span>
              </div>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant={integration.status === 'Available' ? 'default' : 'outline'} 
                size="sm" 
                disabled={integration.status !== 'Available'}
                className="w-full"
              >
                {integration.status === 'Available' ? 'Connect' : 'Coming Soon'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}