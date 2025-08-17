import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/aws/ses'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      )
    }

    console.log('Testing AWS SES email sending...')
    
    // Test AWS SES email
    const kitUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/welcome?email=${encodeURIComponent(body.email)}`
    
    const result = await sendWelcomeEmail(body.email, body.name, kitUrl)
    
    if (result.success) {
      console.log('✅ Email sent successfully:', result.messageId)
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        sentTo: body.email
      })
    } else {
      console.error('❌ Email failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}