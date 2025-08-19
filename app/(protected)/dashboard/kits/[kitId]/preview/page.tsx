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

import { useState, useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  ArrowLeft, 
  Eye,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  AlertCircle,
  Play,
  ArrowRight,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'

type Kit = {
  id: string
  name: string
  slug: string
  status: string
  description?: string
}

type KitStep = {
  id: string
  title: string
  description: string
  step_type: string
  step_order: number
  is_required: boolean
  is_active: boolean
  config: any
}

export default function KitPreviewPage({
  params,
}: {
  params: { kitId: string }
}) {
  const [kit, setKit] = useState<Kit | null>(null)
  const [steps, setSteps] = useState<KitStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    const fetchKitData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch kit details
        const kitResponse = await fetch(`/api/kits/${params.kitId}`)
        if (!kitResponse.ok) {
          throw new Error('Failed to fetch kit')
        }
        const kitResult = await kitResponse.json()
        if (!kitResult.success) {
          throw new Error(kitResult.error || 'Failed to fetch kit')
        }
        setKit(kitResult.data)

        // Fetch kit steps
        const stepsResponse = await fetch(`/api/kits/${params.kitId}/steps`)
        if (!stepsResponse.ok) {
          throw new Error('Failed to fetch steps')
        }
        const stepsResult = await stepsResponse.json()
        if (!stepsResult.success) {
          throw new Error(stepsResult.error || 'Failed to fetch steps')
        }
        setSteps(stepsResult.data.filter((step: KitStep) => step.is_active))
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchKitData()
  }, [params.kitId])

  const getViewportClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      case 'desktop':
      default:
        return 'max-w-4xl mx-auto'
    }
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'welcome_message':
      case 'welcome_video':
        return <Play className="h-5 w-5" />
      case 'intake_form':
        return <User className="h-5 w-5" />
      case 'file_upload':
        return <ArrowRight className="h-5 w-5" />
      case 'contract_signing':
        return <CheckCircle className="h-5 w-5" />
      case 'payment':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <ArrowRight className="h-5 w-5" />
    }
  }

  const getStepTypeLabel = (stepType: string) => {
    switch (stepType) {
      case 'welcome_message':
        return 'Welcome Message'
      case 'welcome_video':
        return 'Welcome Video'
      case 'intake_form':
        return 'Intake Form'
      case 'file_upload':
        return 'File Upload'
      case 'contract_signing':
        return 'Contract Signing'
      case 'payment':
        return 'Payment'
      default:
        return 'Step'
    }
  }

  const simulateStepCompletion = () => {
    setIsSimulating(true)
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
      setIsSimulating(false)
    }, 1500)
  }

  const resetSimulation = () => {
    setCurrentStep(0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !kit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/kits/${params.kitId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kit
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error || 'Kit not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/kit/${kit.slug}`

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/kits/${kit.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {kit.name}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Eye className="h-8 w-8 mr-3" />
              Preview
            </h1>
            <p className="mt-2 text-gray-600">See how your kit looks to clients</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Public URL
            </a>
          </Button>
        </div>
      </div>

      {kit.status !== 'published' && (
        <div className="rounded-md bg-yellow-50 p-4">
          <p className="text-sm text-yellow-600">
            This kit is not published yet. Only you can see this preview.
            <Link href={`/dashboard/kits/${kit.id}`} className="font-medium underline ml-1">
              Publish your kit
            </Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Viewport Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Viewport</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="justify-start"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                  className="justify-start"
                >
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="justify-start"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step Navigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Step Navigation</CardTitle>
              <CardDescription>
                Simulate the client experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSimulation}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                        index === currentStep
                          ? 'bg-blue-100 text-blue-900'
                          : index < currentStep
                          ? 'bg-green-100 text-green-900'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className="flex-shrink-0">
                        {index < currentStep ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : index === currentStep ? (
                          <Clock className="h-4 w-4 text-blue-600" />
                        ) : (
                          getStepIcon(step.step_type)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{step.title}</p>
                        <p className="text-xs opacity-75">{getStepTypeLabel(step.step_type)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {currentStep < steps.length - 1 && (
                  <Button
                    onClick={simulateStepCompletion}
                    disabled={isSimulating}
                    className="w-full"
                  >
                    {isSimulating ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Completing...
                      </>
                    ) : (
                      <>
                        Complete Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Kit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {kit.name}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`capitalize ${
                    kit.status === 'published' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {kit.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Steps:</span> {steps.length}
                </div>
                <div>
                  <span className="font-medium">URL:</span>{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    /kit/{kit.slug}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Client View
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="capitalize">{viewMode}</span>
                  <span>•</span>
                  <span>Step {currentStep + 1}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {steps.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Steps Configured</h3>
                  <p className="text-gray-600 mb-4">
                    Add steps to your kit to see the preview.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/kits/${kit.id}/steps`}>
                      Add Steps
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className={`transition-all duration-300 ${getViewportClass()}`}>
                  {/* Simulated Browser Frame */}
                  <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
                    {/* Browser Header */}
                    <div className="bg-gray-100 px-4 py-2 border-b flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                        {publicUrl}
                      </div>
                    </div>

                    {/* Kit Content */}
                    <div className="p-6 min-h-[500px]">
                      {steps[currentStep] && (
                        <div className="space-y-6">
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            />
                          </div>

                          {/* Step Content */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                {getStepIcon(steps[currentStep].step_type)}
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                  {steps[currentStep].title}
                                </h2>
                                <p className="text-gray-600">
                                  {getStepTypeLabel(steps[currentStep].step_type)}
                                </p>
                              </div>
                            </div>

                            {steps[currentStep].description && (
                              <p className="text-gray-700 leading-relaxed">
                                {steps[currentStep].description}
                              </p>
                            )}

                            {/* Step Type Specific Preview */}
                            <div className="bg-gray-50 rounded-lg p-6">
                              {steps[currentStep].step_type === 'welcome_message' && (
                                <div className="text-center space-y-4">
                                  <h3 className="text-xl font-semibold">Welcome!</h3>
                                  <p className="text-gray-600">
                                    This is a preview of your welcome message step.
                                  </p>
                                </div>
                              )}

                              {steps[currentStep].step_type === 'intake_form' && (
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Client Information</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                      </label>
                                      <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter your name"
                                        disabled
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                      </label>
                                      <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Enter your email"
                                        disabled
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {steps[currentStep].step_type === 'file_upload' && (
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold">Upload Documents</h3>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <div className="text-gray-400 mb-2">
                                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </div>
                                    <p className="text-gray-600">Drag and drop files here, or click to browse</p>
                                  </div>
                                </div>
                              )}

                              {(steps[currentStep].step_type === 'contract_signing' || steps[currentStep].step_type === 'payment') && (
                                <div className="text-center space-y-4">
                                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-8 w-8 text-blue-600" />
                                  </div>
                                  <h3 className="text-lg font-semibold">
                                    {steps[currentStep].step_type === 'contract_signing' ? 'Contract Signing' : 'Payment Processing'}
                                  </h3>
                                  <p className="text-gray-600">
                                    {steps[currentStep].step_type === 'contract_signing' 
                                      ? 'Review and sign the contract to proceed.'
                                      : 'Complete payment to finalize your onboarding.'
                                    }
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between pt-4">
                              <Button
                                variant="outline"
                                disabled={currentStep === 0}
                                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                              >
                                Previous
                              </Button>
                              <Button
                                onClick={simulateStepCompletion}
                                disabled={isSimulating || currentStep === steps.length - 1}
                              >
                                {isSimulating ? (
                                  <>
                                    <LoadingSpinner className="mr-2 h-4 w-4" />
                                    Processing...
                                  </>
                                ) : currentStep === steps.length - 1 ? (
                                  'Complete Kit'
                                ) : (
                                  'Continue'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
