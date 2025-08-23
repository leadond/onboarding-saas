'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  GripVertical,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Shield,
  BookOpen,
  Award,
  Info,
  Users
} from 'lucide-react'

interface Kit {
  id: string
  title: string
  name: string
  description?: string
  is_published: boolean
  status: string
  created_at: string
  configuration?: {
    steps: KitStep[]
  }
}

interface KitStep {
  id: string
  title: string
  description: string
  type: string
  order: number
}

interface Assignment {
  id: string
  company_name: string
  assigned_at: string
  is_active: boolean
}

export default function KitDetailPage({ params }: { params: Promise<{ kitId: string }> }) {
  const { kitId } = React.use(params)
  const [kit, setKit] = useState<Kit | null>(null)
  const [steps, setSteps] = useState<KitStep[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchKitData = async () => {
      try {
        const [kitRes, assignmentsRes] = await Promise.all([
          fetch(`/api/kits/${kitId}`),
          fetch(`/api/kits/${kitId}/assignments`)
        ])

        if (kitRes.ok) {
          const kitData = await kitRes.json()
          setKit(kitData.data)
          // Extract steps from configuration
          const kitSteps = kitData.data?.configuration?.steps || []
          setSteps(kitSteps)
        }

        if (assignmentsRes.ok) {
          const assignmentsData = await assignmentsRes.json()
          setAssignments(assignmentsData.data || [])
        }
      } catch (err) {
        setError('Failed to load kit data')
      } finally {
        setLoading(false)
      }
    }

    fetchKitData()
  }, [kitId])

  const handlePublishToggle = async () => {
    if (!kit) return

    setPublishing(true)
    try {
      const newStatus = kit.status === 'published' ? 'draft' : 'published'
      const response = await fetch(`/api/kits/${kitId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setKit(prev => prev ? { ...prev, status: newStatus, is_published: newStatus === 'published' } : null)
      } else {
        setError('Failed to update kit status')
      }
    } catch (err) {
      setError('Failed to update kit status')
    } finally {
      setPublishing(false)
    }
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'information':
        return <Info className="w-4 h-4" />
      case 'form':
        return <FileText className="w-4 h-4" />
      case 'file_upload':
        return <Upload className="w-4 h-4" />
      case 'review':
      case 'screening':
        return <Shield className="w-4 h-4" />
      case 'configuration':
      case 'integration':
        return <Settings className="w-4 h-4" />
      case 'tutorial':
      case 'training':
        return <BookOpen className="w-4 h-4" />
      case 'completion':
        return <Award className="w-4 h-4" />
      case 'verification':
        return <Shield className="w-4 h-4" />
      case 'action':
        return <Users className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (!kit) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Kit Not Found</h1>
          <p className="text-gray-600 mt-2">The requested kit could not be found.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/kits">Back to Kits</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{kit.name || kit.title}</h1>
            <Badge variant={kit.status === 'published' ? 'default' : 'secondary'}>
              {kit.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">{kit.description || 'No description provided'}</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={kit.status === 'published' ? 'outline' : 'default'}
            onClick={handlePublishToggle}
            disabled={publishing}
          >
            {publishing ? 'Updating...' : kit.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/kit/${kit.id}`} target="_blank">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/kits/${kit.id}/assign`}>Assign to Company</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/kits/${kit.id}/edit`}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Steps Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Onboarding Steps</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage the steps in your onboarding workflow
                  </p>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/kits/${kit.id}/steps/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {steps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No steps yet</h3>
                  <p className="text-gray-600 mb-4">
                    Add your first step to start building your onboarding workflow.
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/kits/${kit.id}/steps/new`}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Step
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-shrink-0 text-gray-600">
                        {getStepIcon(step.type)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{step.title}</h4>
                        <p className="text-sm text-gray-600 truncate">{step.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {step.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/dashboard/kits/${kit.id}/steps/${step.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kit Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Kit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={kit.status === 'published' ? 'default' : 'secondary'}>
                    {kit.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Steps</label>
                <p className="mt-1 text-sm text-gray-900">{steps.length} steps</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(kit.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xl">🏢</span>
                  </div>
                  <p className="text-gray-600 mb-4">No company assignments yet</p>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/kits/${kit.id}/assign`}>Assign to Company</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{assignment.company_name}</p>
                        <p className="text-sm text-gray-600">
                          Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                        {assignment.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}