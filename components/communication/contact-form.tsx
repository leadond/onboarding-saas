'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

interface ContactFormProps {
  kitId?: string
  clientIdentifier?: string
  clientName?: string
  clientEmail?: string
  companyName?: string
  brandColor?: string
  className?: string
  onSubmit?: (data: ContactFormData) => void
  onClose?: () => void
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'general' | 'billing' | 'feedback'
}

export function ContactForm({
  kitId,
  clientIdentifier,
  clientName = '',
  clientEmail = '',
  companyName = 'OnboardKit',
  brandColor = '#3B82F6',
  className,
  onSubmit,
  onClose,
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: clientName,
    email: clientEmail,
    subject: '',
    message: '',
    priority: 'medium',
    category: 'general',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // In real implementation, would send to API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      onSubmit?.(formData)
      setSubmitStatus('success')

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: clientName,
          email: clientEmail,
          subject: '',
          message: '',
          priority: 'medium',
          category: 'general',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateFormData = <K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const priorities = [
    { value: 'low', label: 'Low - General inquiry', color: 'text-green-600' },
    {
      value: 'medium',
      label: 'Medium - Need assistance',
      color: 'text-yellow-600',
    },
    {
      value: 'high',
      label: 'High - Blocking my progress',
      color: 'text-orange-600',
    },
    {
      value: 'urgent',
      label: 'Urgent - Critical issue',
      color: 'text-red-600',
    },
  ]

  const categories = [
    { value: 'general', label: 'General Questions', icon: '❓' },
    { value: 'technical', label: 'Technical Issues', icon: '⚙️' },
    { value: 'billing', label: 'Billing & Account', icon: '💳' },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: '💡' },
  ]

  if (submitStatus === 'success') {
    return (
      <Card className={cn('p-6 text-center', className)}>
        <div className="space-y-4">
          <div className="mb-4 text-6xl">✅</div>
          <h3 className="text-xl font-semibold text-gray-900">
            Message Sent Successfully!
          </h3>
          <p className="text-gray-600">
            Thank you for contacting us. We&apos;ll get back to you within 24 hours.
          </p>
          <div className="rounded-lg bg-gray-50 p-4 text-left">
            <h4 className="mb-2 font-medium text-gray-900">
              What happens next:
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• You&apos;ll receive a confirmation email shortly</li>
              <li>• Our support team will review your message</li>
              <li>• We&apos;ll respond within 24 hours on business days</li>
              <li>• For urgent issues, you can also use the chat widget</li>
            </ul>
          </div>
          {onClose && (
            <Button onClick={onClose} variant="outline" className="mt-4">
              Close
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Contact {companyName} Support
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              We&apos;re here to help with any questions or issues you may have
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name and Email */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your Name *
              </label>
              <Input
                value={formData.name}
                onChange={e => updateFormData('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={e => updateFormData('email', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {categories.map(category => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() =>
                    updateFormData('category', category.value as any)
                  }
                  className={cn(
                    'rounded-lg border p-3 text-center text-sm font-medium transition-colors',
                    formData.category === category.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  )}
                >
                  <div className="mb-1 text-lg">{category.icon}</div>
                  <div>{category.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Priority Level
            </label>
            <div className="space-y-2">
              {priorities.map(priority => (
                <label
                  key={priority.value}
                  className="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={e =>
                      updateFormData('priority', e.target.value as any)
                    }
                    className="text-blue-600"
                  />
                  <span className={cn('text-sm', priority.color)}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Subject *
            </label>
            <Input
              value={formData.subject}
              onChange={e => updateFormData('subject', e.target.value)}
              placeholder="Brief description of your inquiry"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={e => updateFormData('message', e.target.value)}
              placeholder="Please provide details about your question or issue..."
              rows={5}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Include as much detail as possible to help us assist you better
            </p>
          </div>

          {/* Context Information */}
          {(kitId || clientIdentifier) && (
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="mb-2 text-sm font-medium text-gray-700">
                Context Information
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                {kitId && <div>Kit ID: {kitId}</div>}
                {clientIdentifier && <div>Client ID: {clientIdentifier}</div>}
                <div>Timestamp: {new Date().toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <strong>Error:</strong> Failed to send your message. Please try
              again or contact us directly.
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-gray-500">* Required fields</p>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.message.trim()
              }
              style={{ backgroundColor: brandColor }}
              className="px-6"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>

        {/* Additional Help */}
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="mb-2 text-sm text-gray-600">
            Need immediate assistance?
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="#" className="text-blue-600 hover:underline">
              📞 Call Support
            </a>
            <a href="#" className="text-blue-600 hover:underline">
              💬 Live Chat
            </a>
            <a href="#" className="text-blue-600 hover:underline">
              📚 Help Center
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ContactForm
