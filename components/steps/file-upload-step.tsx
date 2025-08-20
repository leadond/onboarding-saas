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

import * as React from 'react'
import { FileDropzone } from '@/components/uploads/file-dropzone'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  uploadManager,
  type UploadResult,
  type UploadProgress,
} from '@/lib/storage/upload-manager'
import { cn } from '@/lib/utils/cn'
import type { KitStep } from '@/types'
import type { Database } from '@/lib/supabase/database.types'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

type ClientProgress = Tables<'client_progress'>

interface FileUploadStepProps {
  step: KitStep
  clientId: string
  onComplete: (data: any) => void | Promise<void>
  onNext?: () => void
  onPrevious?: () => void
  isLoading?: boolean
  progress?: ClientProgress
  className?: string
}

export function FileUploadStep({
  step,
  clientId,
  onComplete,
  onNext,
  onPrevious,
  isLoading = false,
  progress,
  className,
}: FileUploadStepProps) {
  const { content, title, description } = step
  const uploadConfig = content.upload_config

  const [uploadedFiles, setUploadedFiles] = React.useState<UploadResult[]>([])
  const [uploadProgress, setUploadProgress] = React.useState<
    Record<number, UploadProgress>
  >({})
  const [isUploading, setIsUploading] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])

  // Load existing uploads on mount
  React.useEffect(() => {
    loadExistingFiles()
  }, [step.id, clientId])

  const loadExistingFiles = async () => {
    try {
      const files = await uploadManager.listFiles(
        step.kit_id,
        step.id,
        clientId
      )
      const results: UploadResult[] = files.map(file => ({
        id: file.id,
        path: file.file_path,
        url: '', // Will be loaded on demand
        size: file.file_size || 0,
        type: file.mime_type || '',
        name: file.original_filename,
      }))
      setUploadedFiles(results)
    } catch (error) {
      console.error('Error loading existing files:', error)
    }
  }

  const handleFilesSelected = async (files: File[]) => {
    if (!uploadConfig) return

    setSelectedFiles(files)
    setIsUploading(true)

    try {
      const results = await uploadManager.uploadFiles(
        files,
        step.kit_id,
        clientId,
        step.id,
        uploadConfig,
        (fileIndex, progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileIndex]: progress,
          }))
        }
      )

      // Add new uploads to the list
      setUploadedFiles(prev => [...prev, ...results])
      setSelectedFiles([])
      setUploadProgress({})

      // Save progress
      const allFiles = [...uploadedFiles, ...results]
      await saveProgress(allFiles)

      // Auto-advance if configured and required files uploaded
      if (step.settings?.auto_advance && allFiles.length > 0 && onNext) {
        onNext()
      }
    } catch (error) {
      console.error('Upload error:', error)
      // Handle upload errors
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileRemove = async (index: number) => {
    try {
      const fileToRemove = uploadedFiles[index]
      if (fileToRemove) {
        await uploadManager.deleteFile(fileToRemove.path, fileToRemove.id)
        const newFiles = uploadedFiles.filter((_, i) => i !== index)
        setUploadedFiles(newFiles)
        await saveProgress(newFiles)
      }
    } catch (error) {
      console.error('Error removing file:', error)
    }
  }

  const saveProgress = async (files: UploadResult[]) => {
    try {
      await onComplete({
        step_id: step.id,
        response_data: {
          files: files.map(f => ({
            id: f.id,
            name: f.name,
            size: f.size,
            type: f.type,
            path: f.path,
          })),
        },
        status: files.length > 0 ? 'completed' : 'in_progress',
      })
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const handleContinue = async () => {
    if (uploadedFiles.length === 0 && step.is_required) {
      // Show error - required step with no files
      return
    }

    await saveProgress(uploadedFiles)

    if (onNext) {
      onNext()
    }
  }

  if (!uploadConfig) {
    return (
      <Card className={cn('mx-auto w-full max-w-2xl', className)}>
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Upload configuration has not been set up for this step.
          </p>
        </CardContent>
      </Card>
    )
  }

  const canContinue = uploadedFiles.length > 0 || !step.is_required
  const hasReachedMinFiles = step.is_required ? uploadedFiles.length > 0 : true

  return (
    <Card className={cn('mx-auto w-full max-w-4xl', className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-2 text-base">
            {description}
          </CardDescription>
        )}
        {content.instructions && (
          <div
            className="prose prose-sm mt-4 max-w-none text-left"
            dangerouslySetInnerHTML={{ __html: content.instructions }}
          />
        )}
      </CardHeader>

      <CardContent>
        <FileDropzone
          config={uploadConfig}
          onFilesSelected={handleFilesSelected}
          onFileRemove={handleFileRemove}
          uploadedFiles={uploadedFiles}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          disabled={isLoading}
          className="mb-8"
        />

        {/* Upload requirements */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Upload Requirements:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Maximum {uploadConfig.max_files} files</li>
            <li>
              • Maximum {Math.round(uploadConfig.max_file_size / 1024 / 1024)}MB
              per file
            </li>
            <li>• Accepted types: {uploadConfig.accepted_types.join(', ')}</li>
            {step.is_required && <li>• At least one file is required</li>}
          </ul>
        </div>

        {/* Status message */}
        {step.is_required && uploadedFiles.length === 0 && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              This step requires at least one file to continue.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between border-t pt-6">
          {onPrevious ? (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading || isUploading}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            onClick={handleContinue}
            disabled={isLoading || isUploading || !canContinue}
            className="min-w-[120px]"
          >
            {isLoading || isUploading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing file upload step state
export function useFileUploadStep() {
  const [uploads, setUploads] = React.useState<UploadResult[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<
    Record<number, UploadProgress>
  >({})

  const addUpload = (upload: UploadResult) => {
    setUploads(prev => [...prev, upload])
  }

  const removeUpload = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id))
  }

  const updateProgress = (fileIndex: number, progress: UploadProgress) => {
    setUploadProgress(prev => ({
      ...prev,
      [fileIndex]: progress,
    }))
  }

  const clearProgress = () => {
    setUploadProgress({})
  }

  return {
    uploads,
    isUploading,
    uploadProgress,
    addUpload,
    removeUpload,
    updateProgress,
    clearProgress,
    setIsUploading,
    setUploads,
  }
}
