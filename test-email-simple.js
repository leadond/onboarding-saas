// Simple email test script
const fetch = require('node-fetch');

async function testEmail() {
  try {
    console.log('🧪 Testing email functionality...');
    
    const response = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'test@example.com'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email test successful!');
      console.log('Provider:', result.provider);
      console.log('Sent to:', result.to);
    } else {
      console.log('❌ Email test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testEmail();