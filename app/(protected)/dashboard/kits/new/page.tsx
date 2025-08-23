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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/use-toast'
import SuspenseWrapper from '@/components/suspense-wrapper'

interface Company {
  id: string
  name: string
  industry: string
}

interface AIRecommendation {
  id: string
  title: string
  description: string
  type: 'step' | 'document' | 'legal'
  required: boolean
  industry_specific: boolean
  estimated_time?: string
}

interface GeneratedDocument {
  id: string
  title: string
  type: 'sow' | 'poc' | 'agreement' | 'contract'
  content: string
  editable: boolean
}

function CreateKitPageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [companies, setCompanies] = useState<Company[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([])
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    welcome_message: '',
    brand_color: '#3B82F6',
    // AI-Assisted Fields
    company_id: '',
    industry: '',
    service_type: '',
    product_description: '',
    project_value: '',
    timeline: '',
    special_requirements: '',
    selected_recommendations: [] as string[],
    custom_steps: [] as string[],
  })

  // Load companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // In development, provide mock companies
        if (process.env.NODE_ENV === 'development') {
          const mockCompanies: Company[] = [
            { id: '1', name: 'Acme Corporation', industry: 'Technology' },
            { id: '2', name: 'Global Industries', industry: 'Manufacturing' },
            { id: '3', name: 'StartupCo', industry: 'Software' },
            { id: '4', name: 'Legal Partners LLC', industry: 'Legal Services' },
            { id: '5', name: 'Creative Agency', industry: 'Marketing' },
            { id: '6', name: 'HealthTech Solutions', industry: 'Healthcare' },
          ]
          setCompanies(mockCompanies)
          return
        }

        const response = await fetch('/api/v1/companies')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.data || [])
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err)
      }
    }

    fetchCompanies()
  }, [])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateAIRecommendations = async () => {
    if (!formData.industry || !formData.service_type || !formData.product_description) {
      toast({
        title: 'Missing Information',
        description: 'Please select a company/industry and provide a detailed service description first.',
        variant: 'destructive'
      })
      return
    }

    setIsGeneratingRecommendations(true)
    try {
      // Call the AI API endpoint with your OpenAI key
      const response = await fetch('/api/ai/kit-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: formData.industry,
          service_type: formData.service_type,
          product_description: formData.product_description,
          project_value: formData.project_value,
          timeline: formData.timeline,
          special_requirements: formData.special_requirements,
          spell_check_enabled: spellCheckEnabled
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI recommendations')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'AI generation failed')
      }

      // Set the AI-generated recommendations and documents
      setAiRecommendations(data.data.recommendations || [])
      setGeneratedDocuments(data.data.documents || [])

      // Show spell check suggestions if enabled
      if (data.data.spell_check_suggestions && data.data.spell_check_suggestions.errors_found > 0) {
        toast({
          title: '📝 Spell Check Results',
          description: `Found ${data.data.spell_check_suggestions.errors_found} suggestions for improvement.`,
        })
      }

      toast({
        title: '🤖 AI Recommendations Generated!',
        description: `Generated ${data.data.recommendations?.length || 0} recommendations and ${data.data.documents?.length || 0} documents using OpenAI.`
      })

      setCurrentStep(2)
    } catch (err) {
      console.error('AI Generation Error:', err)
      
      // Fallback to mock data if AI fails
      toast({
        title: 'AI Temporarily Unavailable',
        description: 'Using fallback recommendations. AI features will be restored shortly.',
        variant: 'destructive'
      })
      
      const mockRecommendations: AIRecommendation[] = generateMockRecommendations(
        formData.industry,
        formData.service_type
      )
      setAiRecommendations(mockRecommendations)
      
      const documents = generateMockDocuments(formData)
      setGeneratedDocuments(documents)
      
      setCurrentStep(2)
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const generateMockRecommendations = (industry: string, serviceType: string): AIRecommendation[] => {
    const baseRecommendations: AIRecommendation[] = [
      {
        id: '1',
        title: 'Client Information Collection',
        description: 'Gather essential client contact information, business details, and project requirements.',
        type: 'step',
        required: true,
        industry_specific: false,
        estimated_time: '15 minutes'
      },
      {
        id: '2',
        title: 'Project Scope Definition',
        description: 'Define clear project boundaries, deliverables, and success criteria.',
        type: 'step',
        required: true,
        industry_specific: false,
        estimated_time: '30 minutes'
      },
      {
        id: '3',
        title: 'Service Agreement Review',
        description: 'Review and sign the master service agreement outlining terms and conditions.',
        type: 'legal',
        required: true,
        industry_specific: false,
        estimated_time: '20 minutes'
      }
    ]

    // Industry-specific recommendations
    const industryRecommendations: Record<string, AIRecommendation[]> = {
      'Technology': [
        {
          id: '4',
          title: 'Technical Requirements Assessment',
          description: 'Evaluate technical infrastructure, security requirements, and integration needs.',
          type: 'step',
          required: true,
          industry_specific: true,
          estimated_time: '45 minutes'
        },
        {
          id: '5',
          title: 'Data Security Agreement',
          description: 'Sign data processing and security compliance agreements (GDPR, CCPA, etc.).',
          type: 'legal',
          required: true,
          industry_specific: true,
          estimated_time: '25 minutes'
        },
        {
          id: '6',
          title: 'API Access & Documentation',
          description: 'Provide API keys, documentation, and development environment access.',
          type: 'document',
          required: false,
          industry_specific: true,
          estimated_time: '20 minutes'
        }
      ],
      'Legal Services': [
        {
          id: '7',
          title: 'Conflict of Interest Check',
          description: 'Perform comprehensive conflict of interest screening and documentation.',
          type: 'step',
          required: true,
          industry_specific: true,
          estimated_time: '30 minutes'
        },
        {
          id: '8',
          title: 'Attorney-Client Privilege Agreement',
          description: 'Establish attorney-client privilege and confidentiality protections.',
          type: 'legal',
          required: true,
          industry_specific: true,
          estimated_time: '15 minutes'
        },
        {
          id: '9',
          title: 'Retainer Agreement',
          description: 'Execute retainer agreement and establish billing arrangements.',
          type: 'legal',
          required: true,
          industry_specific: true,
          estimated_time: '20 minutes'
        }
      ],
      'Healthcare': [
        {
          id: '10',
          title: 'HIPAA Compliance Verification',
          description: 'Ensure all HIPAA compliance requirements are met and documented.',
          type: 'step',
          required: true,
          industry_specific: true,
          estimated_time: '40 minutes'
        },
        {
          id: '11',
          title: 'Business Associate Agreement',
          description: 'Execute HIPAA Business Associate Agreement for protected health information.',
          type: 'legal',
          required: true,
          industry_specific: true,
          estimated_time: '25 minutes'
        }
      ],
      'Manufacturing': [
        {
          id: '12',
          title: 'Safety & Compliance Review',
          description: 'Review safety protocols, regulatory compliance, and quality standards.',
          type: 'step',
          required: true,
          industry_specific: true,
          estimated_time: '35 minutes'
        },
        {
          id: '13',
          title: 'Quality Assurance Agreement',
          description: 'Establish quality standards, testing procedures, and acceptance criteria.',
          type: 'legal',
          required: true,
          industry_specific: true,
          estimated_time: '30 minutes'
        }
      ]
    }

    const industrySpecific = industryRecommendations[industry] || []
    return [...baseRecommendations, ...industrySpecific]
  }

  const generateMockDocuments = (formData: any): GeneratedDocument[] => {
    const documents: GeneratedDocument[] = []

    // Statement of Work (SOW)
    documents.push({
      id: 'sow-1',
      title: 'Statement of Work',
      type: 'sow',
      content: generateSOWContent(formData),
      editable: true
    })

    // Proof of Concept Agreement (if applicable)
    if (formData.service_type.toLowerCase().includes('development') || 
        formData.service_type.toLowerCase().includes('software') ||
        formData.service_type.toLowerCase().includes('poc')) {
      documents.push({
        id: 'poc-1',
        title: 'Proof of Concept Agreement',
        type: 'poc',
        content: generatePOCContent(formData),
        editable: true
      })
    }

    // Master Service Agreement
    documents.push({
      id: 'msa-1',
      title: 'Master Service Agreement',
      type: 'agreement',
      content: generateMSAContent(formData),
      editable: true
    })

    return documents
  }

  const generateSOWContent = (formData: any): string => {
    const projectValue = formData.project_value ? `$${formData.project_value}` : '[PROJECT VALUE]'
    const timeline = formData.timeline || '[PROJECT TIMELINE]'
    
    return `# Statement of Work

## Project Overview
**Service Type:** ${formData.service_type || '[SERVICE TYPE]'}
**Industry:** ${formData.industry || '[INDUSTRY]'}
**Project Value:** ${projectValue}
**Timeline:** ${timeline}

## Scope of Work
${formData.product_description || '[DETAILED DESCRIPTION OF SERVICES TO BE PROVIDED]'}

## Deliverables
1. [Primary Deliverable 1]
2. [Primary Deliverable 2]
3. [Primary Deliverable 3]

## Timeline & Milestones
- **Phase 1:** [Description] - [Timeline]
- **Phase 2:** [Description] - [Timeline]
- **Phase 3:** [Description] - [Timeline]

## Payment Terms
- **Total Project Value:** ${projectValue}
- **Payment Schedule:** [Payment terms and schedule]
- **Invoicing:** [Invoicing details]

## Special Requirements
${formData.special_requirements || 'No special requirements specified.'}

## Acceptance Criteria
[Define clear acceptance criteria for project completion]

---
*This document is generated by AI and should be reviewed and customized before use.*`
  }

  const generatePOCContent = (formData: any): string => {
    return `# Proof of Concept Agreement

## POC Overview
This Proof of Concept (POC) agreement outlines the terms for a limited-scope demonstration of the proposed solution.

**Service Type:** ${formData.service_type || '[SERVICE TYPE]'}
**Industry:** ${formData.industry || '[INDUSTRY]'}
**POC Duration:** 30 days (unless otherwise specified)

## POC Objectives
1. Demonstrate core functionality
2. Validate technical feasibility
3. Assess integration requirements
4. Evaluate performance metrics

## POC Scope
${formData.product_description || '[POC SCOPE AND LIMITATIONS]'}

## Success Criteria
- [Measurable success criterion 1]
- [Measurable success criterion 2]
- [Measurable success criterion 3]

## POC Deliverables
1. Working prototype/demo
2. Technical documentation
3. Performance analysis report
4. Recommendations for full implementation

## Terms & Conditions
- POC is provided on a best-effort basis
- No warranty or guarantee of results
- Intellectual property remains with respective parties
- Data confidentiality maintained throughout POC

## Next Steps
Upon successful POC completion, parties may proceed with full project implementation under separate agreement.

---
*This document is generated by AI and should be reviewed and customized before use.*`
  }

  const generateMSAContent = (formData: any): string => {
    return `# Master Service Agreement

## Parties
**Service Provider:** [COMPANY NAME]
**Client:** [CLIENT COMPANY NAME]

## Services Overview
**Industry:** ${formData.industry || '[INDUSTRY]'}
**Service Category:** ${formData.service_type || '[SERVICE TYPE]'}

## General Terms
1. **Scope of Services:** Services will be defined in individual Statements of Work
2. **Term:** This agreement shall remain in effect for [TERM] unless terminated
3. **Confidentiality:** Both parties agree to maintain confidentiality of proprietary information

## Payment Terms
- **Payment Schedule:** Net 30 days from invoice date
- **Late Fees:** 1.5% per month on overdue amounts
- **Expenses:** Pre-approved expenses will be reimbursed

## Intellectual Property
- **Work Product:** All work product created shall be owned by Client
- **Pre-existing IP:** Each party retains ownership of pre-existing intellectual property
- **License:** Service Provider grants Client license to use deliverables

## Limitation of Liability
Service Provider's liability shall not exceed the total amount paid under the applicable Statement of Work.

## Termination
Either party may terminate this agreement with 30 days written notice.

## Governing Law
This agreement shall be governed by the laws of [STATE/JURISDICTION].

## Special Provisions
${formData.special_requirements || 'No special provisions.'}

---
*This document is generated by AI and should be reviewed by legal counsel before execution.*`
  }

  const handleRecommendationToggle = (recommendationId: string) => {
    const selected = formData.selected_recommendations.includes(recommendationId)
    if (selected) {
      handleInputChange('selected_recommendations', 
        formData.selected_recommendations.filter(id => id !== recommendationId)
      )
    } else {
      handleInputChange('selected_recommendations', 
        [...formData.selected_recommendations, recommendationId]
      )
    }
  }

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find(c => c.id === companyId)
    if (company) {
      handleInputChange('company_id', companyId)
      handleInputChange('industry', company.industry)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Kit name is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      // In development mode, simulate kit creation
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        toast({
          title: 'Kit Created Successfully!',
          description: `"${formData.name}" has been created with AI-generated recommendations.`
        })
        
        // Simulate navigation to kit detail page
        router.push('/dashboard/kits')
        return
      }

      const response = await fetch('/api/kits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          welcome_message: formData.welcome_message || null,
          brand_color: formData.brand_color,
          status: 'draft',
          analytics_enabled: true,
          // AI-generated data
          company_id: formData.company_id,
          industry: formData.industry,
          service_type: formData.service_type,
          ai_recommendations: aiRecommendations,
          generated_documents: generatedDocuments,
          selected_recommendations: formData.selected_recommendations,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create kit')
      }

      const result = await response.json()
      router.push(`/dashboard/kits/${result.data.id}`)
    } catch (error) {
      console.error('Error creating kit:', error)
      setError(error instanceof Error ? error.message : 'Failed to create kit')
    } finally {
      setIsCreating(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🤖 AI-Assisted Kit Creation</h1>
        <p className="mt-2 text-gray-600">
          Let AI help you build industry-specific onboarding workflows with legal documents
        </p>
      </div>

      {renderStepIndicator()}

      {/* Step 1: Basic Information & Service Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Kit Information</CardTitle>
              <CardDescription>
                Start with the basic details for your onboarding kit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Kit Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Software Development Onboarding"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Select Company</Label>
                  <Select onValueChange={handleCompanySelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.industry})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Kit Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this onboarding kit"
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Service & Project Details</CardTitle>
              <CardDescription>
                Tell AI about your service to get industry-specific recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">What service are you providing? *</Label>
                  <Input
                    id="service_type"
                    placeholder="e.g., Software Development, Legal Consulting, Marketing"
                    value={formData.service_type}
                    onChange={e => handleInputChange('service_type', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="project_value">Project Value (USD)</Label>
                  <Input
                    id="project_value"
                    type="number"
                    placeholder="50000"
                    value={formData.project_value}
                    onChange={e => handleInputChange('project_value', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="product_description">Detailed Service Description *</Label>
                <Textarea
                  id="product_description"
                  placeholder="Describe the specific product or service being delivered. Include key features, scope, and deliverables."
                  value={formData.product_description}
                  onChange={e => handleInputChange('product_description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Expected Timeline</Label>
                  <Input
                    id="timeline"
                    placeholder="e.g., 3 months, 6 weeks"
                    value={formData.timeline}
                    onChange={e => handleInputChange('timeline', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry (Auto-filled)</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    disabled
                    placeholder="Select a company first"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special_requirements">Special Requirements or Compliance Needs</Label>
                <Textarea
                  id="special_requirements"
                  placeholder="Any special requirements, compliance needs, or industry-specific considerations"
                  value={formData.special_requirements}
                  onChange={e => handleInputChange('special_requirements', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spell_check"
                  checked={spellCheckEnabled}
                  onCheckedChange={setSpellCheckEnabled}
                />
                <Label htmlFor="spell_check">Enable AI spell & grammar checking</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/kits">Cancel</Link>
            </Button>
            <Button 
              onClick={generateAIRecommendations}
              disabled={!formData.service_type || !formData.product_description || isGeneratingRecommendations}
            >
              {isGeneratingRecommendations ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Generating AI Recommendations...
                </>
              ) : (
                '🤖 Generate AI Recommendations'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: AI Recommendations */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🤖 AI-Generated Onboarding Steps</CardTitle>
              <CardDescription>
                Review and customize the AI-recommended onboarding steps for {formData.industry} industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiRecommendations.map(recommendation => (
                  <div key={recommendation.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={formData.selected_recommendations.includes(recommendation.id)}
                        onCheckedChange={() => handleRecommendationToggle(recommendation.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{recommendation.title}</h4>
                          <Badge variant={recommendation.required ? 'destructive' : 'secondary'}>
                            {recommendation.required ? 'Required' : 'Optional'}
                          </Badge>
                          <Badge variant={recommendation.industry_specific ? 'default' : 'outline'}>
                            {recommendation.industry_specific ? 'Industry-Specific' : 'Standard'}
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                        {recommendation.estimated_time && (
                          <p className="text-xs text-gray-500">⏱️ Estimated time: {recommendation.estimated_time}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📄 AI-Generated Legal Documents</CardTitle>
              <CardDescription>
                Review the automatically generated legal documents and agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedDocuments.map(document => (
                  <div key={document.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{document.title}</h4>
                        <Badge>{document.type.toUpperCase()}</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit Document
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap">{document.content.substring(0, 300)}...</pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back to Details
            </Button>
            <Button onClick={() => setCurrentStep(3)}>
              Review & Finalize
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Final Review */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📋 Final Review</CardTitle>
              <CardDescription>
                Review your AI-assisted onboarding kit before creation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="welcome_message">Welcome Message for Clients</Label>
                <Textarea
                  id="welcome_message"
                  placeholder="Welcome to our onboarding process..."
                  value={formData.welcome_message}
                  onChange={e => handleInputChange('welcome_message', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="brand_color">Brand Color</Label>
                <div className="flex items-center space-x-3">
                  <input
                    id="brand_color"
                    type="color"
                    className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                    value={formData.brand_color}
                    onChange={e => handleInputChange('brand_color', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={formData.brand_color}
                    onChange={e => handleInputChange('brand_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Selected Steps ({formData.selected_recommendations.length})</h4>
                  <div className="space-y-2">
                    {aiRecommendations
                      .filter(r => formData.selected_recommendations.includes(r.id))
                      .map(r => (
                        <div key={r.id} className="text-sm p-2 bg-blue-50 rounded">
                          {r.title}
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Generated Documents ({generatedDocuments.length})</h4>
                  <div className="space-y-2">
                    {generatedDocuments.map(d => (
                      <div key={d.id} className="text-sm p-2 bg-green-50 rounded">
                        {d.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              Back to Recommendations
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || !formData.name.trim()}
            >
              {isCreating ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Creating Kit...
                </>
              ) : (
                '🚀 Create AI-Assisted Kit'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateKitPage() {
  return (
    <SuspenseWrapper>
      <CreateKitPageComponent />
    </SuspenseWrapper>
  )
}
