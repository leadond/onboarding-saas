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

type Kit = {
  id: string
  name: string
  slug: string
  description: string | null
  welcome_message: string | null
  brand_color: string
  logo_url: string | null
  status: 'draft' | 'published' | 'archived'
  analytics_enabled: boolean
  password_protected: boolean
  seo_title: string | null
  seo_description: string | null
  completion_redirect_url: string | null
}

export default function EditKitPage({ params }: { params: { kitId: string } }) {
  const router = useRouter()
  const [kit, setKit] = useState<Kit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    welcome_message: '',
    brand_color: '#3B82F6',
    logo_url: '',
    seo_title: '',
    seo_description: '',
    completion_redirect_url: '',
    analytics_enabled: true,
    password_protected: false,
  })

  useEffect(() => {
    const fetchKit = async () => {
      try {
        const response = await fetch(`/api/kits/${params.kitId}`)

        if (!response.ok) {
          throw new Error('Kit not found')
        }

        const result = await response.json()
        const kitData = result.data

        setKit(kitData)
        setFormData({
          name: kitData.name,
          slug: kitData.slug,
          description: kitData.description || '',
          welcome_message: kitData.welcome_message || '',
          brand_color: kitData.brand_color,
          logo_url: kitData.logo_url || '',
          seo_title: kitData.seo_title || '',
          seo_description: kitData.seo_description || '',
          completion_redirect_url: kitData.completion_redirect_url || '',
          analytics_enabled: kitData.analytics_enabled,
          password_protected: kitData.password_protected,
        })
      } catch (error) {
        console.error('Error fetching kit:', error)
        setError(error instanceof Error ? error.message : 'Failed to load kit')
      } finally {
        setIsLoading(false)
      }
    }

    fetchKit()
  }, [params.kitId])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Kit name is required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/kits/${params.kitId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          welcome_message: formData.welcome_message || null,
          brand_color: formData.brand_color,
          logo_url: formData.logo_url || null,
          seo_title: formData.seo_title || null,
          seo_description: formData.seo_description || null,
          completion_redirect_url: formData.completion_redirect_url || null,
          analytics_enabled: formData.analytics_enabled,
          password_protected: formData.password_protected,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update kit')
      }

      router.push(`/dashboard/kits/${params.kitId}`)
    } catch (error) {
      console.error('Error updating kit:', error)
      setError(error instanceof Error ? error.message : 'Failed to update kit')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading kit...</p>
        </div>
      </div>
    )
  }

  if (error && !kit) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4 text-red-600">{error}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard/kits">Back to Kits</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Kit</h1>
          <p className="mt-2 text-gray-600">
            Update your onboarding kit settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              kit?.status === 'published'
                ? 'bg-green-100 text-green-800'
                : kit?.status === 'archived'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {kit?.status}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update the basic details for your onboarding kit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Kit Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter kit name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                URL Slug
              </label>
              <Input
                id="slug"
                type="text"
                placeholder="kit-url-slug"
                value={formData.slug}
                onChange={e => handleInputChange('slug', e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">
                The URL-friendly version of your kit name
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Describe what this kit is for (optional)"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="welcome_message"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Welcome Message
              </label>
              <textarea
                id="welcome_message"
                placeholder="Welcome message for clients (optional)"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.welcome_message}
                onChange={e =>
                  handleInputChange('welcome_message', e.target.value)
                }
              />
            </div>

            <div>
              <label
                htmlFor="brand_color"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Brand Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="brand_color"
                  type="color"
                  className="h-10 w-12 cursor-pointer rounded border border-gray-300"
                  value={formData.brand_color}
                  onChange={e =>
                    handleInputChange('brand_color', e.target.value)
                  }
                />
                <Input
                  type="text"
                  placeholder="#3B82F6"
                  value={formData.brand_color}
                  onChange={e =>
                    handleInputChange('brand_color', e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="completion_redirect_url"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Completion Redirect URL
              </label>
              <Input
                id="completion_redirect_url"
                type="url"
                placeholder="https://yoursite.com/thank-you"
                value={formData.completion_redirect_url}
                onChange={e =>
                  handleInputChange('completion_redirect_url', e.target.value)
                }
              />
              <p className="mt-1 text-sm text-gray-500">
                Where to redirect clients after they complete the onboarding
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="seo_title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  SEO Title
                </label>
                <Input
                  id="seo_title"
                  type="text"
                  placeholder="SEO title"
                  value={formData.seo_title}
                  onChange={e => handleInputChange('seo_title', e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="logo_url"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Logo URL
                </label>
                <Input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={e => handleInputChange('logo_url', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="seo_description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                SEO Description
              </label>
              <textarea
                id="seo_description"
                placeholder="SEO description"
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.seo_description}
                onChange={e =>
                  handleInputChange('seo_description', e.target.value)
                }
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Settings</h3>

              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="analytics_enabled"
                    className="text-sm font-medium text-gray-700"
                  >
                    Analytics Enabled
                  </label>
                  <p className="text-sm text-gray-500">
                    Track kit performance and client progress
                  </p>
                </div>
                <input
                  id="analytics_enabled"
                  type="checkbox"
                  className="h-4 w-4 rounded text-blue-600"
                  checked={formData.analytics_enabled}
                  onChange={e =>
                    handleInputChange('analytics_enabled', e.target.checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="password_protected"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password Protected
                  </label>
                  <p className="text-sm text-gray-500">
                    Require a password to access this kit
                  </p>
                </div>
                <input
                  id="password_protected"
                  type="checkbox"
                  className="h-4 w-4 rounded text-blue-600"
                  checked={formData.password_protected}
                  onChange={e =>
                    handleInputChange('password_protected', e.target.checked)
                  }
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/kits/${params.kitId}`}>Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSaving || !formData.name.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
