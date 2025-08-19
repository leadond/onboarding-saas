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

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface S3UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface S3UploadResult {
  id: string
  key: string
  url: string
  size: number
  type: string
  name: string
  bucket: string
}

export interface S3UploadError {
  message: string
  code?: string
  details?: any
}

class AWSS3Client {
  private s3Client: S3Client
  private readonly mainBucket: string
  private readonly backupBucket: string
  private readonly region: string

  constructor() {
    this.region = process.env.AWS_REGION || 'us-east-1'
    this.mainBucket = process.env.AWS_S3_BUCKET || 'onboardkit-production-files'
    this.backupBucket = process.env.BACKUP_S3_BUCKET || 'onboardkit-production-backups'

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: File,
    kitId: string,
    clientId: string,
    stepId: string,
    onProgress?: (progress: S3UploadProgress) => void
  ): Promise<S3UploadResult> {
    try {
      const fileName = this.generateFileName(file.name)
      const key = `kits/${kitId}/clients/${clientId}/steps/${stepId}/${fileName}`

      // Convert File to Buffer for upload
      const buffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(buffer)

      const command = new PutObjectCommand({
        Bucket: this.mainBucket,
        Key: key,
        Body: uint8Array,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          kitId: kitId,
          clientId: clientId,
          stepId: stepId,
          uploadedAt: new Date().toISOString(),
        },
        ServerSideEncryption: 'AES256',
      })

      // Upload to S3
      await this.s3Client.send(command)

      // Generate URL
      const url = `https://${this.mainBucket}.s3.${this.region}.amazonaws.com/${key}`

      // Also backup to backup bucket
      await this.backupFile(key, uint8Array, file.type)

      const result: S3UploadResult = {
        id: this.generateId(),
        key,
        url,
        size: file.size,
        type: file.type,
        name: file.name,
        bucket: this.mainBucket,
      }

      // Simulate progress if callback provided
      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 })
      }

      return result
    } catch (error) {
      console.error('S3 upload error:', error)
      throw this.createUploadError(error)
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadFiles(
    files: File[],
    kitId: string,
    clientId: string,
    stepId: string,
    onProgress?: (fileIndex: number, progress: S3UploadProgress) => void
  ): Promise<S3UploadResult[]> {
    const results: S3UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      const progressCallback = onProgress
        ? (progress: S3UploadProgress) => onProgress(i, progress)
        : undefined

      const result = await this.uploadFile(
        file,
        kitId,
        clientId,
        stepId,
        progressCallback
      )

      results.push(result)
    }

    return results
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      // Delete from main bucket
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.mainBucket,
        Key: key,
      })
      await this.s3Client.send(deleteCommand)

      // Delete from backup bucket
      const backupDeleteCommand = new DeleteObjectCommand({
        Bucket: this.backupBucket,
        Key: key,
      })
      await this.s3Client.send(backupDeleteCommand)
    } catch (error) {
      console.error('S3 delete error:', error)
      throw error
    }
  }

  /**
   * Get a signed download URL
   */
  async getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.mainBucket,
        Key: key,
      })

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      })

      return signedUrl
    } catch (error) {
      console.error('S3 signed URL error:', error)
      throw error
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.mainBucket,
        Key: key,
      })

      const response = await this.s3Client.send(command)
      return response
    } catch (error) {
      console.error('S3 metadata error:', error)
      throw error
    }
  }

  /**
   * List files with prefix
   */
  async listFiles(prefix: string) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.mainBucket,
        Prefix: prefix,
      })

      const response = await this.s3Client.send(command)
      return response.Contents || []
    } catch (error) {
      console.error('S3 list error:', error)
      throw error
    }
  }

  /**
   * Create a backup of the file
   */
  private async backupFile(key: string, body: Uint8Array, contentType: string): Promise<void> {
    try {
      const backupCommand = new PutObjectCommand({
        Bucket: this.backupBucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          backupDate: new Date().toISOString(),
          sourceKey: key,
        },
      })

      await this.s3Client.send(backupCommand)
    } catch (error) {
      console.error('S3 backup error:', error)
      // Don't throw here - backup failure shouldn't prevent main upload
    }
  }

  /**
   * Generate a unique filename
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop() || ''
    return `${timestamp}-${randomString}${extension ? `.${extension}` : ''}`
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  /**
   * Create a standardized upload error
   */
  private createUploadError(error: any): S3UploadError {
    if (error.message) {
      return {
        message: error.message,
        code: error.code || error.name,
        details: error,
      }
    }

    return {
      message: 'An unknown S3 upload error occurred',
      details: error,
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSize = 50 * 1024 * 1024, allowedTypes?: string[]): void {
    // Check file size (default 50MB)
    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit of ${this.formatFileSize(maxSize)}`)
    }

    // Check file type if specified
    if (allowedTypes && allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0]
          return file.type.startsWith(baseType + '/')
        }
        return file.type === type
      })

      if (!isAllowed) {
        throw new Error(`File type ${file.type} is not allowed`)
      }
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get bucket info
   */
  getBucketInfo() {
    return {
      mainBucket: this.mainBucket,
      backupBucket: this.backupBucket,
      region: this.region,
    }
  }
}

export const awsS3Client = new AWSS3Client()