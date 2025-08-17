import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUsers() {
  console.log('Checking users in the database...');
  
  // Get all users
  const { data: users, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  console.log(`Found ${users.length} users:`);
  users.forEach((user: any) => {
    console.log(`- ${user.email} (${user.full_name})`);
  });
  
  // Check auth users
  console.log('\nChecking auth users...');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }
  
  console.log(`Found ${authUsers.users.length} auth users:`);
  authUsers.users.forEach((user: any) => {
    console.log(`- ${user.email} (${user.user_metadata?.full_name || 'No name'})`);
  });
}

checkUsers().catch(console.error);