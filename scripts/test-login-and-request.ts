import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testLoginAndRequest() {
  console.log('Testing login and data access request...');
  
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
  
  // Get user profile
  console.log('Getting user profile...');
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', signInData.user?.id)
    .single();
  
  if (profileError) {
    console.error('Error getting user profile:', profileError);
  } else {
    console.log('User profile:', profileData);
  }
  
  // Create a data access request
  console.log('Creating data access request...');
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
}

testLoginAndRequest().catch(console.error);