// Test client creation with proper authentication
const { createClient } = require('@supabase/supabase-js');

async function testClientCreation() {
  console.log('🧪 Testing authenticated client creation...\n');
  
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // First, let's check if we can connect to Supabase
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase.from('clients').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!\n');
    
    // Test creating a client directly in the database
    console.log('🧪 Testing direct client creation...');
    
    const testClient = {
      name: 'Test Client',
      email: 'test@example.com',
      company: 'Test Company',
      status: 'invited',
      owner_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID for test
    };
    
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert([testClient])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Client creation failed:', insertError.message);
      
      // Check if it's a foreign key constraint error (user doesn't exist)
      if (insertError.message.includes('owner_id')) {
        console.log('💡 This is likely because the test user ID does not exist.');
        console.log('   In a real scenario, this would be the authenticated user ID.');
      }
    } else {
      console.log('✅ Client created successfully!');
      console.log('Client ID:', newClient.id);
      
      // Clean up - delete the test client
      await supabase.from('clients').delete().eq('id', newClient.id);
      console.log('🧹 Test client cleaned up');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
  
  console.log('\n🏁 Test complete!');
}

testClientCreation().catch(console.error);