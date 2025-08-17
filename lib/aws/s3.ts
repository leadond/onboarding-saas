import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3(key: string, body: Buffer, contentType: string) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })

    const result = await s3Client.send(command)
    
    return {
      success: true,
      url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      key,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn })
    
    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error('S3 signed URL error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate URL',
    }
  }
}

export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    })

    await s3Client.send(command)
    
    return {
      success: true,
    }
  } catch (error) {
    console.error('S3 delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}