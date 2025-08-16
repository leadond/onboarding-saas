'use client'

import { uploadManager as supabaseUploadManager } from './upload-manager'
import { awsS3Client } from './aws-s3-client'
import type { UploadConfigData } from '@/lib/validations/kit'

export type StorageProvider = 'supabase' | 'aws-s3' | 'hybrid'

export interface HybridUploadProgress {
  loaded: number
  total: number
  percentage: number
  provider?: StorageProvider
}

export interface HybridUploadResult {
  id: string
  path: string
  url: string
  size: number
  type: string
  name: string
  provider: StorageProvider
  backupUrl?: string
  s3Key?: string
  supabasePath?: string
}

export interface HybridUploadError {
  message: string
  code?: string
  details?: any
  provider?: StorageProvider
}

class HybridUploadManager {
  private defaultProvider: StorageProvider
  private enableBackup: boolean

  constructor() {
    // Determine default provider based on environment variables
    this.defaultProvider = this.getDefaultProvider()
    this.enableBackup = process.env.FEATURE_HYBRID_BACKUP === 'true'
  }

  /**
   * Upload file using the configured provider
   */
  async uploadFile(
    file: File,
    kitId: string,
    clientId: string,
    stepId: string,
    config: UploadConfigData,
    provider?: StorageProvider,
    onProgress?: (progress: HybridUploadProgress) => void
  ): Promise<HybridUploadResult> {
    const activeProvider = provider || this.defaultProvider
    
    try {
      switch (activeProvider) {
        case 'supabase':
          return await this.uploadToSupabase(file, kitId, clientId, stepId, config, onProgress)
        
        case 'aws-s3':
          return await this.uploadToS3(file, kitId, clientId, stepId, onProgress)
        
        case 'hybrid':
          return await this.uploadHybrid(file, kitId, clientId, stepId, config, onProgress)
        
        default:
          throw new Error(`Unsupported storage provider: ${activeProvider}`)
      }
    } catch (error) {
      console.error('Hybrid upload error:', error)
      throw this.createUploadError(error, activeProvider)
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    kitId: string,
    clientId: string,
    stepId: string,
    config: UploadConfigData,
    provider?: StorageProvider,
    onProgress?: (fileIndex: number, progress: HybridUploadProgress) => void
  ): Promise<HybridUploadResult[]> {
    const results: HybridUploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      const progressCallback = onProgress
        ? (progress: HybridUploadProgress) => onProgress(i, progress)
        : undefined

      const result = await this.uploadFile(
        file,
        kitId,
        clientId,
        stepId,
        config,
        provider,
        progressCallback
      )

      results.push(result)
    }

    return results
  }

  /**
   * Delete file from active provider
   */
  async deleteFile(result: HybridUploadResult): Promise<void> {
    try {
      switch (result.provider) {
        case 'supabase':
          if (result.supabasePath && result.id) {
            await supabaseUploadManager.deleteFile(result.supabasePath, result.id)
          }
          break
        
        case 'aws-s3':
          if (result.s3Key) {
            await awsS3Client.deleteFile(result.s3Key)
          }
          break
        
        case 'hybrid':
          // Delete from both providers
          const promises = []
          if (result.supabasePath && result.id) {
            promises.push(supabaseUploadManager.deleteFile(result.supabasePath, result.id))
          }
          if (result.s3Key) {
            promises.push(awsS3Client.deleteFile(result.s3Key))
          }
          await Promise.allSettled(promises)
          break
      }
    } catch (error) {
      console.error('Hybrid delete error:', error)
      throw error
    }
  }

  /**
   * Get download URL
   */
  async getDownloadUrl(result: HybridUploadResult, expiresIn = 3600): Promise<string> {
    try {
      switch (result.provider) {
        case 'supabase':
          if (result.supabasePath) {
            return await supabaseUploadManager.getDownloadUrl(result.supabasePath, expiresIn)
          }
          break
        
        case 'aws-s3':
          if (result.s3Key) {
            return await awsS3Client.getDownloadUrl(result.s3Key, expiresIn)
          }
          break
        
        case 'hybrid':
          // Prefer S3 for downloads
          if (result.s3Key) {
            return await awsS3Client.getDownloadUrl(result.s3Key, expiresIn)
          } else if (result.supabasePath) {
            return await supabaseUploadManager.getDownloadUrl(result.supabasePath, expiresIn)
          }
          break
      }
      
      throw new Error('No valid download path found')
    } catch (error) {
      console.error('Download URL error:', error)
      throw error
    }
  }

  /**
   * Upload to Supabase only
   */
  private async uploadToSupabase(
    file: File,
    kitId: string,
    clientId: string,
    stepId: string,
    config: UploadConfigData,
    onProgress?: (progress: HybridUploadProgress) => void
  ): Promise<HybridUploadResult> {
    const progressCallback = onProgress ? (progress: any) => {
      onProgress({ ...progress, provider: 'supabase' as StorageProvider })
    } : undefined

    const result = await supabaseUploadManager.uploadFile(
      file, kitId, clientId, stepId, config, progressCallback
    )

    return {
      id: result.id,
      path: result.path,
      url: result.url,
      size: result.size,
      type: result.type,
      name: result.name,
      provider: 'supabase',
      supabasePath: result.path,
    }
  }

  /**
   * Upload to AWS S3 only
   */
  private async uploadToS3(
    file: File,
    kitId: string,
    clientId: string,
    stepId: string,
    onProgress?: (progress: HybridUploadProgress) => void
  ): Promise<HybridUploadResult> {
    const progressCallback = onProgress ? (progress: any) => {
      onProgress({ ...progress, provider: 'aws-s3' as StorageProvider })
    } : undefined

    const result = await awsS3Client.uploadFile(
      file, kitId, clientId, stepId, progressCallback
    )

    return {
      id: result.id,
      path: result.key,
      url: result.url,
      size: result.size,
      type: result.type,
      name: result.name,
      provider: 'aws-s3',
      s3Key: result.key,
    }
  }

  /**
   * Upload to both providers (hybrid approach)
   */
  private async uploadHybrid(
    file: File,
    kitId: string,
    clientId: string,
    stepId: string,
    config: UploadConfigData,
    onProgress?: (progress: HybridUploadProgress) => void
  ): Promise<HybridUploadResult> {
    // Upload to primary provider first
    const primaryProvider = this.getPrimaryProvider()
    let primaryResult: HybridUploadResult

    if (onProgress) {
      onProgress({ loaded: 0, total: file.size * 2, percentage: 0, provider: 'hybrid' })
    }

    if (primaryProvider === 'aws-s3') {
      const s3Result = await this.uploadToS3(file, kitId, clientId, stepId)
      primaryResult = s3Result

      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size * 2, percentage: 50, provider: 'hybrid' })
      }

      // Backup to Supabase
      try {
        const supabaseResult = await this.uploadToSupabase(file, kitId, clientId, stepId, config)
        primaryResult.backupUrl = supabaseResult.url
        primaryResult.supabasePath = supabaseResult.path
      } catch (error) {
        console.warn('Backup to Supabase failed:', error)
      }
    } else {
      const supabaseResult = await this.uploadToSupabase(file, kitId, clientId, stepId, config)
      primaryResult = supabaseResult

      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size * 2, percentage: 50, provider: 'hybrid' })
      }

      // Backup to S3
      try {
        const s3Result = await this.uploadToS3(file, kitId, clientId, stepId)
        primaryResult.backupUrl = s3Result.url
        primaryResult.s3Key = s3Result.s3Key
      } catch (error) {
        console.warn('Backup to S3 failed:', error)
      }
    }

    if (onProgress) {
      onProgress({ loaded: file.size * 2, total: file.size * 2, percentage: 100, provider: 'hybrid' })
    }

    primaryResult.provider = 'hybrid'
    return primaryResult
  }

  /**
   * Determine the default provider based on configuration
   */
  private getDefaultProvider(): StorageProvider {
    if (process.env.FEATURE_HYBRID_STORAGE === 'true') {
      return 'hybrid'
    }
    
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      return 'aws-s3'
    }
    
    return 'supabase'
  }

  /**
   * Get the primary provider for hybrid uploads
   */
  private getPrimaryProvider(): 'aws-s3' | 'supabase' {
    return process.env.HYBRID_PRIMARY_PROVIDER === 'supabase' ? 'supabase' : 'aws-s3'
  }

  /**
   * Create a standardized upload error
   */
  private createUploadError(error: any, provider?: StorageProvider): HybridUploadError {
    if (error.message) {
      return {
        message: error.message,
        code: error.code,
        details: error,
        provider,
      }
    }

    return {
      message: 'An unknown hybrid upload error occurred',
      details: error,
      provider,
    }
  }

  /**
   * Get storage configuration info
   */
  getStorageInfo() {
    return {
      defaultProvider: this.defaultProvider,
      enableBackup: this.enableBackup,
      primaryProvider: this.getPrimaryProvider(),
      awsConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    }
  }

  /**
   * Test connectivity to both providers
   */
  async testConnectivity() {
    const results = {
      supabase: false,
      aws: false,
      errors: [] as string[],
    }

    // Test Supabase
    try {
      const testFiles = await supabaseUploadManager.listFiles('test', 'test')
      results.supabase = true
    } catch (error) {
      results.errors.push(`Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Test AWS S3
    try {
      await awsS3Client.listFiles('test/')
      results.aws = true
    } catch (error) {
      results.errors.push(`AWS S3: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return results
  }
}

export const hybridUploadManager = new HybridUploadManager()