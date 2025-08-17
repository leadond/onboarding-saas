import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestData() {
  console.log('Creating test data...');
  
  // Sign in as admin user
  console.log('Signing in as leadond@gmail.com...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'leadond@gmail.com',
    password: 'password123'
  });
  
  if (signInError) {
    console.error('Error signing in:', signInError);
    return;
  }
  
  console.log('Signed in successfully as:', signInData.user?.email);
  
  // Create a data access request for the client
  console.log('Creating data access request for leadond@yahoo.com...');
  const { data: requestData, error: requestError } = await supabase
    .from('data_access_requests')
    .insert({
      user_id: signInData.user?.id,
      table_name: 'users',
      access_type: 'read',
      reason: 'Testing client onboarding experience'
    })
    .select()
    .single();
  
  if (requestError) {
    console.error('Error creating data access request:', requestError);
    return;
  }
  
  console.log('Data access request created:', requestData);
  
  // Approve the request (as admin)
  console.log('Approving data access request...');
  const { data: approvedData, error: approveError } = await supabase
    .from('data_access_requests')
    .update({
      status: 'approved',
      approved_by: signInData.user?.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', requestData.id)
    .select()
    .single();
  
  if (approveError) {
    console.error('Error approving data access request:', approveError);
    return;
  }
  
  console.log('Data access request approved:', approvedData);
}

createTestData().catch(console.error);