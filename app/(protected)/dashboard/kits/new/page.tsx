'use client'

import { useState } from 'react'
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

export default function CreateKitPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    welcome_message: '',
    brand_color: '#3B82F6',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Kit name is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/kits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          welcome_message: formData.welcome_message || null,
          brand_color: formData.brand_color,
          status: 'draft',
          analytics_enabled: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create kit')
      }

      const result = await response.json()
      router.push(`/dashboard/kits/${result.data.id}`)
    } catch (error) {
      console.error('Error creating kit:', error)
      setError(error instanceof Error ? error.message : 'Failed to create kit')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Kit</h1>
        <p className="mt-2 text-gray-600">
          Build a professional onboarding experience for your clients
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the basic details for your onboarding kit
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
              <p className="mt-1 text-sm text-gray-500">
                This message will be shown to clients when they start the
                onboarding process.
              </p>
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

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/kits">Cancel</Link>
              </Button>

              <Button
                type="submit"
                disabled={isCreating || !formData.name.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Kit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                1
              </div>
              <p>Your kit will be created in draft mode</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                2
              </div>
              <p>Add steps to define your onboarding process</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                3
              </div>
              <p>Preview and test your kit</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                4
              </div>
              <p>Publish and share with your clients</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
