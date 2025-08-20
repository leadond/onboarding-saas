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
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ArrowLeft } from 'lucide-react'
import { HtmlFormInput } from '@/components/forms/html-form-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Kit = {
  id: string
  name: string
  slug: string
  description: string | null
  kit_steps?: KitStep[]
}

type KitStep = {
  id: string
  step_order: number
  step_type: string
  title: string
  description: string | null
  is_required: boolean
  is_active: boolean
}

export default function NewStepPage({
  params,
}: {
  params: { kitId: string }
}) {
  const { kitId } = params
  const router = useRouter()
  const [kit, setKit] = useState<Kit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    step_type: 'intake_form' as const,
    content: {
      instructions: '',
      html_form: {
        html_content: '',
        css_content: '',
        submit_button_text: 'Submit',
        field_mappings: {},
      }
    },
    is_required: true,
    is_active: true,
    step_order: 0,
  })

  // Fetch kit details
  useEffect(() => {
    const fetchKit = async () => {
      try {
        const response = await fetch(`/api/kits/${kitId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch kit')
        }
        const result = await response.json()
        if (result.success) {
          setKit(result.data)
          // Set step order to be after existing steps
          const stepCount = result.data.kit_steps?.length || 0
          setFormData(prev => ({ ...prev, step_order: stepCount }))
        } else {
          throw new Error(result.error || 'Failed to fetch kit')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchKit()
  }, [kitId])

  const handleInputChange = (field: string, value: string | number | boolean | object) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError('Step title is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch(`/api/kits/${kitId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create step')
      }

      const result = await response.json()
      router.push(`/dashboard/kits/${kitId}`)
    } catch (error) {
      console.error('Error creating step:', error)
      setError(error instanceof Error ? error.message : 'Failed to create step')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (!kit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/kits">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kits
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Kit not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/dashboard/kits/${kit.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {kit.name}
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Step</h1>
        <p className="mt-2 text-gray-600">
          Create a new step for "{kit.name}" onboarding kit
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Step Details</CardTitle>
          <CardDescription>
            Configure the details for your new onboarding step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Step Title *
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Enter step title"
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <Textarea
                id="description"
                placeholder="Describe what this step involves (optional)"
                rows={3}
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Step Type */}
            <div>
              <label
                htmlFor="step_type"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Step Type
              </label>
              <Select
                value={formData.step_type}
                onValueChange={(value) => handleInputChange('step_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome_message">Welcome Message - Display welcome content</SelectItem>
                  <SelectItem value="welcome_video">Welcome Video - Show introduction video</SelectItem>
                  <SelectItem value="intake_form">Intake Form - Collect client information</SelectItem>
                  <SelectItem value="file_upload">File Upload - Upload documents</SelectItem>
                  <SelectItem value="contract_signing">Contract Signing - Digital signature</SelectItem>
                  <SelectItem value="scheduling">Scheduling - Book appointments</SelectItem>
                  <SelectItem value="payment">Payment - Process payments</SelectItem>
                  <SelectItem value="confirmation">Confirmation - Final step</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            {formData.step_type === 'intake_form' ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="instructions"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Instructions
                  </label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter step instructions or content (optional)"
                    rows={4}
                    value={formData.content?.instructions || ''}
                    onChange={e => handleInputChange('content', {
                      ...formData.content,
                      instructions: e.target.value
                    })}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Instructions or content that will be displayed to users in this step.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Form Configuration
                  </label>
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="fields">Form Fields</TabsTrigger>
                      <TabsTrigger value="html">HTML Form</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="fields" className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Configure form fields using the traditional form builder.
                          This allows you to add individual fields with validation.
                        </p>
                      </div>
                      <div className="text-center py-8 text-gray-500">
                        <p>Form fields builder will be implemented here.</p>
                        <p className="text-sm mt-2">For now, use the HTML Form option below.</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="html" className="space-y-4">
                      <HtmlFormInput
                        value={formData.content?.html_form}
                        onChange={(htmlForm) => handleInputChange('content', {
                          ...formData.content,
                          html_form: htmlForm
                        })}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="instructions"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Instructions
                </label>
                <Textarea
                  id="instructions"
                  placeholder="Enter step instructions or content (optional)"
                  rows={4}
                  value={formData.content?.instructions || ''}
                  onChange={e => handleInputChange('content', {
                    ...formData.content,
                    instructions: e.target.value
                  })}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Instructions or content that will be displayed to users in this step.
                </p>
              </div>
            )}

            {/* Step Order */}
            <div>
              <label
                htmlFor="step_order"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Step Order
              </label>
              <Input
                id="step_order"
                type="number"
                min="0"
                value={formData.step_order}
                onChange={e => handleInputChange('step_order', parseInt(e.target.value) || 0)}
              />
              <p className="mt-1 text-sm text-gray-500">
                The order in which this step appears (0 = first).
              </p>
            </div>

            {/* Settings with checkboxes instead of switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_required"
                    checked={formData.is_required}
                    onChange={(e) => handleInputChange('is_required', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_required" className="text-base font-medium">
                    Required Step
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Users must complete this step to proceed.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="text-base font-medium">
                    Active Step
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  This step is visible and accessible to users.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/kits/${kit.id}`}>Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isCreating || !formData.title.trim()}
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating Step...
                  </>
                ) : (
                  'Create Step'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Step Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                W
              </div>
              <p><strong>Welcome Message:</strong> Display welcome content and instructions</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
                V
              </div>
              <p><strong>Welcome Video:</strong> Show introduction or explainer video</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-600">
                F
              </div>
              <p><strong>Intake Form:</strong> Collect client information with custom fields</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600">
                U
              </div>
              <p><strong>File Upload:</strong> Allow clients to upload documents</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600">
                S
              </div>
              <p><strong>Contract Signing:</strong> Digital signature collection</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">
                C
              </div>
              <p><strong>Scheduling:</strong> Book appointments or meetings</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-xs font-semibold text-yellow-600">
                P
              </div>
              <p><strong>Payment:</strong> Process payments and invoicing</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                ✓
              </div>
              <p><strong>Confirmation:</strong> Final confirmation and next steps</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
