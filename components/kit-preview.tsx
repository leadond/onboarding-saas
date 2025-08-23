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

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  FileText, 
  Upload, 
  Settings, 
  Users, 
  Shield,
  BookOpen,
  Award,
  Info
} from 'lucide-react'

interface KitStep {
  id: string
  title: string
  description: string
  type: string
  order: number
}

interface Kit {
  id: string
  name: string
  title: string
  description: string
  welcome_message: string
  brand_color?: string
  logo_url?: string
  status: string
  configuration?: {
    steps: KitStep[]
  }
}

interface KitPreviewProps {
  kit: Kit
  steps: KitStep[]
  clientIdentifier: string
  initialStepId?: string
}

export function KitPreview({ kit, steps, clientIdentifier, initialStepId }: KitPreviewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(
    initialStepId ? steps.findIndex(step => step.id === initialStepId) : 0
  )
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const currentStep = steps[currentStepIndex]
  const progress = (completedSteps.size / steps.length) * 100

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'information':
        return <Info className="w-5 h-5" />
      case 'form':
        return <FileText className="w-5 h-5" />
      case 'file_upload':
        return <Upload className="w-5 h-5" />
      case 'review':
      case 'screening':
        return <Shield className="w-5 h-5" />
      case 'configuration':
      case 'integration':
        return <Settings className="w-5 h-5" />
      case 'tutorial':
      case 'training':
        return <BookOpen className="w-5 h-5" />
      case 'completion':
        return <Award className="w-5 h-5" />
      case 'verification':
        return <Shield className="w-5 h-5" />
      case 'action':
        return <Users className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const handleNext = () => {
    if (currentStep) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]))
    }
    
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index)
  }

  const isStepCompleted = (stepId: string) => completedSteps.has(stepId)
  const isStepCurrent = (index: number) => index === currentStepIndex
  const isStepAccessible = (index: number) => index <= currentStepIndex || completedSteps.has(steps[index]?.id)

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No steps found</h1>
          <p className="text-gray-600">This kit doesn't have any steps configured.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{kit.name}</h1>
              <p className="text-gray-600 mt-1">{kit.description}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Preview Mode
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Steps</CardTitle>
                <CardDescription>
                  {completedSteps.size} of {steps.length} completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    disabled={!isStepAccessible(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isStepCurrent(index)
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : isStepCompleted(step.id)
                        ? 'border-green-200 bg-green-50 text-green-900'
                        : isStepAccessible(index)
                        ? 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 ${
                        isStepCompleted(step.id)
                          ? 'text-green-600'
                          : isStepCurrent(index)
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}>
                        {isStepCompleted(step.id) ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isStepCurrent(index) ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          getStepIcon(step.type)
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium truncate">{step.title}</p>
                        <p className="text-xs opacity-75 truncate">{step.type}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-blue-600">
                    {getStepIcon(currentStep.type)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{currentStep.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {currentStep.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Step Content Based on Type */}
                  {currentStep.type === 'information' && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed">
                        {kit.welcome_message || 'Welcome to this onboarding step. Please review the information below and proceed when ready.'}
                      </p>
                    </div>
                  )}

                  {currentStep.type === 'form' && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        This step would contain a form for collecting information. In the actual implementation, 
                        this would be a dynamic form based on the step configuration.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          📝 Form fields would appear here based on the step configuration
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep.type === 'file_upload' && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        This step would allow file uploads. Users would be able to drag and drop or select files to upload.
                      </p>
                      <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600">
                          📎 File upload interface would appear here
                        </p>
                      </div>
                    </div>
                  )}

                  {(currentStep.type === 'review' || currentStep.type === 'screening') && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        This step involves review and verification processes. The system would display 
                        information for review and approval.
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-700">
                          🔍 Review interface would appear here with verification controls
                        </p>
                      </div>
                    </div>
                  )}

                  {(currentStep.type === 'configuration' || currentStep.type === 'integration') && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        This step would provide configuration options and integration settings.
                      </p>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-700">
                          ⚙️ Configuration interface would appear here
                        </p>
                      </div>
                    </div>
                  )}

                  {(currentStep.type === 'tutorial' || currentStep.type === 'training') && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        This step would provide interactive tutorials and training materials.
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-700">
                          📚 Interactive tutorial content would appear here
                        </p>
                      </div>
                    </div>
                  )}

                  {currentStep.type === 'completion' && (
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Award className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentStepIndex === steps.length - 1 ? 'Congratulations!' : 'Step Complete!'}
                      </h3>
                      <p className="text-gray-700">
                        {currentStepIndex === steps.length - 1 
                          ? 'You have successfully completed the onboarding process!'
                          : 'This step is complete. You can proceed to the next step.'
                        }
                      </p>
                    </div>
                  )}

                  {/* Default content for other types */}
                  {!['information', 'form', 'file_upload', 'review', 'screening', 'configuration', 'integration', 'tutorial', 'training', 'completion'].includes(currentStep.type) && (
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        This is a {currentStep.type} step. The content would be customized based on the specific step type and configuration.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                          🔧 Custom step content would appear here
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="text-sm text-gray-500">
                    Step {currentStepIndex + 1} of {steps.length}
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={currentStepIndex === steps.length - 1 && isStepCompleted(currentStep.id)}
                  >
                    {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}