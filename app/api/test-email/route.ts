import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/notifications/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject = 'Test Email from Onboard Hero' } = body

    if (!to) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    console.log(`🧪 Testing email to: ${to}`)
    console.log(`🔑 Resend API Key: ${process.env.RESEND_API_KEY ? 'Present' : 'Missing'}`)
    console.log(`📧 From Email: ${process.env.RESEND_FROM_EMAIL || 'Not set'}`)

    const emailService = new EmailService()
    
    // Create a test context
    const testContext = {
      kit: {
        id: 'test-kit-id',
        title: 'Test Onboarding Kit',
        user: {
          full_name: 'Test User',
          company_name: 'Onboard Hero',
          email: 'admin@onboardhero.com'
        }
      },
      client: {
        name: 'Test Client',
        email: to,
        identifier: to
      },
      customMessage: 'This is a test email to verify the email system is working correctly.'
    }

    const success = await emailService.sendWelcomeEmail(testContext)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        to,
        provider: 'Resend'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint',
    usage: 'POST with { "to": "email@example.com" } to send test email'
  })
}