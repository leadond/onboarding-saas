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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CompanyForm } from '@/components/companies/company-form'
import { useState } from 'react'

export default function CompaniesPage() {
  const [showCompanyForm, setShowCompanyForm] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">
            Manage your client companies and their representatives.
          </p>
        </div>
        <Button onClick={() => setShowCompanyForm(true)}>
          Add New Company
        </Button>
      </div>

      {showCompanyForm && (
        <Card>
          <CardHeader>
            <CardTitle>{'Create New Company'}</CardTitle>
            <CardDescription>
              Add a new company to your client portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyForm 
              onCancel={() => setShowCompanyForm(false)}
              onSuccess={() => {
                setShowCompanyForm(false)
                // TODO: Refresh company list
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Company Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Companies</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Companies</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+1 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Representatives</CardDescription>
            <CardTitle className="text-3xl">24</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
            <CardDescription>
              Companies you've recently added
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">TC</span>
                </div>
                <div>
                  <p className="text-sm font-medium">TechCorp Inc.</p>
                  <p className="text-xs text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Added</p>
                <p className="text-sm">2 days ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-green-600">GI</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Global Innovations</p>
                  <p className="text-xs text-muted-foreground">New York, NY</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Added</p>
                <p className="text-sm">5 days ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-600">FS</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Future Solutions Ltd</p>
                  <p className="text-xs text-muted-foreground">Austin, TX</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Added</p>
                <p className="text-sm">1 week ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Actions</CardTitle>
            <CardDescription>Quick actions for company management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Import Company List
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Export Company Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              View All Representatives
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Company Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}