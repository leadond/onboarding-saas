// Test client creation with authentication
const { createClient } = require('@supabase/supabase-js');

async function testWithAuth() {
  require('dotenv').config({ path: '.env.local' });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Create a test user first
    console.log('🔐 Creating test user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'testuser@example.com',
      password: 'testpassword123',
      email_confirm: true
    });
    
    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    const userId = authData?.user?.id || 'existing-user';
    console.log('✅ User ready:', userId);
    
    // Now test client creation with this user
    console.log('🧪 Testing client creation...');
    
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: 'Test Client',
        email: 'testclient@example.com',
        company: 'Test Company',
        owner_id: userId
      })
      .select()
      .single();
    
    if (clientError) {
      console.error('❌ Client creation failed:', clientError);
    } else {
      console.log('✅ Client created:', client.id);
      
      // Clean up
      await supabase.from('clients').delete().eq('id', client.id);
      console.log('🧹 Cleaned up test client');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testWithAuth();