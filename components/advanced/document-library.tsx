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

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface Document {
  id: string
  name: string
  description?: string
  file_url: string
  file_size: number
  file_type: string
  category: string
  is_required: boolean
  created_at: string
  updated_at: string
  download_count: number
  tags: string[]
}

interface DocumentLibraryProps {
  kitId: string
  clientIdentifier: string
  brandColor?: string
  className?: string
  onDocumentDownload?: (document: Document) => void
}

export function DocumentLibrary({
  kitId,
  clientIdentifier,
  brandColor = '#3B82F6',
  className,
  onDocumentDownload,
}: DocumentLibraryProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingDocuments, setDownloadingDocuments] = useState<Set<string>>(
    new Set()
  )

  const supabase = createClient()

  // Sample documents data
  const sampleDocuments: Document[] = [
    {
      id: '1',
      name: 'Welcome Guide.pdf',
      description: 'Complete guide to getting started with our services',
      file_url: '/documents/welcome-guide.pdf',
      file_size: 2456789,
      file_type: 'pdf',
      category: 'getting-started',
      is_required: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      download_count: 156,
      tags: ['welcome', 'guide', 'getting-started'],
    },
    {
      id: '2',
      name: 'Terms of Service.pdf',
      description: 'Our terms of service and user agreement',
      file_url: '/documents/terms-of-service.pdf',
      file_size: 1234567,
      file_type: 'pdf',
      category: 'legal',
      is_required: true,
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-10T09:00:00Z',
      download_count: 89,
      tags: ['legal', 'terms', 'agreement'],
    },
    {
      id: '3',
      name: 'Setup Instructions.docx',
      description: 'Step-by-step setup instructions for your account',
      file_url: '/documents/setup-instructions.docx',
      file_size: 987654,
      file_type: 'docx',
      category: 'technical',
      is_required: false,
      created_at: '2024-01-12T14:30:00Z',
      updated_at: '2024-01-12T14:30:00Z',
      download_count: 67,
      tags: ['setup', 'instructions', 'account'],
    },
    {
      id: '4',
      name: 'Brand Assets.zip',
      description: 'Logo files, brand guidelines, and marketing materials',
      file_url: '/documents/brand-assets.zip',
      file_size: 15678432,
      file_type: 'zip',
      category: 'resources',
      is_required: false,
      created_at: '2024-01-08T16:15:00Z',
      updated_at: '2024-01-08T16:15:00Z',
      download_count: 43,
      tags: ['brand', 'assets', 'marketing'],
    },
    {
      id: '5',
      name: 'API Documentation.pdf',
      description: 'Technical documentation for API integration',
      file_url: '/documents/api-docs.pdf',
      file_size: 3456789,
      file_type: 'pdf',
      category: 'technical',
      is_required: false,
      created_at: '2024-01-14T11:20:00Z',
      updated_at: '2024-01-14T11:20:00Z',
      download_count: 92,
      tags: ['api', 'technical', 'integration'],
    },
  ]

  const categories = [
    { id: 'all', name: 'All Documents', icon: '📁', count: 0 },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀', count: 0 },
    { id: 'technical', name: 'Technical', icon: '⚙️', count: 0 },
    { id: 'legal', name: 'Legal', icon: '📋', count: 0 },
    { id: 'resources', name: 'Resources', icon: '🎯', count: 0 },
  ]

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchTerm, selectedCategory])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      // In real implementation, would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
      setDocuments(sampleDocuments)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = documents

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        doc =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    setFilteredDocuments(filtered)

    // Update category counts
    categories.forEach(category => {
      if (category.id === 'all') {
        category.count = documents.length
      } else {
        category.count = documents.filter(
          doc => doc.category === category.id
        ).length
      }
    })
  }

  const handleDownload = async (document: Document) => {
    setDownloadingDocuments(prev => new Set(prev).add(document.id))

    try {
      // In real implementation, would handle actual file download
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate download

      // Update download count
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === document.id
            ? { ...doc, download_count: doc.download_count + 1 }
            : doc
        )
      )

      onDocumentDownload?.(document)

      // Create download link (in real app, this would be a signed URL)
      const link = window.document.createElement('a')
      link.href = document.file_url
      link.download = document.name
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloadingDocuments(prev => {
        const newSet = new Set(prev)
        newSet.delete(document.id)
        return newSet
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string): string => {
    const icons: Record<string, string> = {
      pdf: '📄',
      docx: '📝',
      doc: '📝',
      zip: '🗜️',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      txt: '📄',
    }
    return icons[fileType.toLowerCase()] || '📎'
  }

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Loading documents...</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Document Library
          </h3>
          <p className="text-gray-600">
            Access important documents, guides, and resources for your
            onboarding
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
            🔍
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                selectedCategory === category.id
                  ? 'border border-blue-200 bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map(document => (
              <div
                key={document.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">
                    {getFileIcon(document.file_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">
                        {document.name}
                      </h4>
                      {document.is_required && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                    {document.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {document.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>{document.file_type.toUpperCase()}</span>
                      <span>{document.download_count} downloads</span>
                      <span>
                        Updated{' '}
                        {new Date(document.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    {document.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {document.tags.map(tag => (
                          <span
                            key={tag}
                            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleDownload(document)}
                  disabled={downloadingDocuments.has(document.id)}
                  style={{ backgroundColor: brandColor }}
                  className="flex items-center space-x-2"
                >
                  {downloadingDocuments.has(document.id) ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <span>⬇️</span>
                      <span>Download</span>
                    </>
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">📁</div>
              <p className="mb-2 text-gray-500">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No documents match your search criteria'
                  : 'No documents available'}
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Required Documents Summary */}
        {documents.some(doc => doc.is_required) && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-medium text-yellow-800">
              📋 Required Documents
            </h4>
            <p className="text-sm text-yellow-700">
              Please download and review all required documents to complete your
              onboarding process.
            </p>
            <div className="mt-2">
              {documents
                .filter(doc => doc.is_required)
                .map(doc => (
                  <span
                    key={doc.id}
                    className="mb-1 mr-2 inline-block rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
                  >
                    {doc.name}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default DocumentLibrary
