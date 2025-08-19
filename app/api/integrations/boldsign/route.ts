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

import { NextRequest, NextResponse } from 'next/server'
import { boldSignClient } from '@/lib/integrations/boldsign-client'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'templates':
        const templates = await boldSignClient.listTemplates()
        return NextResponse.json({ success: true, data: templates })

      case 'status':
        const documentId = searchParams.get('documentId')
        if (!documentId) {
          return NextResponse.json(
            { success: false, error: 'Document ID is required' },
            { status: 400 }
          )
        }
        const status = await boldSignClient.getDocumentStatus(documentId)
        return NextResponse.json({ success: true, data: status })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in BoldSign integration:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'createDocument':
        const { templateId, recipientName, recipientEmail, customFields, returnUrl } = body
        
        if (!templateId || !recipientName || !recipientEmail) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          )
        }

        const document = await boldSignClient.createDocumentFromTemplate("template-1", {
          templateId,
          recipientName,
          recipientEmail,
          customFields,
          returnUrl,
        })

        return NextResponse.json({ success: true, data: document })

      case 'createDocumentFromFile':
        const { filePath, signerName, signerEmail, signerCustomFields } = body
        
        if (!filePath || !signerName || !signerEmail) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          )
        }

        const fileDocument = await boldSignClient.createDocumentFromFile(filePath, {
          name: signerName,
          email: signerEmail,
          customFields: signerCustomFields,
        })

        return NextResponse.json({ success: true, data: fileDocument })

      case 'getSigningUrl':
        const { documentId, userName, email, returnUrl: signingReturnUrl } = body
        
        if (!documentId || !userName || !email) {
          return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
          )
        }

        const signingUrl = await boldSignClient.getEmbeddedSigningUrl(documentId, {
          userName,
          email,
          returnUrl: signingReturnUrl,
        })

        return NextResponse.json({ success: true, data: signingUrl })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in BoldSign integration:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}