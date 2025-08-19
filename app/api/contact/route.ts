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

import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, companyName, comment } = body

    // Basic validation
    if (!name || !email || !phone || !companyName || !comment) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Sanitize input (basic example)
    const sanitizedComment = comment.replace(/<script.*?>.*?<\/script>/gi, '')

    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'leadond@gmail.com',
        subject: 'New Contact Form Submission from Onboard Hero',
        html: `<p>Name: ${name}</p>
               <p>Email: ${email}</p>
               <p>Phone: ${phone}</p>
               <p>Company: ${companyName}</p>
               <p>Message: ${sanitizedComment}</p>`,
      })

    return NextResponse.json({ success: true, message: 'Form submitted successfully!' })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}