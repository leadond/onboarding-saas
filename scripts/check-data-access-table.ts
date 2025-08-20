import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDataAccessTable() {
  console.log('Checking for data_access_requests table...');
  
  try {
    // Try to query the data_access_requests table
    const { data, error } = await supabase
      .from('data_access_requests')
      .select('count()', { count: 'exact' });
    
    if (error) {
      console.log('data_access_requests table does not exist or is not accessible');
      console.log('Error:', error.message);
    } else {
      console.log('data_access_requests table exists and is accessible');
      console.log('Row count:', data.length);
    }
  } catch (err) {
    console.log('data_access_requests table does not exist or is not accessible');
    console.log('Error:', err.message);
  }
}

checkDataAccessTable().catch(console.error);