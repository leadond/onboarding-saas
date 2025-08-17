'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useCompanies } from '@/lib/hooks/use-companies'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legal_name: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website_url: z.string().url('Invalid URL').optional().nullable(),
  industry: z.string().optional().nullable(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']).optional().nullable(),
  founded_year: z.number().int().min(1800).max(2100).optional().nullable(),
  employee_count: z.number().int().min(0).optional().nullable(),
  street_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state_province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable(),
  support_email: z.string().email('Invalid email').optional().nullable(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  companyId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function CompanyForm({ companyId, onSuccess, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    legal_name: null,
    description: null,
    website_url: null,
    industry: null,
    company_size: null,
    founded_year: null,
    employee_count: null,
    street_address: null,
    city: null,
    state_province: null,
    postal_code: null,
    country: null,
    phone: null,
    email: null,
    support_email: null,
  })
  const [loading, setLoading] = useState(false)
  const { createCompany, updateCompany } = useCompanies()
  const { toast } = useToast()

  // Load company data if editing
  useEffect(() => {
    // In a real implementation, you would fetch the company data here
    // For now, we'll just leave the form empty for new companies
  }, [companyId])

  const handleChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form data
      const validatedData = companySchema.parse(formData)
      
      // Ensure name is provided
      if (!validatedData.name) {
        toast({
          title: 'Validation Error',
          description: 'Company name is required',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }
      
      // Create or update company
      if (companyId) {
        await updateCompany(companyId, validatedData)
        toast({
          title: 'Success',
          description: 'Company updated successfully',
        })
      } else {
        await createCompany(validatedData as any) // Type assertion to match expected type
        toast({
          title: 'Success',
          description: 'Company created successfully',
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
          description: 'Failed to save company',
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
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="legal_name">Legal Name</Label>
          <Input
            id="legal_name"
            value={formData.legal_name || ''}
            onChange={(e) => handleChange('legal_name', e.target.value)}
            placeholder="Enter legal name"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter company description"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL</Label>
          <Input
            id="website_url"
            value={formData.website_url || ''}
            onChange={(e) => handleChange('website_url', e.target.value)}
            placeholder="https://example.com"
            type="url"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={formData.industry || ''}
            onChange={(e) => handleChange('industry', e.target.value)}
            placeholder="Enter industry"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company_size">Company Size</Label>
          <Select 
            value={formData.company_size || ''} 
            onValueChange={(value) => handleChange('company_size', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-1000">201-1000 employees</SelectItem>
              <SelectItem value="1000+">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="founded_year">Founded Year</Label>
          <Input
            id="founded_year"
            value={formData.founded_year || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null
              handleChange('founded_year', value)
            }}
            placeholder="Enter founded year"
            type="number"
            min="1800"
            max="2100"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employee_count">Employee Count</Label>
          <Input
            id="employee_count"
            value={formData.employee_count || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null
              handleChange('employee_count', value)
            }}
            placeholder="Enter employee count"
            type="number"
            min="0"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street_address">Street Address</Label>
          <Input
            id="street_address"
            value={formData.street_address || ''}
            onChange={(e) => handleChange('street_address', e.target.value)}
            placeholder="Enter street address"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Enter city"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state_province">State/Province</Label>
          <Input
            id="state_province"
            value={formData.state_province || ''}
            onChange={(e) => handleChange('state_province', e.target.value)}
            placeholder="Enter state or province"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code || ''}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            placeholder="Enter postal code"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country || ''}
            onChange={(e) => handleChange('country', e.target.value)}
            placeholder="Enter country"
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
          <Label htmlFor="support_email">Support Email</Label>
          <Input
            id="support_email"
            value={formData.support_email || ''}
            onChange={(e) => handleChange('support_email', e.target.value)}
            placeholder="Enter support email"
            type="email"
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
          {loading ? 'Saving...' : companyId ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  )
}