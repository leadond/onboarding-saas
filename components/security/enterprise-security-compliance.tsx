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
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  Shield,
  Lock,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Database,
  Globe,
  FileText,
  Key,
  Activity,
  Settings,
  Zap,
  Bell,
  Search,
  Filter,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Server,
  Cloud,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react'

interface SecurityMetric {
  id: string
  name: string
  value: number
  target: number
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  description: string
}

interface ComplianceFramework {
  id: string
  name: string
  description: string
  status: 'compliant' | 'partial' | 'non-compliant' | 'in-progress'
  completion_percentage: number
  requirements: ComplianceRequirement[]
  last_audit: string
  next_audit: string
  certificate_url?: string
}

interface ComplianceRequirement {
  id: string
  title: string
  description: string
  status: 'compliant' | 'non-compliant' | 'in-progress'
  priority: 'high' | 'medium' | 'low'
  category: string
  evidence: string[]
  assigned_to: string
  due_date: string
}

interface SecurityEvent {
  id: string
  type: 'login' | 'data_access' | 'permission_change' | 'security_alert' | 'compliance_check'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  user_id?: string
  ip_address: string
  user_agent: string
  location: string
  timestamp: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  resolution?: string
}

interface DataPrivacyRequest {
  id: string
  type: 'access' | 'deletion' | 'portability' | 'rectification'
  requester_email: string
  requester_name: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  submitted_at: string
  completed_at?: string
  data_categories: string[]
  notes?: string
}

// Mock data
const mockSecurityMetrics: SecurityMetric[] = [
  {
    id: '1',
    name: 'Security Score',
    value: 94,
    target: 95,
    status: 'good',
    trend: 'up',
    description: 'Overall security posture score'
  },
  {
    id: '2',
    name: 'Failed Login Attempts',
    value: 23,
    target: 50,
    status: 'good',
    trend: 'down',
    description: 'Failed login attempts in last 24h'
  },
  {
    id: '3',
    name: '2FA Adoption',
    value: 87,
    target: 90,
    status: 'warning',
    trend: 'up',
    description: 'Percentage of users with 2FA enabled'
  },
  {
    id: '4',
    name: 'Data Encryption',
    value: 100,
    target: 100,
    status: 'good',
    trend: 'stable',
    description: 'Percentage of data encrypted at rest'
  }
]

const mockComplianceFrameworks: ComplianceFramework[] = [
  {
    id: '1',
    name: 'SOC 2 Type II',
    description: 'System and Organization Controls for security, availability, processing integrity, confidentiality, and privacy',
    status: 'compliant',
    completion_percentage: 100,
    last_audit: '2024-06-15T00:00:00Z',
    next_audit: '2025-06-15T00:00:00Z',
    certificate_url: '/certificates/soc2-type2-2024.pdf',
    requirements: [
      {
        id: 'r1',
        title: 'Access Controls',
        description: 'Implement logical and physical access controls',
        status: 'compliant',
        priority: 'high',
        category: 'Security',
        evidence: ['Access control policy', 'User access reviews', 'Physical security measures'],
        assigned_to: 'Security Team',
        due_date: '2024-12-31T00:00:00Z'
      },
      {
        id: 'r2',
        title: 'Data Encryption',
        description: 'Encrypt data in transit and at rest',
        status: 'compliant',
        priority: 'high',
        category: 'Security',
        evidence: ['Encryption implementation', 'Key management procedures'],
        assigned_to: 'DevOps Team',
        due_date: '2024-12-31T00:00:00Z'
      }
    ]
  },
  {
    id: '2',
    name: 'GDPR',
    description: 'General Data Protection Regulation for EU data protection and privacy',
    status: 'compliant',
    completion_percentage: 95,
    last_audit: '2024-07-01T00:00:00Z',
    next_audit: '2025-07-01T00:00:00Z',
    requirements: [
      {
        id: 'r3',
        title: 'Data Subject Rights',
        description: 'Implement processes for data subject access, deletion, and portability requests',
        status: 'compliant',
        priority: 'high',
        category: 'Privacy',
        evidence: ['Privacy policy', 'Data subject request procedures', 'Request tracking system'],
        assigned_to: 'Legal Team',
        due_date: '2024-12-31T00:00:00Z'
      },
      {
        id: 'r4',
        title: 'Data Processing Records',
        description: 'Maintain records of processing activities',
        status: 'in-progress',
        priority: 'medium',
        category: 'Privacy',
        evidence: ['Processing activity records'],
        assigned_to: 'Compliance Team',
        due_date: '2024-09-30T00:00:00Z'
      }
    ]
  },
  {
    id: '3',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act for healthcare data protection',
    status: 'in-progress',
    completion_percentage: 78,
    last_audit: '2024-05-01T00:00:00Z',
    next_audit: '2024-11-01T00:00:00Z',
    requirements: [
      {
        id: 'r5',
        title: 'Business Associate Agreements',
        description: 'Execute BAAs with all third-party vendors handling PHI',
        status: 'in-progress',
        priority: 'high',
        category: 'Legal',
        evidence: ['BAA templates', 'Signed agreements'],
        assigned_to: 'Legal Team',
        due_date: '2024-10-15T00:00:00Z'
      }
    ]
  },
  {
    id: '4',
    name: 'ISO 27001',
    description: 'International standard for information security management systems',
    status: 'partial',
    completion_percentage: 65,
    last_audit: '2024-04-01T00:00:00Z',
    next_audit: '2024-10-01T00:00:00Z',
    requirements: [
      {
        id: 'r6',
        title: 'Risk Assessment',
        description: 'Conduct comprehensive information security risk assessment',
        status: 'in-progress',
        priority: 'high',
        category: 'Risk Management',
        evidence: ['Risk assessment methodology', 'Risk register'],
        assigned_to: 'Security Team',
        due_date: '2024-09-15T00:00:00Z'
      }
    ]
  }
]

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'security_alert',
    severity: 'high',
    title: 'Multiple Failed Login Attempts',
    description: 'User attempted to login 15 times with incorrect credentials',
    user_id: 'user_123',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'New York, US',
    timestamp: '2024-08-15T02:30:00Z',
    status: 'investigating'
  },
  {
    id: '2',
    type: 'data_access',
    severity: 'medium',
    title: 'Bulk Data Export',
    description: 'User exported 500+ client records',
    user_id: 'user_456',
    ip_address: '10.0.0.50',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'San Francisco, US',
    timestamp: '2024-08-14T18:45:00Z',
    status: 'resolved',
    resolution: 'Legitimate business use confirmed'
  },
  {
    id: '3',
    type: 'permission_change',
    severity: 'medium',
    title: 'Admin Privileges Granted',
    description: 'User was granted administrator privileges',
    user_id: 'user_789',
    ip_address: '172.16.0.25',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    location: 'London, UK',
    timestamp: '2024-08-14T14:20:00Z',
    status: 'resolved',
    resolution: 'Approved by security team'
  }
]

const mockPrivacyRequests: DataPrivacyRequest[] = [
  {
    id: '1',
    type: 'deletion',
    requester_email: 'john.doe@example.com',
    requester_name: 'John Doe',
    status: 'processing',
    submitted_at: '2024-08-14T10:00:00Z',
    data_categories: ['Personal Information', 'Communication History', 'Usage Analytics'],
    notes: 'Customer requested full account deletion'
  },
  {
    id: '2',
    type: 'access',
    requester_email: 'jane.smith@example.com',
    requester_name: 'Jane Smith',
    status: 'completed',
    submitted_at: '2024-08-13T15:30:00Z',
    completed_at: '2024-08-14T09:15:00Z',
    data_categories: ['Personal Information', 'Account Settings'],
    notes: 'Data export provided via secure download link'
  },
  {
    id: '3',
    type: 'portability',
    requester_email: 'bob.johnson@example.com',
    requester_name: 'Bob Johnson',
    status: 'pending',
    submitted_at: '2024-08-15T08:20:00Z',
    data_categories: ['All Personal Data'],
    notes: 'Request for data portability to new service provider'
  }
]

export function EnterpriseSecurityCompliance() {
  const [selectedFramework, setSelectedFramework] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [showAuditDialog, setShowAuditDialog] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'good':
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'partial':
      case 'warning':
      case 'investigating':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'non-compliant':
      case 'critical':
      case 'open':
      case 'pending':
        return 'bg-red-100 text-red-800'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'good':
      case 'resolved':
      case 'completed':
        return CheckCircle
      case 'partial':
      case 'warning':
      case 'investigating':
      case 'processing':
        return AlertTriangle
      case 'non-compliant':
      case 'critical':
      case 'open':
      case 'pending':
        return XCircle
      case 'in-progress':
        return Clock
      default:
        return AlertCircle
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
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

  const filteredEvents = mockSecurityEvents.filter(event => {
    if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) return false
    return true
  })

  const overallComplianceScore = Math.round(
    mockComplianceFrameworks.reduce((sum, framework) => sum + framework.completion_percentage, 0) / 
    mockComplianceFrameworks.length
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="h-8 w-8 mr-3 text-blue-600" />
            Security & Compliance
          </h1>
          <p className="text-gray-600">
            Enterprise-grade security controls and compliance management for your organization.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Audit Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Compliance Audit Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive audit report for compliance frameworks.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Frameworks</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose frameworks to include" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Frameworks</SelectItem>
                      <SelectItem value="soc2">SOC 2 Type II</SelectItem>
                      <SelectItem value="gdpr">GDPR</SelectItem>
                      <SelectItem value="hipaa">HIPAA</SelectItem>
                      <SelectItem value="iso27001">ISO 27001</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Report Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
                  Cancel
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Security Score
            </CardTitle>
            <div className="text-2xl font-bold">{mockSecurityMetrics[0].value}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={mockSecurityMetrics[0].value} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              Target: {mockSecurityMetrics[0].target}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Compliance Score
            </CardTitle>
            <div className="text-2xl font-bold">{overallComplianceScore}%</div>
          </CardHeader>
          <CardContent>
            <Progress value={overallComplianceScore} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {mockComplianceFrameworks.filter(f => f.status === 'compliant').length} of {mockComplianceFrameworks.length} compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Active Alerts
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockSecurityEvents.filter(e => e.status === 'open' || e.status === 'investigating').length}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockSecurityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Privacy Requests
            </CardTitle>
            <div className="text-2xl font-bold">{mockPrivacyRequests.length}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockPrivacyRequests.filter(r => r.status === 'pending').length} pending review
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="security">Security Monitoring</TabsTrigger>
          <TabsTrigger value="privacy">Data Privacy</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Frameworks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockComplianceFrameworks.map((framework) => {
              const StatusIcon = getStatusIcon(framework.status)
              
              return (
                <Card key={framework.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{framework.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {framework.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(framework.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {framework.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Completion Progress</span>
                          <span className="font-medium">{framework.completion_percentage}%</span>
                        </div>
                        <Progress value={framework.completion_percentage} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Last Audit</div>
                          <div className="font-medium">{formatDate(framework.last_audit)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Next Audit</div>
                          <div className="font-medium">{formatDate(framework.next_audit)}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Requirements Status:</div>
                        <div className="space-y-1">
                          {framework.requirements.map((req) => {
                            const ReqStatusIcon = getStatusIcon(req.status)
                            return (
                              <div key={req.id} className="flex items-center justify-between text-xs">
                                <span className="flex items-center space-x-2">
                                  <ReqStatusIcon className="h-3 w-3" />
                                  <span>{req.title}</span>
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {req.priority}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {framework.certificate_url && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockSecurityMetrics.map((metric) => {
              const StatusIcon = getStatusIcon(metric.status)
              const TrendIcon = metric.trend === 'up' ? TrendingUp : 
                              metric.trend === 'down' ? TrendingUp : 
                              BarChart3
              
              return (
                <Card key={metric.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                      <span>{metric.name}</span>
                      <StatusIcon className={`h-4 w-4 ${
                        metric.status === 'good' ? 'text-green-600' :
                        metric.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <TrendIcon className={`h-4 w-4 ${
                        metric.trend === 'up' ? 'text-green-600' :
                        metric.trend === 'down' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-600">Target: {metric.target}</div>
                      <Progress 
                        value={Math.min((metric.value / metric.target) * 100, 100)} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Security Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Security Events
                  </CardTitle>
                  <CardDescription>Recent security events and alerts</CardDescription>
                </div>
                <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const StatusIcon = getStatusIcon(event.status)
                  
                  return (
                    <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">IP:</span> {event.ip_address}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {event.location}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {formatDateTime(event.timestamp)}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {event.type}
                          </div>
                        </div>
                        {event.resolution && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                            <strong>Resolution:</strong> {event.resolution}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        {event.status === 'open' && (
                          <Button size="sm">
                            Investigate
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          {/* Privacy Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Data Privacy Requests
              </CardTitle>
              <CardDescription>
                GDPR and other privacy regulation compliance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPrivacyRequests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status)
                  
                  return (
                    <div key={request.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium">{request.requester_name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {request.type}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.requester_email}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {request.data_categories.map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Submitted:</span> {formatDateTime(request.submitted_at)}
                          </div>
                          {request.completed_at && (
                            <div>
                              <span className="font-medium">Completed:</span> {formatDateTime(request.completed_at)}
                            </div>
                          )}
                        </div>
                        {request.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Notes:</strong> {request.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        {request.status === 'pending' && (
                          <Button size="sm">
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Configure data privacy and protection settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Retention Policy</Label>
                    <p className="text-sm text-gray-600">Automatically delete inactive user data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Cookie Consent</Label>
                    <p className="text-sm text-gray-600">Require explicit consent for non-essential cookies</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Processing Notifications</Label>
                    <p className="text-sm text-gray-600">Notify users of data processing activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Right to be Forgotten</Label>
                    <p className="text-sm text-gray-600">Enable automatic data deletion requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Audit Trail
              </CardTitle>
              <CardDescription>
                Comprehensive audit logs for compliance and security monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Audit logs will be displayed here</p>
                  <p className="text-sm">All user actions, system events, and data access are logged</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
