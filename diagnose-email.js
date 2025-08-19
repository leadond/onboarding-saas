// Email diagnosis script
const { createClient } = require('@supabase/supabase-js');

async function diagnoseEmail() {
  console.log('🔍 Diagnosing email functionality...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Present' : '❌ Missing');
  console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Not set');
  console.log('AWS_SES_FROM_EMAIL:', process.env.AWS_SES_FROM_EMAIL || '❌ Not set');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Present' : '❌ Missing');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Present' : '❌ Missing');
  console.log('');
  
  // Test Resend API directly
  if (process.env.RESEND_API_KEY) {
    console.log('🧪 Testing Resend API directly...');
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'onboard@devapphero.com',
          to: ['test@example.com'],
          subject: 'Test Email from Diagnosis Script',
          html: '<p>This is a test email to verify Resend integration.</p>',
          text: 'This is a test email to verify Resend integration.'
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Resend API test successful!');
        console.log('Message ID:', result.id);
      } else {
        console.log('❌ Resend API test failed:');
        console.log('Status:', response.status);
        console.log('Error:', result);
      }
    } catch (error) {
      console.log('❌ Resend API test error:', error.message);
    }
    console.log('');
  }
  
  // Test client creation flow
  console.log('🧪 Testing client creation flow...');
  try {
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the flow
      },
      body: JSON.stringify({
        name: 'Test Client',
        email: 'test@example.com',
        company: 'Test Company'
      })
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.log('❌ Client creation test error:', error.message);
  }
  
  console.log('\n🏁 Diagnosis complete!');
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

diagnoseEmail().catch(console.error);