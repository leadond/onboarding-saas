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

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('documentId')
  const returnUrl = searchParams.get('returnUrl')

  if (!documentId || !returnUrl) {
    return NextResponse.json(
      { error: 'Missing documentId or returnUrl' },
      { status: 400 }
    )
  }

  // Create a simple mock signing page
  const mockSigningPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BoldSign Mock Signing</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }
        .document-info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 2rem;
        }
        .signature-area {
          border: 2px dashed #ddd;
          padding: 2rem;
          text-align: center;
          margin: 2rem 0;
          border-radius: 4px;
        }
        .buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }
        button {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background-color 0.2s;
        }
        .sign-btn {
          background: #007bff;
          color: white;
        }
        .sign-btn:hover {
          background: #0056b3;
        }
        .decline-btn {
          background: #6c757d;
          color: white;
        }
        .decline-btn:hover {
          background: #545b62;
        }
        .mock-notice {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 2rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="mock-notice">
          <strong>⚠️ Development Mode:</strong> This is a mock signing interface for testing purposes.
        </div>
        
        <div class="header">
          <h1>Document Signing</h1>
          <p>Please review and sign the document below</p>
        </div>

        <div class="document-info">
          <h3>Document Details</h3>
          <p><strong>Document ID:</strong> ${documentId}</p>
          <p><strong>Status:</strong> Ready for Signature</p>
          <p><strong>Type:</strong> Contract Agreement</p>
        </div>

        <div class="signature-area">
          <h4>Signature Required</h4>
          <p>Click "Sign Document" to simulate signing this document</p>
          <div style="margin-top: 1rem; font-style: italic; color: #666;">
            [Signature field placeholder]
          </div>
        </div>

        <div class="buttons">
          <button class="sign-btn" onclick="signDocument()">
            ✓ Sign Document
          </button>
          <button class="decline-btn" onclick="declineDocument()">
            ✗ Decline to Sign
          </button>
        </div>
      </div>

      <script>
        function signDocument() {
          // Simulate signing process
          alert('Document signed successfully! Redirecting...');
          
          // Redirect back to the return URL with success status
          const returnUrl = new URL('${decodeURIComponent(returnUrl)}');
          returnUrl.searchParams.set('status', 'completed');
          returnUrl.searchParams.set('documentId', '${documentId}');
          returnUrl.searchParams.set('event', 'signing_complete');
          
          window.location.href = returnUrl.toString();
        }

        function declineDocument() {
          // Simulate declining process
          const confirmed = confirm('Are you sure you want to decline signing this document?');
          if (confirmed) {
            alert('Document declined. Redirecting...');
            
            // Redirect back to the return URL with declined status
            const returnUrl = new URL('${decodeURIComponent(returnUrl)}');
            returnUrl.searchParams.set('status', 'declined');
            returnUrl.searchParams.set('documentId', '${documentId}');
            returnUrl.searchParams.set('event', 'signing_declined');
            
            window.location.href = returnUrl.toString();
          }
        }
      </script>
    </body>
    </html>
  `

  return new NextResponse(mockSigningPage, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}