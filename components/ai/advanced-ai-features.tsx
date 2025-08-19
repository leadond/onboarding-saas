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

import React from 'react'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Brain,
  Sparkles,
  Wand2,
  MessageSquare,
  FileText,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Check,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Users,
  BarChart3,
  Activity,
  Award,
  Crown,
  Rocket,
  Sparkles as Magic,
  Bot,
  Cpu,
  Database,
  Globe,
  Mail,
  Phone,
  Calendar,
  Image,
  Video,
  Mic,
  Camera,
  PenTool,
  Type,
  Palette,
  Layout
} from 'lucide-react'

interface AIModel {
  id: string
  name: string
  type: 'content_generation' | 'recommendation' | 'optimization' | 'analysis' | 'personalization'
  status: 'active' | 'training' | 'inactive' | 'error'
  accuracy: number
  usage_count: number
  last_trained: string
  description: string
  capabilities: string[]
  cost_per_request: number
  response_time: number
}

interface ContentTemplate {
  id: string
  name: string
  type: 'email' | 'form' | 'page' | 'document' | 'message'
  category: string
  description: string
  ai_generated: boolean
  usage_count: number
  rating: number
  created_at: string
  content_preview: string
  variables: string[]
  industry: string
  tone: 'professional' | 'friendly' | 'casual' | 'formal'
}

interface SmartRecommendation {
  id: string
  type: 'content_improvement' | 'workflow_optimization' | 'user_experience' | 'conversion_optimization'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  category: string
  data_source: string
  created_at: string
  status: 'new' | 'implemented' | 'dismissed' | 'in_progress'
  expected_improvement: string
  implementation_steps: string[]
}

interface AIGenerationRequest {
  id: string
  type: 'email_template' | 'form_content' | 'page_copy' | 'document' | 'personalized_message'
  prompt: string
  parameters: {
    tone: string
    length: string
    industry: string
    audience: string
    purpose: string
  }
  status: 'pending' | 'generating' | 'completed' | 'failed'
  result?: string
  created_at: string
  processing_time?: number
  tokens_used?: number
  cost?: number
}

// Mock data
const mockAIModels: AIModel[] = [
  {
    id: '1',
    name: 'Content Generator Pro',
    type: 'content_generation',
    status: 'active',
    accuracy: 94.2,
    usage_count: 15847,
    last_trained: '2024-08-10T00:00:00Z',
    description: 'Advanced language model for generating high-quality onboarding content',
    capabilities: ['Email templates', 'Form descriptions', 'Page copy', 'Documentation'],
    cost_per_request: 0.02,
    response_time: 1.8
  },
  {
    id: '2',
    name: 'Smart Recommender',
    type: 'recommendation',
    status: 'active',
    accuracy: 89.7,
    usage_count: 8934,
    last_trained: '2024-08-12T00:00:00Z',
    description: 'Intelligent recommendation engine for workflow and content optimization',
    capabilities: ['Workflow suggestions', 'Content improvements', 'UX recommendations'],
    cost_per_request: 0.01,
    response_time: 0.9
  },
  {
    id: '3',
    name: 'Personalization Engine',
    type: 'personalization',
    status: 'active',
    accuracy: 91.5,
    usage_count: 12456,
    last_trained: '2024-08-08T00:00:00Z',
    description: 'Dynamic content personalization based on user behavior and preferences',
    capabilities: ['Dynamic content', 'User segmentation', 'Behavioral targeting'],
    cost_per_request: 0.015,
    response_time: 1.2
  },
  {
    id: '4',
    name: 'Optimization Analyzer',
    type: 'optimization',
    status: 'training',
    accuracy: 87.3,
    usage_count: 5623,
    last_trained: '2024-08-14T00:00:00Z',
    description: 'Advanced analytics for identifying optimization opportunities',
    capabilities: ['Performance analysis', 'A/B test suggestions', 'Conversion optimization'],
    cost_per_request: 0.025,
    response_time: 2.1
  }
]

const mockContentTemplates: ContentTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email - Professional Services',
    type: 'email',
    category: 'Welcome Sequence',
    description: 'AI-generated welcome email template for professional service providers',
    ai_generated: true,
    usage_count: 234,
    rating: 4.8,
    created_at: '2024-08-10T00:00:00Z',
    content_preview: 'Welcome to [COMPANY_NAME]! We\'re excited to begin this journey with you...',
    variables: ['COMPANY_NAME', 'CLIENT_NAME', 'SERVICE_TYPE', 'NEXT_STEPS'],
    industry: 'Professional Services',
    tone: 'professional'
  },
  {
    id: '2',
    name: 'Onboarding Form - SaaS Product',
    type: 'form',
    category: 'Data Collection',
    description: 'Optimized form fields and descriptions for SaaS onboarding',
    ai_generated: true,
    usage_count: 189,
    rating: 4.6,
    created_at: '2024-08-12T00:00:00Z',
    content_preview: 'Help us personalize your experience by sharing a few details about your goals...',
    variables: ['PRODUCT_NAME', 'USER_ROLE', 'COMPANY_SIZE', 'USE_CASE'],
    industry: 'Technology',
    tone: 'friendly'
  },
  {
    id: '3',
    name: 'Progress Update - Healthcare',
    type: 'message',
    category: 'Progress Updates',
    description: 'HIPAA-compliant progress update messages for healthcare onboarding',
    ai_generated: true,
    usage_count: 156,
    rating: 4.9,
    created_at: '2024-08-08T00:00:00Z',
    content_preview: 'Your onboarding is progressing well. We\'ve completed [PROGRESS]% of the required steps...',
    variables: ['PROGRESS', 'NEXT_STEP', 'COMPLETION_DATE', 'CONTACT_INFO'],
    industry: 'Healthcare',
    tone: 'professional'
  }
]

const mockRecommendations: SmartRecommendation[] = [
  {
    id: '1',
    type: 'conversion_optimization',
    title: 'Optimize Form Field Order',
    description: 'AI analysis suggests reordering form fields to reduce abandonment by 23%. Place email field first, followed by company name, then role.',
    confidence: 92,
    impact: 'high',
    effort: 'low',
    category: 'User Experience',
    data_source: 'User behavior analysis (10,000+ sessions)',
    created_at: '2024-08-14T10:30:00Z',
    status: 'new',
    expected_improvement: '+23% form completion rate',
    implementation_steps: [
      'Reorder form fields in the onboarding kit builder',
      'Update existing forms to use the new field order',
      'A/B test the new order against the current layout',
      'Monitor completion rates for 2 weeks'
    ]
  },
  {
    id: '2',
    type: 'content_improvement',
    title: 'Personalize Welcome Messages',
    description: 'Add industry-specific welcome messages to increase engagement. Healthcare clients show 45% higher engagement with specialized content.',
    confidence: 87,
    impact: 'medium',
    effort: 'medium',
    category: 'Content Strategy',
    data_source: 'Industry engagement metrics',
    created_at: '2024-08-13T15:45:00Z',
    status: 'in_progress',
    expected_improvement: '+45% message engagement',
    implementation_steps: [
      'Create industry-specific message templates',
      'Implement dynamic content selection logic',
      'Train AI model on industry-specific language',
      'Deploy and monitor engagement metrics'
    ]
  },
  {
    id: '3',
    type: 'workflow_optimization',
    title: 'Automate Follow-up Sequences',
    description: 'Implement AI-driven follow-up timing based on user behavior patterns. Optimal timing can improve response rates by 34%.',
    confidence: 89,
    impact: 'high',
    effort: 'high',
    category: 'Automation',
    data_source: 'Response timing analysis',
    created_at: '2024-08-12T09:20:00Z',
    status: 'new',
    expected_improvement: '+34% response rate',
    implementation_steps: [
      'Analyze user behavior patterns',
      'Build predictive timing model',
      'Integrate with workflow automation',
      'Test and refine timing algorithms'
    ]
  }
]

const mockGenerationRequests: AIGenerationRequest[] = [
  {
    id: '1',
    type: 'email_template',
    prompt: 'Create a welcome email for a financial services onboarding process',
    parameters: {
      tone: 'professional',
      length: 'medium',
      industry: 'Financial Services',
      audience: 'Business clients',
      purpose: 'Welcome and set expectations'
    },
    status: 'completed',
    result: 'Welcome to SecureFinance! We\'re delighted to partner with you on your financial journey. Our comprehensive onboarding process ensures...',
    created_at: '2024-08-14T14:20:00Z',
    processing_time: 2.3,
    tokens_used: 450,
    cost: 0.018
  },
  {
    id: '2',
    type: 'form_content',
    prompt: 'Generate form field descriptions for a healthcare client intake form',
    parameters: {
      tone: 'professional',
      length: 'short',
      industry: 'Healthcare',
      audience: 'Patients',
      purpose: 'Data collection for treatment'
    },
    status: 'generating',
    created_at: '2024-08-14T15:10:00Z'
  }
]

export function AdvancedAIFeatures() {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed'>('idle')
  const [generatedContent, setGeneratedContent] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'training':
      case 'generating':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
      case 'new':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'dismissed':
        return 'bg-gray-100 text-gray-800'
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3
    }).format(amount)
  }

  const handleGenerate = async () => {
    setGenerationStatus('generating')
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(`Generated content based on your prompt: "${generationPrompt}"\n\nThis is a sample AI-generated response that would contain the requested content with appropriate tone, style, and industry-specific language.`)
      setGenerationStatus('completed')
    }, 3000)
  }

  const totalUsage = mockAIModels.reduce((sum, model) => sum + model.usage_count, 0)
  const activeModels = mockAIModels.filter(m => m.status === 'active').length
  const avgAccuracy = mockAIModels.reduce((sum, model) => sum + model.accuracy, 0) / mockAIModels.length
  const totalCost = mockGenerationRequests.reduce((sum, req) => sum + (req.cost || 0), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            Advanced AI Features
          </h1>
          <p className="text-gray-600">
            Leverage cutting-edge AI for content generation, smart recommendations, and intelligent optimization.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>AI Content Generation</DialogTitle>
                <DialogDescription>
                  Use AI to generate high-quality content for your onboarding processes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Template</SelectItem>
                      <SelectItem value="form">Form Content</SelectItem>
                      <SelectItem value="page">Page Copy</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="message">Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Financial Services</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="professional">Professional Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Content Prompt</Label>
                  <Textarea
                    placeholder="Describe what you want to generate..."
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                {generationStatus === 'generating' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating content...</span>
                    </div>
                    <Progress value={66} className="h-2" />
                  </div>
                )}
                {generationStatus === 'completed' && (
                  <div className="space-y-2">
                    <Label>Generated Content</Label>
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                {generationStatus === 'idle' && (
                  <Button onClick={handleGenerate} disabled={!generationPrompt}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                )}
                {generationStatus === 'completed' && (
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Use Content
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Bot className="h-4 w-4 mr-2" />
              Active Models
            </CardTitle>
            <div className="text-2xl font-bold">{activeModels}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockAIModels.length - activeModels} training/inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Total Usage
            </CardTitle>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              AI requests processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Avg. Accuracy
            </CardTitle>
            <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Monthly Cost
            </CardTitle>
            <div className="text-2xl font-bold">{formatCurrency(totalCost * 30)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Estimated usage cost
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="templates">Content Templates</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="generation">Content Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {/* AI Models */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockAIModels.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{model.name}</span>
                          <Badge className={getStatusColor(model.status)}>
                            {model.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{model.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                        <div className="text-lg font-bold text-green-600">{model.accuracy}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Usage Count</div>
                        <div className="text-lg font-bold">{model.usage_count.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Cost per Request</div>
                        <div className="text-lg font-bold">{formatCurrency(model.cost_per_request)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Response Time</div>
                        <div className="text-lg font-bold">{model.response_time}s</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Capabilities</div>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.map((capability, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Last trained: {formatDate(model.last_trained)}</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retrain
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Content Templates */}
          <div className="space-y-6">
            {mockContentTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          <span>{template.name}</span>
                          {template.ai_generated && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                          <Badge variant="outline">{template.type}</Badge>
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                      <Badge variant="outline">{template.usage_count} uses</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 italic">
                        "{template.content_preview}"
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Industry</div>
                        <div className="font-medium">{template.industry}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tone</div>
                        <div className="font-medium capitalize">{template.tone}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Category</div>
                        <div className="font-medium">{template.category}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Created</div>
                        <div className="font-medium">{formatDate(template.created_at)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Variables</div>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-mono">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Customize
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Smart Recommendations */}
          <div className="space-y-6">
            {mockRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          <span>{recommendation.title}</span>
                          <Badge className={getStatusColor(recommendation.status)}>
                            {recommendation.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">
                        {recommendation.confidence}% confidence
                      </div>
                      <div className="text-xs text-gray-500">
                        {recommendation.expected_improvement}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Badge className={getImpactColor(recommendation.impact)}>
                        {recommendation.impact} impact
                      </Badge>
                      <Badge className={getEffortColor(recommendation.effort)}>
                        {recommendation.effort} effort
                      </Badge>
                      <Badge variant="outline">{recommendation.category}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Confidence Level</span>
                        <span className="font-medium">{recommendation.confidence}%</span>
                      </div>
                      <Progress value={recommendation.confidence} className="h-2" />
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Implementation Steps:</div>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                        {recommendation.implementation_steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Data source: {recommendation.data_source}</span>
                      <span>Created: {formatDateTime(recommendation.created_at)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {recommendation.status === 'new' && (
                        <>
                          <Button size="sm">
                            <Check className="h-4 w-4 mr-2" />
                            Implement
                          </Button>
                          <Button size="sm" variant="outline">
                            <Clock className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Helpful
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="generation" className="space-y-6">
          {/* Content Generation History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Generation Requests</CardTitle>
              <CardDescription>History of AI content generation requests and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGenerationRequests.map((request) => (
                  <div key={request.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      request.status === 'completed' ? 'bg-green-100' :
                      request.status === 'generating' ? 'bg-blue-100' :
                      request.status === 'failed' ? 'bg-red-100' :
                      'bg-yellow-100'
                    }`}>
                      {request.status === 'completed' ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : request.status === 'generating' ? (
                        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium capitalize">{request.type.replace('_', ' ')}</span>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{formatDateTime(request.created_at)}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">"{request.prompt}"</div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs text-gray-500 mb-2">
                        <div>
                          <span className="font-medium">Industry:</span> {request.parameters.industry}
                        </div>
                        <div>
                          <span className="font-medium">Tone:</span> {request.parameters.tone}
                        </div>
                        <div>
                          <span className="font-medium">Length:</span> {request.parameters.length}
                        </div>
                        <div>
                          <span className="font-medium">Audience:</span> {request.parameters.audience}
                        </div>
                        <div>
                          <span className="font-medium">Purpose:</span> {request.parameters.purpose}
                        </div>
                      </div>
                      {request.result && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Generated Content:</strong> {request.result.substring(0, 100)}...
                        </div>
                      )}
                      {request.processing_time && (
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Processing time: {request.processing_time}s</span>
                          <span>Tokens used: {request.tokens_used}</span>
                          <span>Cost: {formatCurrency(request.cost!)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === 'completed' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
