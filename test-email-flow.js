// Test the complete email flow
const { createClient } = require('@supabase/supabase-js');

async function testEmailFlow() {
  require('dotenv').config({ path: '.env.local' });
  
  console.log('🧪 Testing complete email flow...\n');
  
  // Test 1: Direct Resend API
  console.log('1️⃣ Testing Resend API directly...');
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboard@devapphero.com',
        to: ['test@example.com'],
        subject: 'Test from Flow Script',
        html: '<p>This is a test email from the flow script</p>'
      })
    });
    
    const result = await response.json();
    if (response.ok) {
      console.log('✅ Direct API test successful:', result.id);
    } else {
      console.log('❌ Direct API failed:', result);
    }
  } catch (error) {
    console.log('❌ Direct API error:', error.message);
  }
  
  // Test 2: Check if server is responding
  console.log('\n2️⃣ Testing server endpoint...');
  try {
    const response = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'test@example.com' })
    });
    
    const result = await response.json();
    console.log('Server response:', result);
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
  }
  
  console.log('\n🏁 Email flow test complete!');
}

testEmailFlow();