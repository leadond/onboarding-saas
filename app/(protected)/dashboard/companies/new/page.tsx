'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function NewCompanyPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    legal_name: '',
    industry: '',
    website_url: '',
    email: '',
    phone: '',
    description: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Company name is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          legal_name: formData.legal_name || null,
          industry: formData.industry || null,
          website_url: formData.website_url || null,
          email: formData.email || null,
          phone: formData.phone || null,
          description: formData.description || null
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create company')
      }

      if (data.success) {
        router.push('/dashboard/companies')
      } else {
        throw new Error(data.error || 'Failed to create company')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create company')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Company</h1>
        <p className="mt-2 text-gray-600">Create a company profile for kit assignments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                Company Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter company name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="legal_name" className="mb-1 block text-sm font-medium text-gray-700">
                Legal Name
              </label>
              <Input
                id="legal_name"
                type="text"
                placeholder="Legal business name (optional)"
                value={formData.legal_name}
                onChange={e => handleInputChange('legal_name', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="industry" className="mb-1 block text-sm font-medium text-gray-700">
                Industry
              </label>
              <Input
                id="industry"
                type="text"
                placeholder="e.g., Technology, Healthcare, Finance"
                value={formData.industry}
                onChange={e => handleInputChange('industry', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="website_url" className="mb-1 block text-sm font-medium text-gray-700">
                Website
              </label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://example.com"
                value={formData.website_url}
                onChange={e => handleInputChange('website_url', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                id="description"
                type="text"
                placeholder="Brief company description"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/companies">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isCreating || !formData.name.trim()}>
                {isCreating ? 'Creating...' : 'Create Company'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}