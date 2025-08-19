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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RepresentativeForm } from '@/components/companies/representative-form'
import { useState } from 'react'

export default function CompanyRepresentativesPage({ params }: { params: { companyId: string } }) {
  const [showRepresentativeForm, setShowRepresentativeForm] = useState(false)
  const companyId = params.companyId

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Representatives</h1>
          <p className="text-gray-600">
            Manage representatives for this company
          </p>
        </div>
        <Button onClick={() => setShowRepresentativeForm(true)}>
          Add New Representative
        </Button>
      </div>

      {showRepresentativeForm && (
        <Card>
          <CardHeader>
            <CardTitle>{'Add New Representative'}</CardTitle>
            <CardDescription>
              Add a new representative for this company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RepresentativeForm 
              companyId={companyId}
              onCancel={() => setShowRepresentativeForm(false)}
              onSuccess={() => {
                setShowRepresentativeForm(false)
                // TODO: Refresh representative list
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Representative Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Representatives</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Primary Contacts</CardDescription>
            <CardTitle className="text-3xl">3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+1 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Representatives</CardDescription>
            <CardTitle className="text-3xl">7</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Representative List */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Representatives</CardTitle>
            <CardDescription>
              All representatives for this company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">JD</span>
                </div>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">CTO - john@company.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Primary
                </span>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-green-600">SJ</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Account Manager - sarah@company.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-purple-600">MJ</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Mike Johnson</p>
                  <p className="text-xs text-muted-foreground">Developer - mike@company.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}