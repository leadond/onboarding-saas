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

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ApiTestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState<string | null>(null)

  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    setLoading(name)
    try {
      const response = await fetch(url, options)
      const data = await response.json()
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: response.status,
          success: response.ok,
          data: data
        }
      }))
    } catch (error) {
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setLoading(null)
    }
  }

  const testGraphQL = async () => {
    const query = `
      query {
        me {
          id
          email
          full_name
        }
        emailIntegrations {
          id
          name
          description
          is_connected
          features
        }
      }
    `

    await testEndpoint('GraphQL', '/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Endpoints Test</h1>
          <p className="text-gray-600">Test the flagship API-first architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button 
            onClick={() => testEndpoint('Email Integrations', '/api/integrations/email-marketing')}
            disabled={loading === 'Email Integrations'}
          >
            {loading === 'Email Integrations' ? 'Testing...' : 'Test Email Integrations API'}
          </Button>

          <Button 
            onClick={testGraphQL}
            disabled={loading === 'GraphQL'}
          >
            {loading === 'GraphQL' ? 'Testing...' : 'Test GraphQL API'}
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(results).map(([name, result]: [string, any]) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {name}
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </CardTitle>
                <CardDescription>
                  {result.success ? 'API endpoint working correctly' : 'API endpoint failed'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}