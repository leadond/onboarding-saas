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

import React from 'react'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Settings,
  MoreHorizontal,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  GitBranch,
  Mail,
  MessageSquare,
  CheckSquare,
  UserPlus,
  RefreshCw,
  Tag,
  Calendar,
  MessageCircle,
  Globe,
  Code,
  Search,
  Filter,
  TrendingUp,
  Users,
  Timer,
  Zap,
  ArrowRight,
  ArrowDown,
  Diamond,
  Square,
  Circle,
  Triangle,
  Move,
  Copy,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Database,
  Webhook,
  Cpu,
  Brain,
  Target,
  Layers,
  Link,
  Shuffle,
  RotateCcw,
  FastForward,
  Rewind,
  SkipForward,
  SkipBack
} from 'lucide-react'

// Enhanced workflow node types
interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'script' | 'webhook' | 'escalation'
  position: { x: number; y: number }
  data: {
    label: string
    description?: string
    config: Record<string, any>
    connections?: string[]
  }
  status?: 'active' | 'inactive' | 'error' | 'pending'
}

interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  condition?: string
  label?: string
}

interface AdvancedWorkflow {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  variables: Record<string, any>
  settings: {
    timeout: number
    retryAttempts: number
    errorHandling: 'stop' | 'continue' | 'retry'
    logging: boolean
    notifications: boolean
  }
  status: 'draft' | 'active' | 'paused' | 'archived'
  created_at: string
  updated_at: string
  stats: {
    totalRuns: number
    successRate: number
    avgRuntime: number
    lastRun?: string
  }
}

// Node type configurations
const NODE_TYPES = {
  trigger: {
    icon: Zap,
    color: 'bg-blue-500',
    label: 'Trigger',
    description: 'Start workflow when conditions are met'
  },
  action: {
    icon: Play,
    color: 'bg-green-500',
    label: 'Action',
    description: 'Perform an automated action'
  },
  condition: {
    icon: Diamond,
    color: 'bg-yellow-500',
    label: 'Condition',
    description: 'Branch workflow based on conditions'
  },
  delay: {
    icon: Timer,
    color: 'bg-purple-500',
    label: 'Delay',
    description: 'Wait for specified time'
  },
  script: {
    icon: Code,
    color: 'bg-gray-500',
    label: 'Script',
    description: 'Execute custom JavaScript code'
  },
  webhook: {
    icon: Webhook,
    color: 'bg-orange-500',
    label: 'Webhook',
    description: 'Send HTTP request to external service'
  },
  escalation: {
    icon: AlertCircle,
    color: 'bg-red-500',
    label: 'Escalation',
    description: 'Escalate to team member or manager'
  }
}

// Predefined action templates
const ACTION_TEMPLATES = {
  send_email: {
    name: 'Send Email',
    icon: Mail,
    config: {
      to: '{{ client.email }}',
      subject: 'Welcome to OnboardKit',
      template: 'welcome_email',
      delay: 0
    }
  },
  create_task: {
    name: 'Create Task',
    icon: CheckSquare,
    config: {
      title: 'Complete onboarding',
      assignee: '{{ workflow.creator }}',
      due_date: '{{ now + 7 days }}',
      priority: 'medium'
    }
  },
  assign_team_member: {
    name: 'Assign Team Member',
    icon: UserPlus,
    config: {
      criteria: 'workload',
      team: 'onboarding',
      notify: true
    }
  },
  send_notification: {
    name: 'Send Notification',
    icon: MessageCircle,
    config: {
      type: 'in_app',
      message: 'New client needs attention',
      recipients: ['managers']
    }
  },
  update_status: {
    name: 'Update Status',
    icon: RefreshCw,
    config: {
      field: 'onboarding_status',
      value: 'in_progress'
    }
  },
  add_tag: {
    name: 'Add Tag',
    icon: Tag,
    config: {
      tags: ['new_client', 'priority']
    }
  }
}

// Condition templates
const CONDITION_TEMPLATES = {
  client_type: {
    name: 'Client Type',
    field: 'client.type',
    operators: ['equals', 'not_equals', 'in', 'not_in'],
    values: ['individual', 'business', 'enterprise']
  },
  completion_rate: {
    name: 'Completion Rate',
    field: 'kit.completion_rate',
    operators: ['greater_than', 'less_than', 'equals'],
    values: []
  },
  time_since_signup: {
    name: 'Time Since Signup',
    field: 'client.created_at',
    operators: ['greater_than', 'less_than'],
    values: ['1 hour', '1 day', '1 week', '1 month']
  },
  team_workload: {
    name: 'Team Workload',
    field: 'team.active_clients',
    operators: ['greater_than', 'less_than'],
    values: []
  }
}

export function AdvancedWorkflowBuilder() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<AdvancedWorkflow | null>(null)
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<WorkflowConnection[]>([])
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null)
  const [workflowVariables, setWorkflowVariables] = useState<Record<string, any>>({})
  const [isTestMode, setIsTestMode] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  // Mock workflows data
  const [workflows, setWorkflows] = useState<AdvancedWorkflow[]>([
    {
      id: '1',
      name: 'Advanced Client Onboarding',
      description: 'Intelligent onboarding with conditional logic and escalation',
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          position: { x: 100, y: 100 },
          data: {
            label: 'Client Signed Up',
            config: { event: 'client_signup' }
          }
        },
        {
          id: 'condition-1',
          type: 'condition',
          position: { x: 300, y: 100 },
          data: {
            label: 'Check Client Type',
            config: {
              field: 'client.type',
              operator: 'equals',
              value: 'enterprise'
            }
          }
        },
        {
          id: 'action-1',
          type: 'action',
          position: { x: 500, y: 50 },
          data: {
            label: 'Assign Enterprise Manager',
            config: {
              type: 'assign_team_member',
              team: 'enterprise',
              notify: true
            }
          }
        },
        {
          id: 'action-2',
          type: 'action',
          position: { x: 500, y: 150 },
          data: {
            label: 'Send Standard Welcome',
            config: {
              type: 'send_email',
              template: 'standard_welcome'
            }
          }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'trigger-1',
          target: 'condition-1'
        },
        {
          id: 'conn-2',
          source: 'condition-1',
          target: 'action-1',
          condition: 'true',
          label: 'Enterprise'
        },
        {
          id: 'conn-3',
          source: 'condition-1',
          target: 'action-2',
          condition: 'false',
          label: 'Standard'
        }
      ],
      variables: {
        enterprise_threshold: 10000,
        standard_delay: 24,
        escalation_timeout: 72
      },
      settings: {
        timeout: 3600,
        retryAttempts: 3,
        errorHandling: 'retry',
        logging: true,
        notifications: true
      },
      status: 'active',
      created_at: '2024-08-14T10:00:00Z',
      updated_at: '2024-08-14T15:30:00Z',
      stats: {
        totalRuns: 156,
        successRate: 94.2,
        avgRuntime: 45,
        lastRun: '2024-08-14T14:22:00Z'
      }
    },
    {
      id: '2',
      name: 'Escalation & Recovery Workflow',
      description: 'Automated escalation for stalled onboarding processes',
      nodes: [],
      connections: [],
      variables: {},
      settings: {
        timeout: 7200,
        retryAttempts: 5,
        errorHandling: 'continue',
        logging: true,
        notifications: true
      },
      status: 'draft',
      created_at: '2024-08-13T09:00:00Z',
      updated_at: '2024-08-13T16:45:00Z',
      stats: {
        totalRuns: 0,
        successRate: 0,
        avgRuntime: 0
      }
    }
  ])

  const createNewWorkflow = () => {
    const newWorkflow: AdvancedWorkflow = {
      id: Date.now().toString(),
      name: 'New Workflow',
      description: 'Describe your workflow...',
      nodes: [],
      connections: [],
      variables: {},
      settings: {
        timeout: 3600,
        retryAttempts: 3,
        errorHandling: 'stop',
        logging: true,
        notifications: false
      },
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        totalRuns: 0,
        successRate: 0,
        avgRuntime: 0
      }
    }
    setWorkflows([...workflows, newWorkflow])
    setSelectedWorkflow(newWorkflow)
    setIsBuilderOpen(true)
  }

  const openWorkflowBuilder = (workflow: AdvancedWorkflow) => {
    setSelectedWorkflow(workflow)
    setNodes(workflow.nodes)
    setConnections(workflow.connections)
    setWorkflowVariables(workflow.variables)
    setIsBuilderOpen(true)
  }

  const saveWorkflow = () => {
    if (!selectedWorkflow) return
    
    const updatedWorkflow = {
      ...selectedWorkflow,
      nodes,
      connections,
      variables: workflowVariables,
      updated_at: new Date().toISOString()
    }
    
    setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w))
    setSelectedWorkflow(updatedWorkflow)
  }

  const addNode = (type: string, position: { x: number; y: number }) => {
    const nodeConfig = NODE_TYPES[type as keyof typeof NODE_TYPES]
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type: type as WorkflowNode['type'],
      position,
      data: {
        label: nodeConfig.label,
        description: nodeConfig.description,
        config: {}
      }
    }
    setNodes([...nodes, newNode])
  }

  const updateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ))
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId))
    setConnections(connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ))
  }

  const connectNodes = (sourceId: string, targetId: string) => {
    const newConnection: WorkflowConnection = {
      id: `conn-${Date.now()}`,
      source: sourceId,
      target: targetId
    }
    setConnections([...connections, newConnection])
  }

  const testWorkflow = async () => {
    setIsTestMode(true)
    // Simulate workflow execution
    const results = []
    for (const node of nodes) {
      await new Promise(resolve => setTimeout(resolve, 500))
      results.push({
        nodeId: node.id,
        status: Math.random() > 0.1 ? 'success' : 'error',
        message: `Executed ${node.data.label}`,
        timestamp: new Date().toISOString()
      })
    }
    setTestResults(results)
    setIsTestMode(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Workflow className="h-6 w-6" />
            Advanced Workflow Builder
          </h1>
          <p className="text-muted-foreground">
            Create intelligent automation workflows with conditional logic and custom scripting
          </p>
        </div>
        <Button onClick={createNewWorkflow}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                    {workflow.status}
                  </Badge>
                  <Badge variant="outline">
                    {workflow.nodes.length} nodes
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openWorkflowBuilder(workflow)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Play className="h-4 w-4 mr-2" />
                      Test Run
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{workflow.stats.totalRuns}</div>
                    <div className="text-muted-foreground">Total Runs</div>
                  </div>
                  <div>
                    <div className="font-medium">{workflow.stats.successRate}%</div>
                    <div className="text-muted-foreground">Success Rate</div>
                  </div>
                  <div>
                    <div className="font-medium">{workflow.stats.avgRuntime}s</div>
                    <div className="text-muted-foreground">Avg Runtime</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    className="text-xs" 
                    variant="outline" 
                    onClick={() => openWorkflowBuilder(workflow)}
                    
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button className="text-xs" variant="outline">
                    {workflow.status === 'active' ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced Workflow Builder Dialog */}
      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              {selectedWorkflow?.name || 'New Workflow'}
            </DialogTitle>
            <DialogDescription>
              Build advanced automation workflows with conditional logic and custom actions
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex gap-4 min-h-0">
            {/* Node Palette */}
            <div className="w-64 border-r pr-4 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Node Types</h3>
                <div className="space-y-2">
                  {Object.entries(NODE_TYPES).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <TooltipProvider key={type}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${config.color} text-white`}
                              draggable
                              onDragStart={() => setDraggedNodeType(type)}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{config.label}</span>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{config.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>

              {/* Action Templates */}
              <div>
                <h3 className="font-medium mb-2">Action Templates</h3>
                <div className="space-y-1">
                  {Object.entries(ACTION_TEMPLATES).map(([key, template]) => {
                    const Icon = template.icon
                    return (
                      <div
                        key={key}
                        className="p-2 rounded border cursor-pointer hover:bg-muted text-sm flex items-center gap-2"
                      >
                        <Icon className="h-3 w-3" />
                        {template.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button className="text-xs" onClick={saveWorkflow}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button className="text-xs" variant="outline" onClick={testWorkflow} disabled={isTestMode}>
                    {isTestMode ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Test Workflow
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{nodes.length} nodes</Badge>
                  <Badge variant="outline">{connections.length} connections</Badge>
                </div>
              </div>

              {/* Canvas Area */}
              <div 
                className="flex-1 border rounded-lg bg-muted/20 relative overflow-auto"
                onDrop={(e) => {
                  e.preventDefault()
                  if (draggedNodeType) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const position = {
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    }
                    addNode(draggedNodeType, position)
                    setDraggedNodeType(null)
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Connections */}
                <svg className="absolute inset-0 pointer-events-none">
                  {connections.map((connection) => {
                    const sourceNode = nodes.find(n => n.id === connection.source)
                    const targetNode = nodes.find(n => n.id === connection.target)
                    if (!sourceNode || !targetNode) return null

                    const x1 = sourceNode.position.x + 100
                    const y1 = sourceNode.position.y + 25
                    const x2 = targetNode.position.x
                    const y2 = targetNode.position.y + 25

                    return (
                      <g key={connection.id}>
                        <path
                          d={`M ${x1} ${y1} C ${x1 + 50} ${y1} ${x2 - 50} ${y2} ${x2} ${y2}`}
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          className="text-muted-foreground"
                        />
                        <circle cx={x2} cy={y2} r="4" fill="currentColor" className="text-muted-foreground" />
                        {connection.label && (
                          <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 - 10}
                            textAnchor="middle"
                            className="text-xs fill-current text-muted-foreground"
                          >
                            {connection.label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => {
                  const nodeConfig = NODE_TYPES[node.type]
                  const Icon = nodeConfig.icon
                  return (
                    <div
                      key={node.id}
                      className={`absolute w-48 p-3 bg-white border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                        selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y
                      }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded ${nodeConfig.color} text-white`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium">{node.data.label}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="text-xs ml-auto h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteNode(node.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {node.data.description && (
                        <p className="text-xs text-muted-foreground">{node.data.description}</p>
                      )}
                      {node.status && (
                        <Badge className="text-xs mt-2" variant={node.status === 'active' ? 'default' : 'secondary'}>
                          {node.status}
                        </Badge>
                      )}
                    </div>
                  )
                })}

                {/* Empty State */}
                {nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Start Building Your Workflow</h3>
                      <p className="text-sm">Drag and drop nodes from the palette to create your automation workflow</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Properties Panel */}
            {selectedNode && (
              <div className="w-80 border-l pl-4 space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Node Properties</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="node-label">Label</Label>
                      <Input
                        id="node-label"
                        value={selectedNode.data.label}
                        onChange={(e) => updateNode(selectedNode.id, {
                          data: { ...selectedNode.data, label: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="node-description">Description</Label>
                      <Textarea
                        id="node-description"
                        value={selectedNode.data.description || ''}
                        onChange={(e) => updateNode(selectedNode.id, {
                          data: { ...selectedNode.data, description: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Node-specific configuration */}
                {selectedNode.type === 'condition' && (
                  <div>
                    <h4 className="font-medium mb-2">Condition Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Field</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CONDITION_TEMPLATES).map(([key, template]) => (
                              <SelectItem key={key} value={key}>{template.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Operator</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input placeholder="Enter value" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedNode.type === 'script' && (
                  <div>
                    <h4 className="font-medium mb-2">Custom Script</h4>
                    <Textarea
                      placeholder="// Enter JavaScript code here
// Available variables: client, workflow, context
console.log('Executing custom script');
return { success: true };"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {selectedNode.type === 'delay' && (
                  <div>
                    <h4 className="font-medium mb-2">Delay Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Duration</Label>
                        <div className="flex gap-2">
                          <Input type="number" placeholder="1" className="flex-1" />
                          <Select>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="weeks">Weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Test Results</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{result.message}</span>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
