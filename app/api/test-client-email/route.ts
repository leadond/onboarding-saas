import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name } = body
    
    console.log('🔄 Testing email send to:', email)
    console.log('🔑 API Key present:', !!process.env.RESEND_API_KEY)
    
    const emailPayload = {
      from: process.env.RESEND_FROM_EMAIL || 'onboard@devapphero.com',
      to: [email],
      subject: `Welcome ${name}! Your onboarding is ready`,
      html: `<h1>Welcome, ${name}!</h1><p>You've been invited to complete your onboarding process.</p>`
    }
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Email sent:', result.id)
      return NextResponse.json({ success: true, emailId: result.id })
    } else {
      console.error('❌ Email failed:', result)
      return NextResponse.json({ error: result }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}