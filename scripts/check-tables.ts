import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = await getSupabaseClient()(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTables() {
  console.log('Checking database tables...');
  
  // List all tables
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (error) {
    console.error('Error fetching tables:', error);
    return;
  }
  
  console.log('Tables in public schema:');
  tables.forEach((table: any) => {
    console.log(`- ${table.table_name}`);
  });
  
  // Check if data_access_requests table exists
  console.log('\nChecking for data_access_requests table...');
  const { data: requestTable, error: requestTableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'data_access_requests');
  
  if (requestTableError) {
    console.error('Error checking for data_access_requests table:', requestTableError);
  } else if (requestTable && requestTable.length > 0) {
    console.log('data_access_requests table exists');
  } else {
    console.log('data_access_requests table does not exist');
  }
}

checkTables().catch(console.error);