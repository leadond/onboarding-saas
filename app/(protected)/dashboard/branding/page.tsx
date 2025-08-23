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

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogoManagement } from '@/components/branding/logo-management'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import SuspenseWrapper from '@/components/suspense-wrapper'

function BrandingPageComponent() {
  const [userRole, setUserRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {

        const response = await fetch('/api/user/profile')
        const result = await response.json()
        
        if (result.success && result.data?.user) {
          setUserRole(result.data.user.role)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserRole()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Branding</h1>
        <p className="text-gray-600">
          Manage your app branding and kit customization options
        </p>
      </div>

      {/* Logo Management Section */}
      <LogoManagement userRole={userRole} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>
              Set your primary brand colors for onboarding kits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Color</label>
              <div className="flex space-x-2">
                <Input type="color" defaultValue="#3b82f6" className="w-16 h-10" />
                <Input defaultValue="#3b82f6" placeholder="#3b82f6" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Color</label>
              <div className="flex space-x-2">
                <Input type="color" defaultValue="#10b981" className="w-16 h-10" />
                <Input defaultValue="#10b981" placeholder="#10b981" />
              </div>
            </div>
            <Button>Save Colors</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>
              Choose fonts for your onboarding experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xl">🔤</span>
              </div>
              <p className="text-sm text-gray-600">
                Typography settings coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom CSS</CardTitle>
            <CardDescription>
              Add custom styles to your onboarding kits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xl">🎨</span>
              </div>
              <p className="text-sm text-gray-600">
                Custom CSS editor coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BrandingPage() {
  return (
    <SuspenseWrapper>
      <BrandingPageComponent />
    </SuspenseWrapper>
  )
}