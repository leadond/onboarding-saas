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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Target,
  Zap,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  ArrowRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  Eye,
  MessageSquare,
  Calendar,
  Mail,
  Settings
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AIInsight {
  id: string
  type: 'prediction' | 'optimization' | 'anomaly' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  category: string
  data: any
  action_items: ActionItem[]
  created_at: string
  status: 'new' | 'viewed' | 'implemented' | 'dismissed'
}

interface ActionItem {
  id: string
  title: string
  description: string
  effort: 'low' | 'medium' | 'high'
  expected_impact: string
  implementation_time: string
}

interface PredictiveModel {
  id: string
  name: string
  description: string
  accuracy: number
  last_trained: string
  predictions: Prediction[]
  status: 'active' | 'training' | 'inactive'
}

interface Prediction {
  id: string
  metric: string
  current_value: number
  predicted_value: number
  prediction_date: string
  confidence: number
  factors: string[]
}

// Mock data
const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'prediction',
    title: 'Completion Rate Expected to Drop 15%',
    description: 'Based on current trends and seasonal patterns, completion rates are predicted to decrease by 15% over the next 30 days. This is primarily due to increased form complexity in recent kits.',
    confidence: 87,
    impact: 'high',
    category: 'Performance',
    data: {
      current_rate: 87.5,
      predicted_rate: 74.4,
      timeframe: '30 days',
      primary_factors: ['Form complexity increase', 'Seasonal trends', 'User behavior patterns']
    },
    action_items: [
      {
        id: 'a1',
        title: 'Simplify Form Fields',
        description: 'Reduce the number of required fields in new client forms by 30%',
        effort: 'medium',
        expected_impact: '+8% completion rate',
        implementation_time: '1-2 weeks'
      },
      {
        id: 'a2',
        title: 'Add Progress Indicators',
        description: 'Implement visual progress bars to show completion status',
        effort: 'low',
        expected_impact: '+5% completion rate',
        implementation_time: '3-5 days'
      }
    ],
    created_at: '2024-08-15T02:00:00Z',
    status: 'new'
  },
  {
    id: '2',
    type: 'optimization',
    title: 'Optimal Email Send Time Identified',
    description: 'AI analysis reveals that sending onboarding emails at 10:30 AM on Tuesdays results in 34% higher open rates and 28% better completion rates.',
    confidence: 92,
    impact: 'medium',
    category: 'Communication',
    data: {
      optimal_time: '10:30 AM',
      optimal_day: 'Tuesday',
      improvement: {
        open_rate: 34,
        completion_rate: 28
      },
      sample_size: 2847
    },
    action_items: [
      {
        id: 'a3',
        title: 'Update Email Scheduling',
        description: 'Configure automated emails to send at optimal times',
        effort: 'low',
        expected_impact: '+28% completion rate',
        implementation_time: '1 day'
      }
    ],
    created_at: '2024-08-14T15:30:00Z',
    status: 'viewed'
  },
  {
    id: '3',
    type: 'anomaly',
    title: 'Unusual Drop in Mobile Completions',
    description: 'Mobile completion rates have dropped 23% in the last 7 days, significantly deviating from normal patterns. This appears to be related to a recent UI update.',
    confidence: 95,
    impact: 'high',
    category: 'Technical',
    data: {
      drop_percentage: 23,
      timeframe: '7 days',
      affected_platform: 'mobile',
      likely_cause: 'UI update on Aug 8th'
    },
    action_items: [
      {
        id: 'a4',
        title: 'Review Mobile UI Changes',
        description: 'Audit recent mobile interface changes for usability issues',
        effort: 'medium',
        expected_impact: 'Restore normal completion rates',
        implementation_time: '2-3 days'
      }
    ],
    created_at: '2024-08-14T09:15:00Z',
    status: 'implemented'
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Personalization Opportunity Detected',
    description: 'Clients from the healthcare industry show 45% higher engagement with industry-specific content. Consider creating specialized onboarding flows.',
    confidence: 78,
    impact: 'medium',
    category: 'Personalization',
    data: {
      industry: 'Healthcare',
      engagement_increase: 45,
      affected_clients: 156,
      potential_revenue_impact: '$23,400'
    },
    action_items: [
      {
        id: 'a5',
        title: 'Create Healthcare Template',
        description: 'Develop industry-specific onboarding template for healthcare clients',
        effort: 'high',
        expected_impact: '+45% engagement',
        implementation_time: '2-3 weeks'
      }
    ],
    created_at: '2024-08-13T11:45:00Z',
    status: 'new'
  }
]

const mockPredictiveModels: PredictiveModel[] = [
  {
    id: '1',
    name: 'Completion Rate Predictor',
    description: 'Predicts client completion rates based on historical data and current trends',
    accuracy: 87.3,
    last_trained: '2024-08-14T00:00:00Z',
    status: 'active',
    predictions: [
      {
        id: 'p1',
        metric: 'Overall Completion Rate',
        current_value: 87.5,
        predicted_value: 74.4,
        prediction_date: '2024-09-15T00:00:00Z',
        confidence: 87,
        factors: ['Form complexity', 'Seasonal trends', 'User behavior']
      },
      {
        id: 'p2',
        metric: 'Mobile Completion Rate',
        current_value: 82.1,
        predicted_value: 85.7,
        prediction_date: '2024-09-15T00:00:00Z',
        confidence: 79,
        factors: ['UI improvements', 'Mobile optimization', 'User feedback']
      }
    ]
  },
  {
    id: '2',
    name: 'Churn Risk Analyzer',
    description: 'Identifies clients at risk of abandoning their onboarding process',
    accuracy: 91.7,
    last_trained: '2024-08-13T00:00:00Z',
    status: 'active',
    predictions: [
      {
        id: 'p3',
        metric: 'High Risk Clients',
        current_value: 23,
        predicted_value: 31,
        prediction_date: '2024-09-01T00:00:00Z',
        confidence: 92,
        factors: ['Inactivity duration', 'Step completion rate', 'Support interactions']
      }
    ]
  },
  {
    id: '3',
    name: 'Revenue Impact Forecaster',
    description: 'Forecasts revenue impact of onboarding improvements',
    accuracy: 84.2,
    last_trained: '2024-08-12T00:00:00Z',
    status: 'training',
    predictions: []
  }
]

// Mock chart data
const completionTrendData = [
  { date: 'Aug 1', actual: 85, predicted: 85 },
  { date: 'Aug 5', actual: 87, predicted: 86 },
  { date: 'Aug 10', actual: 89, predicted: 88 },
  { date: 'Aug 15', actual: 87, predicted: 87 },
  { date: 'Aug 20', actual: null, predicted: 82 },
  { date: 'Aug 25', actual: null, predicted: 78 },
  { date: 'Aug 30', actual: null, predicted: 74 }
]

const optimizationImpactData = [
  { category: 'Email Timing', impact: 28, effort: 20 },
  { category: 'Form Simplification', impact: 35, effort: 60 },
  { category: 'Progress Indicators', impact: 15, effort: 30 },
  { category: 'Mobile Optimization', impact: 42, effort: 80 },
  { category: 'Personalization', impact: 45, effort: 90 }
]

const industryEngagementData = [
  { name: 'Healthcare', value: 145, color: '#0088FE' },
  { name: 'Technology', value: 132, color: '#00C49F' },
  { name: 'Finance', value: 118, color: '#FFBB28' },
  { name: 'Education', value: 95, color: '#FF8042' },
  { name: 'Other', value: 87, color: '#8884D8' }
]

export function AIPoweredInsights() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const filteredInsights = mockInsights.filter(insight => {
    if (selectedCategory === 'all') return true
    return insight.category.toLowerCase() === selectedCategory.toLowerCase()
  })

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp
      case 'optimization': return Target
      case 'anomaly': return AlertTriangle
      case 'recommendation': return Lightbulb
      default: return Brain
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'viewed': return 'bg-gray-100 text-gray-800'
      case 'implemented': return 'bg-green-100 text-green-800'
      case 'dismissed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate AI analysis
    setTimeout(() => {
      setRefreshing(false)
    }, 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            AI-Powered Insights
          </h1>
          <p className="text-gray-600">
            Leverage artificial intelligence to optimize your onboarding processes and predict future trends.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Analyzing...' : 'Refresh Insights'}
          </Button>
        </div>
      </div>

      {/* AI Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Active Insights
            </CardTitle>
            <div className="text-2xl font-bold">{filteredInsights.filter(i => i.status === 'new').length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {filteredInsights.filter(i => i.status === 'implemented').length} implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Avg. Confidence
            </CardTitle>
            <div className="text-2xl font-bold">
              {Math.round(filteredInsights.reduce((sum, i) => sum + i.confidence, 0) / filteredInsights.length)}%
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {filteredInsights.filter(i => i.confidence > 90).length} high confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Predicted Impact
            </CardTitle>
            <div className="text-2xl font-bold">+23%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              If all recommendations implemented
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Model Accuracy
            </CardTitle>
            <div className="text-2xl font-bold">
              {Math.round(mockPredictiveModels.reduce((sum, m) => sum + m.accuracy, 0) / mockPredictiveModels.length)}%
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across {mockPredictiveModels.length} active models
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="personalization">Personalization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insights List */}
          <div className="space-y-6">
            {filteredInsights.map((insight) => {
              const InsightIcon = getInsightIcon(insight.type)
              
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <InsightIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} impact
                            </Badge>
                            <Badge className={getStatusColor(insight.status)}>
                              {insight.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {insight.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-600">
                          {insight.confidence}% confidence
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(insight.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Confidence Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>AI Confidence Level</span>
                          <span className="font-medium">{insight.confidence}%</span>
                        </div>
                        <Progress value={insight.confidence} className="h-2" />
                      </div>

                      {/* Action Items */}
                      {insight.action_items.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Recommended Actions:</h4>
                          <div className="space-y-2">
                            {insight.action_items.map((action) => (
                              <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{action.title}</div>
                                  <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                                </div>
                                <div className="flex items-center space-x-3 text-xs">
                                  <Badge variant="outline">{action.effort} effort</Badge>
                                  <div className="text-green-600 font-medium">{action.expected_impact}</div>
                                  <div className="text-gray-500">{action.implementation_time}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3 pt-2">
                        {insight.status === 'new' && (
                          <>
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Implement
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Mark as Viewed
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Feedback
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completion Rate Prediction Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Forecast</CardTitle>
                <CardDescription>
                  Predicted completion rates for the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={completionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Actual"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Predicted"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Industry Engagement Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Engagement Patterns</CardTitle>
                <CardDescription>
                  AI-identified engagement levels by industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={industryEngagementData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {industryEngagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Predictions List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Predictions</CardTitle>
              <CardDescription>
                Current AI predictions across all models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPredictiveModels.flatMap(model => 
                  model.predictions.map(prediction => ({
                    ...prediction,
                    model_name: model.name,
                    model_accuracy: model.accuracy
                  }))
                ).map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{prediction.metric}</h4>
                        <Badge variant="outline" className="text-xs">
                          {prediction.model_name}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div>Current: <span className="font-medium">{prediction.current_value}</span></div>
                        <ArrowRight className="h-4 w-4" />
                        <div>Predicted: <span className="font-medium">{prediction.predicted_value}</span></div>
                        <div>By: {formatDate(prediction.prediction_date)}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">
                        {prediction.confidence}% confidence
                      </div>
                      <div className="text-xs text-gray-500">
                        Model: {prediction.model_accuracy}% accurate
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Impact Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Impact vs Effort</CardTitle>
              <CardDescription>
                AI-recommended optimizations plotted by expected impact and implementation effort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={optimizationImpactData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impact" fill="#8884d8" name="Expected Impact %" />
                  <Bar dataKey="effort" fill="#82ca9d" name="Implementation Effort %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Wins */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Quick Wins
                </CardTitle>
                <CardDescription>
                  High impact, low effort optimizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Email Timing Optimization</div>
                      <div className="text-xs text-gray-600">Send emails at 10:30 AM on Tuesdays</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-medium text-sm">+28%</div>
                      <div className="text-xs text-gray-500">1 day</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Progress Indicators</div>
                      <div className="text-xs text-gray-600">Add visual progress bars to forms</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-medium text-sm">+15%</div>
                      <div className="text-xs text-gray-500">3-5 days</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  Strategic Improvements
                </CardTitle>
                <CardDescription>
                  High impact optimizations requiring more effort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Industry Personalization</div>
                      <div className="text-xs text-gray-600">Create healthcare-specific templates</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-600 font-medium text-sm">+45%</div>
                      <div className="text-xs text-gray-500">2-3 weeks</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Mobile Optimization</div>
                      <div className="text-xs text-gray-600">Redesign mobile interface</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-600 font-medium text-sm">+42%</div>
                      <div className="text-xs text-gray-500">3-4 weeks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockPredictiveModels.map((model) => (
              <Card key={model.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={
                      model.status === 'active' ? 'bg-green-100 text-green-800' :
                      model.status === 'training' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {model.status}
                    </Badge>
                  </div>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Model Accuracy</span>
                        <span className="font-medium">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Last Trained:</span>
                        <span>{formatDate(model.last_trained)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Active Predictions:</span>
                        <span>{model.predictions.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      {model.status === 'active' && (
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retrain
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}