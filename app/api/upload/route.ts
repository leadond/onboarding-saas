import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadToS3 } from '@/lib/aws/s3'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Generate unique file key
    const fileExtension = file.name.split('.').pop()
    const fileKey = `uploads/${user.id}/${nanoid()}.${fileExtension}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    const uploadResult = await uploadToS3(fileKey, buffer, file.type)

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.url,
        key: uploadResult.key,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}