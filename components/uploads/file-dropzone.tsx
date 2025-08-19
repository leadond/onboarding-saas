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

import * as React from 'react'
import { useDropzone, type Accept } from 'react-dropzone'
import { Upload, X, File, Image, FileText, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils/cn'
import type { UploadConfigData } from '@/lib/validations/kit'
import type { UploadResult, UploadProgress } from '@/lib/storage/upload-manager'

interface FileDropzoneProps {
  config: UploadConfigData
  onFilesSelected: (files: File[]) => void
  onFileRemove: (index: number) => void
  uploadedFiles?: UploadResult[]
  uploadProgress?: Record<number, UploadProgress>
  isUploading?: boolean
  className?: string
  disabled?: boolean
}

interface FilePreviewProps {
  file: File | UploadResult
  index: number
  progress?: UploadProgress
  onRemove: () => void
  isUploaded?: boolean
  disabled?: boolean
}

function getFileIcon(fileName: string, mimeType?: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const type = mimeType?.split('/')[0]

  if (
    type === 'image' ||
    ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')
  ) {
    return <Image className="h-8 w-8 text-blue-500" />
  }

  if (
    type === 'video' ||
    ['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')
  ) {
    return <Video className="h-8 w-8 text-purple-500" />
  }

  if (extension === 'pdf' || ['doc', 'docx', 'txt'].includes(extension || '')) {
    return <FileText className="h-8 w-8 text-red-500" />
  }

  return <File className="h-8 w-8 text-gray-500" />
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function FilePreview({
  file,
  index,
  progress,
  onRemove,
  isUploaded = false,
  disabled = false,
}: FilePreviewProps) {
  const fileName = file.name
  const fileSize = file.size
  const mimeType = file.type

  return (
    <div className="flex items-center rounded-lg border bg-gray-50 p-3">
      <div className="mr-3 flex-shrink-0">
        {getFileIcon(fileName, mimeType)}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{fileName}</p>
        <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>

        {progress && !isUploaded && (
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs text-gray-600">Uploading...</span>
              <span className="text-xs text-gray-600">
                {progress.percentage}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {isUploaded && (
          <p className="mt-1 text-xs text-green-600">✓ Uploaded successfully</p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        disabled={disabled}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function FileDropzone({
  config,
  onFilesSelected,
  onFileRemove,
  uploadedFiles = [],
  uploadProgress = {},
  isUploading = false,
  className,
  disabled = false,
}: FileDropzoneProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])

  // Convert accepted types to dropzone format
  const acceptedFileTypes: Accept = React.useMemo(() => {
    const accept: Accept = {}

    config.accepted_types.forEach(type => {
      if (type.includes('*')) {
        // Handle wildcards like "image/*"
        const baseType = type.split('/')[0]
        if (!accept[baseType + '/*']) {
          accept[baseType + '/*'] = []
        }
      } else {
        // Handle specific MIME types
        if (!accept[type]) {
          accept[type] = []
        }
      }
    })

    return accept
  }, [config.accepted_types])

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      accept: acceptedFileTypes,
      maxFiles: config.max_files,
      maxSize: config.max_file_size,
      disabled: disabled || isUploading,
      onDrop: acceptedFiles => {
        const newFiles = [...selectedFiles, ...acceptedFiles]
        setSelectedFiles(newFiles.slice(0, config.max_files))
        onFilesSelected(acceptedFiles)
      },
    })

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileRemove(index)
  }

  const totalFiles = selectedFiles.length + uploadedFiles.length

  return (
    <div className={cn('w-full', className)}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50',
          totalFiles >= config.max_files &&
            'cursor-not-allowed border-gray-200 bg-gray-50'
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="mb-2 text-lg font-medium text-gray-900">
              Uploading files...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while your files are being uploaded.
            </p>
          </div>
        ) : totalFiles >= config.max_files ? (
          <div className="flex flex-col items-center">
            <File className="mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-medium text-gray-900">
              Maximum files reached
            </p>
            <p className="text-sm text-gray-500">
              You can upload up to {config.max_files} files. Remove some files
              to add more.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="mb-4 text-sm text-gray-500">
              or click to select files from your computer
            </p>
            <p className="text-xs text-gray-400">
              Max {config.max_files} files,{' '}
              {formatFileSize(config.max_file_size)} each
            </p>
          </div>
        )}
      </div>

      {/* File rejection errors */}
      {fileRejections.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-red-800">
            Some files were rejected:
          </h4>
          <ul className="space-y-1 text-sm text-red-700">
            {fileRejections.map(({ file, errors }, index) => (
              <li key={index}>
                <strong>{file.name}</strong>:
                {errors.map(error => (
                  <span key={error.code} className="ml-1">
                    {error.message}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File list */}
      {(selectedFiles.length > 0 || uploadedFiles.length > 0) && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Files ({totalFiles}/{config.max_files})
          </h4>

          {/* Uploaded files */}
          {uploadedFiles.map((file, index) => (
            <FilePreview
              key={`uploaded-${index}`}
              file={file}
              index={index}
              onRemove={() => onFileRemove(index)}
              isUploaded={true}
              disabled={disabled}
            />
          ))}

          {/* Selected files */}
          {selectedFiles.map((file, index) => (
            <FilePreview
              key={`selected-${index}`}
              file={file}
              index={index + uploadedFiles.length}
              progress={uploadProgress[index + uploadedFiles.length]}
              onRemove={() => removeFile(index)}
              disabled={disabled || isUploading}
            />
          ))}
        </div>
      )}

      {/* Configuration info */}
      {config.description && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">{config.description}</p>
        </div>
      )}
    </div>
  )
}
