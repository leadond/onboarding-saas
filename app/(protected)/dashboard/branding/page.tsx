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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function BrandingPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Branding</h1>
        <p className="text-gray-600">
          Customize the look and feel of your onboarding kits
        </p>
      </div>

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
                <Input type="color" value="#3b82f6" className="w-16 h-10" />
                <Input value="#3b82f6" placeholder="#3b82f6" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secondary Color</label>
              <div className="flex space-x-2">
                <Input type="color" value="#10b981" className="w-16 h-10" />
                <Input value="#10b981" placeholder="#10b981" />
              </div>
            </div>
            <Button>Save Colors</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo & Assets</CardTitle>
            <CardDescription>
              Upload your logo and brand assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-xl">🖼️</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop your logo here, or click to browse
              </p>
              <Button variant="outline" size="sm">
                Choose File
              </Button>
            </div>
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