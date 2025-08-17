// Test email API directly
async function testEmailAPI() {
  try {
    console.log('Testing AWS SES email API...\n')

    const response = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Client AWS',
        email: 'test@example.com'
      })
    })

    const result = await response.json()
    
    console.log('Email API Response Status:', response.status)
    console.log('Email API Response:', JSON.stringify(result, null, 2))

    if (result.success) {
      console.log('\n✅ Email sent successfully!')
      console.log('Message ID:', result.messageId)
      console.log('Sent to:', result.sentTo)
    } else {
      console.log('\n❌ Email failed:', result.error)
    }

  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

testEmailAPI()