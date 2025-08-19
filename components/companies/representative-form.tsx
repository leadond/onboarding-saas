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
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { useCompanyRepresentatives } from '@/lib/hooks/use-companies'

const representativeSchema = z.object({
  first_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  full_name: z.string().max(255).optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  mobile_phone: z.string().max(50).optional().nullable(),
  job_title: z.string().max(150).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  role: z.string().max(100).optional().nullable(),
  preferred_contact_method: z.enum(['email', 'phone', 'mobile', 'video_call']).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  availability: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  is_primary: z.boolean().default(false),
  can_approve: z.boolean().default(false),
  can_view_pricing: z.boolean().default(false),
  notes: z.string().optional().nullable(),
})

type RepresentativeFormData = z.infer<typeof representativeSchema>

interface RepresentativeFormProps {
  companyId: string
  representativeId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function RepresentativeForm({ companyId, representativeId, onSuccess, onCancel }: RepresentativeFormProps) {
  const [formData, setFormData] = useState<RepresentativeFormData>({
    first_name: null,
    last_name: null,
    full_name: null,
    email: null,
    phone: null,
    mobile_phone: null,
    job_title: null,
    department: null,
    role: null,
    preferred_contact_method: null,
    timezone: null,
    availability: null,
    status: 'active',
    is_primary: false,
    can_approve: false,
    can_view_pricing: false,
    notes: null,
  })
  const [loading, setLoading] = useState(false)
  const { createRepresentative, updateRepresentative } = useCompanyRepresentatives(companyId)
  const { toast } = useToast()

  const handleChange = (field: keyof RepresentativeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data
      const validatedData = representativeSchema.parse(formData)
      
      // Create or update representative
      if (representativeId) {
        await updateRepresentative(representativeId, validatedData)
        toast({
          title: 'Success',
          description: 'Representative updated successfully',
        })
      } else {
        await createRepresentative(validatedData as any) // Type assertion to match expected type
        toast({
          title: 'Success',
          description: 'Representative created successfully',
        })
      }
      
      // Call success callback
      onSuccess?.()
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save representative',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name || ''}
            onChange={(e) => handleChange('first_name', e.target.value)}
            placeholder="Enter first name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name || ''}
            onChange={(e) => handleChange('last_name', e.target.value)}
            placeholder="Enter last name"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name || ''}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Enter full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
            type="email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter phone number"
            type="tel"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mobile_phone">Mobile Phone</Label>
          <Input
            id="mobile_phone"
            value={formData.mobile_phone || ''}
            onChange={(e) => handleChange('mobile_phone', e.target.value)}
            placeholder="Enter mobile number"
            type="tel"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title</Label>
          <Input
            id="job_title"
            value={formData.job_title || ''}
            onChange={(e) => handleChange('job_title', e.target.value)}
            placeholder="Enter job title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            value={formData.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="Enter department"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role || ''}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="Enter role"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
          <Select 
            value={formData.preferred_contact_method || ''} 
            onValueChange={(value) => handleChange('preferred_contact_method', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="video_call">Video Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            value={formData.timezone || ''}
            onChange={(e) => handleChange('timezone', e.target.value)}
            placeholder="Enter timezone"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="availability">Availability</Label>
          <Textarea
            id="availability"
            value={formData.availability || ''}
            onChange={(e) => handleChange('availability', e.target.value)}
            placeholder="Enter availability information"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: any) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary"
              checked={formData.is_primary}
              onCheckedChange={(checked) => handleChange('is_primary', checked)}
            />
            <Label htmlFor="is_primary">Primary Contact</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can_approve"
              checked={formData.can_approve}
              onCheckedChange={(checked) => handleChange('can_approve', checked)}
            />
            <Label htmlFor="can_approve">Can Approve Contracts</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can_view_pricing"
              checked={formData.can_view_pricing}
              onCheckedChange={(checked) => handleChange('can_view_pricing', checked)}
            />
            <Label htmlFor="can_view_pricing">Can View Pricing</Label>
          </div>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Enter any additional notes"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : representativeId ? 'Update Representative' : 'Create Representative'}
        </Button>
      </div>
    </form>
  )
}