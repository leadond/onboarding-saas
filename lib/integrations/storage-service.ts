import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v2 as cloudinary } from 'cloudinary'

export class StorageService {
  private s3Client: S3Client
  private bucket: string

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    })
    this.bucket = process.env.AWS_S3_BUCKET!

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!
    })
  }

  /**
   * Generate organized file path: company/client/session/filename
   */
  private generateFilePath(
    companyName: string,
    clientName: string,
    sessionId: string,
    filename: string
  ): string {
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9-_]/g, '_')
    
    return [
      'onboarding-files',
      sanitize(companyName),
      sanitize(clientName),
      sessionId,
      filename
    ].join('/')
  }

  async uploadFile(
    file: Buffer | Uint8Array,
    filename: string,
    contentType: string,
    companyName: string,
    clientName: string,
    sessionId: string
  ) {
    try {
      const key = this.generateFilePath(companyName, clientName, sessionId, filename)
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: {
          company: companyName,
          client: clientName,
          session: sessionId,
          uploaded_at: new Date().toISOString()
        }
      })

      await this.s3Client.send(command)

      const fileUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

      return {
        success: true,
        file_url: fileUrl,
        key: key
      }
    } catch (error) {
      console.error('S3 upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      }
    }
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn })

      return {
        success: true,
        download_url: signedUrl
      }
    } catch (error) {
      console.error('S3 signed URL generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'URL generation failed'
      }
    }
  }

  async deleteFile(key: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      })

      await this.s3Client.send(command)

      return {
        success: true
      }
    } catch (error) {
      console.error('S3 delete failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File deletion failed'
      }
    }
  }

  /**
   * Upload and optimize images using Cloudinary
   */
  async uploadImage(
    file: Buffer,
    filename: string,
    companyName: string,
    clientName: string,
    sessionId: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: string
    } = {}
  ) {
    try {
      const folder = `onboarding/${companyName}/${clientName}/${sessionId}`
      
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folder,
            public_id: filename.split('.')[0],
            resource_type: 'auto',
            transformation: [
              {
                width: options.width || 1200,
                height: options.height,
                crop: 'limit',
                quality: options.quality || 'auto',
                format: options.format || 'auto'
              }
            ]
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        ).end(file)
      })

      return {
        success: true,
        file_url: (result as any).secure_url,
        public_id: (result as any).public_id,
        optimized: true
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image upload failed'
      }
    }
  }

  /**
   * Generate PDF from HTML content and upload to S3
   */
  async generateAndUploadPDF(
    htmlContent: string,
    filename: string,
    companyName: string,
    clientName: string,
    sessionId: string
  ) {
    try {
      // In a real implementation, you'd use a library like puppeteer or playwright
      // For now, we'll simulate PDF generation
      const pdfBuffer = Buffer.from(htmlContent, 'utf-8')
      
      return this.uploadFile(
        pdfBuffer,
        filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        'application/pdf',
        companyName,
        clientName,
        sessionId
      )
    } catch (error) {
      console.error('PDF generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PDF generation failed'
      }
    }
  }

  /**
   * List all files for a specific onboarding session
   */
  async listSessionFiles(companyName: string, clientName: string, sessionId: string) {
    try {
      const prefix = this.generateFilePath(companyName, clientName, sessionId, '')
      
      // In a real implementation, you'd use ListObjectsV2Command
      // For now, return a placeholder structure
      return {
        success: true,
        files: [],
        prefix: prefix
      }
    } catch (error) {
      console.error('S3 list files failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File listing failed'
      }
    }
  }
}