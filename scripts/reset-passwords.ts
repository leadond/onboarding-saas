import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = await getSupabaseClient()(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function resetPasswords() {
  console.log('Resetting passwords...');
  
  // Get auth users
  console.log('Getting auth users...');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }
  
  console.log(`Found ${authUsers.users.length} auth users:`);
  
  for (const user of authUsers.users) {
    if (user.email === 'leadond@gmail.com' || user.email === 'leadond@yahoo.com') {
      console.log(`Resetting password for ${user.email}...`);
      
      // Update user password
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password: user.email === 'leadond@gmail.com' ? 'password123' : 'client123'
      });
      
      if (error) {
        console.error(`Error resetting password for ${user.email}:`, error);
      } else {
        console.log(`Password reset for ${user.email}`);
      }
    }
  }
}

resetPasswords().catch(console.error);