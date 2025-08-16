'use client'

import { createClient } from '@/lib/supabase/client'
import type { UploadConfigData } from '@/lib/validations/kit'

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  id: string
  path: string
  url: string
  size: number
  type: string
  name: string
}

export interface UploadError {
  message: string
  code?: string
  details?: any
}

class UploadManager {
  private readonly bucketName = 'kit-files'
  private supabase = createClient()

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    kitId: string,
    clientId: string,
    stepId: string,
    config: UploadConfigData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file, config)

      // Generate file path
      const fileName = this.generateFileName(file.name)
      const filePath = `${kitId}/${clientId}/${stepId}/${fileName}`

      // Track progress if callback provided
      let uploadPromise: Promise<any>

      if (onProgress) {
        // Use XMLHttpRequest for progress tracking
        uploadPromise = this.uploadWithProgress(file, filePath, onProgress)
      } else {
        // Use standard Supabase upload
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) throw error
        uploadPromise = Promise.resolve({ data })
      }

      const result = await uploadPromise

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath)

      // Save file metadata to database
      const fileRecord = await this.saveFileRecord({
        kitId,
        stepId,
        clientId,
        originalFilename: file.name,
        storedFilename: fileName,
        filePath,
        fileSize: file.size,
        fileType: this.getFileType(file.type),
        mimeType: file.type,
        uploadStatus: 'completed',
        virusScanStatus: 'pending',
      })

      return {
        id: fileRecord.id,
        path: filePath,
        url: publicUrl,
        size: file.size,
        type: file.type,
        name: file.name,
      }
    } catch (error) {
      console.error('Upload error:', error)
      throw this.createUploadError(error)
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
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    // Validate file count
    if (files.length > config.max_files) {
      throw new Error(`Maximum ${config.max_files} files allowed`)
    }

    // Validate total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > config.max_file_size * config.max_files) {
      throw new Error('Total file size exceeds limit')
    }

    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      const progressCallback = onProgress
        ? (progress: UploadProgress) => onProgress(i, progress)
        : undefined

      const result = await this.uploadFile(
        file,
        kitId,
        clientId,
        stepId,
        config,
        progressCallback
      )

      results.push(result)
    }

    return results
  }

  /**
   * Delete a file
   */
  async deleteFile(filePath: string, fileId: string): Promise<void> {
    try {
      // Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue to delete database record even if storage fails
      }

      // Delete database record
      const { error: dbError } = await this.supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId)

      if (dbError) {
        throw dbError
      }
    } catch (error) {
      console.error('Delete error:', error)
      throw error
    }
  }

  /**
   * Get file download URL
   */
  async getDownloadUrl(filePath: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn)

    if (error) throw error
    return data.signedUrl
  }

  /**
   * List files for a step
   */
  async listFiles(kitId: string, stepId: string, clientId?: string) {
    let query = this.supabase
      .from('file_uploads')
      .select('*')
      .eq('kit_id', kitId)
      .eq('step_id', stepId)
      .eq('upload_status', 'completed')

    if (clientId) {
      query = query.eq('client_identifier', clientId)
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    })

    if (error) throw error
    return data
  }

  private validateFile(file: File, config: UploadConfigData): void {
    // Check file size
    if (file.size > config.max_file_size) {
      throw new Error(
        `File size exceeds limit of ${this.formatFileSize(config.max_file_size)}`
      )
    }

    // Check file type
    const isAllowed = config.accepted_types.some(type => {
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

  private generateFileName(originalName: string): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop() || ''
    return `${timestamp}-${randomString}${extension ? `.${extension}` : ''}`
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.includes('document') || mimeType.includes('text'))
      return 'document'
    return 'other'
  }

  private async uploadWithProgress(
    file: File,
    filePath: string,
    onProgress: (progress: UploadProgress) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = event => {
        if (event.lengthComputable) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          }
          onProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({ data: { path: filePath } })
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Upload failed'))

      // Use Supabase's upload endpoint
      this.supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          const formData = new FormData()
          formData.append('file', file)

          xhr.open(
            'POST',
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${this.bucketName}/${filePath}`
          )
          if (session?.access_token) {
            xhr.setRequestHeader(
              'Authorization',
              `Bearer ${session.access_token}`
            )
          }
          xhr.send(formData)
        })
        .catch(reject)
    })
  }

  private async saveFileRecord(fileData: any) {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .insert({
        kit_id: fileData.kitId,
        step_id: fileData.stepId,
        client_identifier: fileData.clientId,
        original_filename: fileData.originalFilename,
        stored_filename: fileData.storedFilename,
        file_path: fileData.filePath,
        file_size: fileData.fileSize,
        file_type: fileData.fileType,
        mime_type: fileData.mimeType,
        upload_status: fileData.uploadStatus,
        virus_scan_status: fileData.virusScanStatus,
        metadata: {},
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  private createUploadError(error: any): UploadError {
    if (error.message) {
      return {
        message: error.message,
        code: error.code,
        details: error,
      }
    }

    return {
      message: 'An unknown upload error occurred',
      details: error,
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const uploadManager = new UploadManager()
