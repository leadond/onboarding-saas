// Test client creation API with authentication
const { createClient } = require('@supabase/supabase-js');

async function testClientAPI() {
  require('dotenv').config({ path: '.env.local' });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // Sign in first
    console.log('🔐 Signing in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'testuser@example.com', // Use your test email
      password: 'testpassword123'
    });
    
    if (authError) {
      console.error('❌ Auth failed:', authError.message);
      return;
    }
    
    console.log('✅ Signed in as:', authData.user.email);
    
    // Test client creation
    console.log('🧪 Testing client creation...');
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.session.access_token}`
      },
      body: JSON.stringify({
        name: 'Test Client',
        email: 'testclient@example.com',
        company: 'Test Company'
      })
    });
    
    const result = await response.json();
    console.log('📧 API Response:', result);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testClientAPI();