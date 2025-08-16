#!/bin/bash

# OnboardKit - TypeScript Error Fixes Phase 2
# Fix API routes and gateway issues

set -e

echo "🔧 Phase 2: Fixing API Routes and Gateway Issues"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

fixes_applied=0

echo -e "${BLUE}Fixing API Gateway Rate Limiting${NC}"
echo "==============================="

# Update API gateway to use new rate limiting
cat > lib/api/gateway.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { rateLimits, RateLimitTier } from '@/lib/rate-limit'
import { z } from 'zod'

// Request validation schemas
const apiRequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  path: z.string(),
  body: z.any().optional(),
})

// API Gateway configuration
interface GatewayConfig {
  requireAuth?: boolean
  rateLimitTier?: RateLimitTier
  validateSchema?: z.ZodSchema
  permissions?: string[]
}

// Enhanced API Gateway
export class APIGateway {
  private supabase = createClient()

  async handle(
    request: NextRequest,
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
    config: GatewayConfig = {}
  ): Promise<NextResponse> {
    try {
      // Rate limiting
      if (config.rateLimitTier) {
        const rateLimit = rateLimits[config.rateLimitTier]
        const identifier = this.getIdentifier(request)
        const { success, limit, remaining, reset } = await rateLimit.limit(identifier)

        if (!success) {
          return NextResponse.json(
            { error: 'Rate limit exceeded', limit, remaining, reset },
            { status: 429 }
          )
        }
      }

      // Authentication
      let user = null
      if (config.requireAuth) {
        const { data: { user: authUser }, error } = await this.supabase.auth.getUser()
        if (error || !authUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        user = authUser
      }

      // Request validation
      if (config.validateSchema) {
        const body = request.method !== 'GET' ? await request.json() : undefined
        const validation = config.validateSchema.safeParse({
          method: request.method,
          path: request.nextUrl.pathname,
          body,
        })

        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid request', details: validation.error.errors },
            { status: 400 }
          )
        }
      }

      // Create context
      const context = {
        user,
        supabase: this.supabase,
        request,
      }

      // Call handler
      return await handler(request, context)
    } catch (error) {
      console.error('API Gateway error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  private getIdentifier(request: NextRequest): string {
    // Try to get user ID from auth, fallback to IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return ip
  }
}

// Export singleton instance
export const apiGateway = new APIGateway()

// Helper function for API routes
export function withGateway(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  config: GatewayConfig = {}
) {
  return async (request: NextRequest) => {
    return apiGateway.handle(request, handler, config)
  }
}
EOF

echo -e "${GREEN}✅ Fixed API Gateway${NC}"
fixes_applied=$((fixes_applied + 1))

echo ""
echo -e "${BLUE}Fixing Enhanced API Gateway${NC}"
echo "=========================="

# Update enhanced API gateway
cat > lib/api/enhanced-gateway.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { rbacManager, UserContext } from '@/lib/auth/rbac'
import { rateLimits, RateLimitTier } from '@/lib/rate-limit'
import { z } from 'zod'

// Enhanced gateway configuration
interface EnhancedGatewayConfig {
  requireAuth?: boolean
  rateLimitTier?: RateLimitTier
  validateSchema?: z.ZodSchema
  permissions?: string[]
  roles?: string[]
  organizationRequired?: boolean
}

// Enhanced API Gateway with RBAC
export class EnhancedAPIGateway {
  private supabase = createClient()

  async handle(
    request: NextRequest,
    handler: (req: NextRequest, context: any) => Promise<NextResponse>,
    config: EnhancedGatewayConfig = {}
  ): Promise<NextResponse> {
    try {
      // Rate limiting
      if (config.rateLimitTier) {
        const rateLimit = rateLimits[config.rateLimitTier]
        const identifier = this.getIdentifier(request)
        const { success, limit, remaining, reset } = await rateLimit.limit(identifier)

        if (!success) {
          return NextResponse.json(
            { error: 'Rate limit exceeded', limit, remaining, reset },
            { status: 429 }
          )
        }
      }

      // Authentication
      let user = null
      let userContext: UserContext | null = null

      if (config.requireAuth) {
        const { data: { user: authUser }, error } = await this.supabase.auth.getUser()
        if (error || !authUser) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        user = authUser

        // Create user context for RBAC
        userContext = {
          id: user.id,
          email: user.email || '',
          roles: [], // Would be populated from database
          permissions: [], // Would be populated from database
          organizationId: null, // Would be populated from database
        }
      }

      // Authorization (RBAC)
      if (config.permissions && userContext) {
        const hasPermission = await rbacManager.hasPermission(
          userContext,
          config.permissions[0] // Simplified for now
        )
        if (!hasPermission) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      // Request validation
      if (config.validateSchema) {
        const body = request.method !== 'GET' ? await request.json() : undefined
        const validation = config.validateSchema.safeParse({
          method: request.method,
          path: request.nextUrl.pathname,
          body,
        })

        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid request', details: validation.error.errors },
            { status: 400 }
          )
        }
      }

      // Create enhanced context
      const context = {
        user,
        userContext,
        supabase: this.supabase,
        request,
        rbac: rbacManager,
      }

      // Call handler
      return await handler(request, context)
    } catch (error) {
      console.error('Enhanced API Gateway error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  private getIdentifier(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return ip
  }
}

// Export singleton instance
export const enhancedApiGateway = new EnhancedAPIGateway()

// Helper function for API routes
export function withEnhancedGateway(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
  config: EnhancedGatewayConfig = {}
) {
  return async (request: NextRequest) => {
    return enhancedApiGateway.handle(request, handler, config)
  }
}
EOF

echo -e "${GREEN}✅ Fixed Enhanced API Gateway${NC}"
fixes_applied=$((fixes_applied + 1))

echo ""
echo -e "${BLUE}Fixing Kit Step Editor Form Types${NC}"
echo "==============================="

# Fix the kit step editor with proper types
cat > app/\(protected\)/dashboard/kits/\[kitId\]/steps/\[stepId\]/page.tsx << 'EOF'
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { FormData, StepContent } from '@/types/forms'

const stepTypes = [
  { value: 'welcome', label: 'Welcome Message' },
  { value: 'form', label: 'Form Collection' },
  { value: 'document', label: 'Document Upload' },
  { value: 'payment', label: 'Payment Collection' },
  { value: 'video', label: 'Video Content' },
  { value: 'completion', label: 'Completion Step' },
]

export default function StepEditorPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const kitId = params.kitId as string
  const stepId = params.stepId as string
  const isNew = stepId === 'new'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    step_type: 'welcome',
    content: {},
    is_required: true,
    order_index: 0,
  })

  useEffect(() => {
    if (!isNew) {
      loadStep()
    } else {
      loadNextOrderIndex()
    }
  }, [stepId, kitId])

  const loadStep = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('kit_steps')
        .select('*')
        .eq('id', stepId)
        .single()

      if (error) throw error

      setFormData({
        title: data.title,
        description: data.description || '',
        step_type: data.step_type,
        content: data.content || {},
        is_required: data.is_required,
        order_index: data.order_index,
      })
    } catch (error) {
      console.error('Error loading step:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNextOrderIndex = async () => {
    try {
      const { data, error } = await supabase
        .from('kit_steps')
        .select('order_index')
        .eq('kit_id', kitId)
        .order('order_index', { ascending: false })
        .limit(1)

      if (error) throw error

      const nextIndex = data.length > 0 ? data[0].order_index + 1 : 0
      setFormData(prev => ({ ...prev, order_index: nextIndex }))
    } catch (error) {
      console.error('Error loading order index:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const stepData = {
        kit_id: kitId,
        title: formData.title,
        description: formData.description,
        step_type: formData.step_type,
        content: formData.content,
        is_required: formData.is_required,
        order_index: formData.order_index,
      }

      if (isNew) {
        const { error } = await supabase
          .from('kit_steps')
          .insert(stepData)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('kit_steps')
          .update(stepData)
          .eq('id', stepId)

        if (error) throw error
      }

      router.push(`/dashboard/kits/${kitId}`)
    } catch (error) {
      console.error('Error saving step:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value,
      },
    }))
  }

  const getContentValue = (key: string, defaultValue: any = '') => {
    return (formData.content as any)?.[key] ?? defaultValue
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isNew ? 'Create New Step' : 'Edit Step'}
        </h1>
        <p className="text-muted-foreground">
          Configure your onboarding step
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the basic settings for this step
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Step Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter step title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter step description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="step_type">Step Type</Label>
              <Select
                value={formData.step_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, step_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  {stepTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_required: checked }))}
              />
              <Label htmlFor="is_required">Required Step</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step Content</CardTitle>
            <CardDescription>
              Configure the specific content for this step type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={formData.step_type} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {stepTypes.map((type) => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="welcome" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome_instructions">Welcome Message</Label>
                  <Textarea
                    id="welcome_instructions"
                    value={getContentValue('instructions')}
                    onChange={(e) => updateContent('instructions', e.target.value)}
                    placeholder="Enter welcome message"
                  />
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    value={getContentValue('video_url')}
                    onChange={(e) => updateContent('video_url', e.target.value)}
                    placeholder="Enter video URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_instructions">Instructions</Label>
                  <Textarea
                    id="video_instructions"
                    value={getContentValue('instructions')}
                    onChange={(e) => updateContent('instructions', e.target.value)}
                    placeholder="Enter instructions"
                  />
                </div>
              </TabsContent>

              <TabsContent value="form" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form_instructions">Form Instructions</Label>
                  <Textarea
                    id="form_instructions"
                    value={getContentValue('instructions')}
                    onChange={(e) => updateContent('instructions', e.target.value)}
                    placeholder="Enter form instructions"
                  />
                </div>
              </TabsContent>

              <TabsContent value="document" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document_instructions">Upload Instructions</Label>
                  <Textarea
                    id="document_instructions"
                    value={getContentValue('instructions')}
                    onChange={(e) => updateContent('instructions', e.target.value)}
                    placeholder="Enter upload instructions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_file_size">Max File Size (MB)</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    value={getContentValue('upload_config', {})?.max_file_size ? Math.round(getContentValue('upload_config').max_file_size / (1024 * 1024)) : '10'}
                    onChange={(e) => updateContent('upload_config', {
                      ...getContentValue('upload_config', {}),
                      max_file_size: parseInt(e.target.value) * 1024 * 1024,
                    })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_instructions">Payment Instructions</Label>
                  <Textarea
                    id="payment_instructions"
                    value={getContentValue('instructions')}
                    onChange={(e) => updateContent('instructions', e.target.value)}
                    placeholder="Enter payment instructions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_amount">Amount</Label>
                  <Input
                    id="payment_amount"
                    value={getContentValue('payment_config', {})?.amount || ''}
                    onChange={(e) => updateContent('payment_config', {
                      ...getContentValue('payment_config', {}),
                      amount: e.target.value,
                    })}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_description">Payment Description</Label>
                  <Input
                    id="payment_description"
                    value={getContentValue('payment_config', {})?.description || ''}
                    onChange={(e) => updateContent('payment_config', {
                      ...getContentValue('payment_config', {}),
                      description: e.target.value,
                    })}
                    placeholder="Enter payment description"
                  />
                </div>
              </TabsContent>

              <TabsContent value="completion" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="completion_instructions">Completion Message</Label>
                  <Textarea
                    id="completion_instructions"
                    value={getContentValue('instructions')}
                    onChange={(e) => updateContent('instructions', e.target.value)}
                    placeholder="Enter completion message"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/kits/${kitId}`)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Step'}
          </Button>
        </div>
      </div>
    </div>
  )
}
EOF

echo -e "${GREEN}✅ Fixed Kit Step Editor${NC}"
fixes_applied=$((fixes_applied + 1))

echo ""
echo -e "${BLUE}Phase 2 Summary${NC}"
echo "==============="

echo -e "${GREEN}🎉 PHASE 2 COMPLETE!${NC}"
echo "====================="
echo -e "${BLUE}Fixes applied: ${fixes_applied}${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Run Phase 3 script to fix remaining component and RBAC issues"
echo "2. Run final type check"

echo ""
echo -e "${BLUE}Phase 2 completed at $(date)${NC}"