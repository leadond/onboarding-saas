import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = await getSupabaseClient()(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTableDirect() {
  console.log('Creating data_access_requests table directly...');
  
  // Create the table
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS data_access_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        table_name TEXT NOT NULL,
        record_id UUID,
        access_type TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMPTZ,
        rejected_by UUID REFERENCES users(id),
        rejected_at TIMESTAMPTZ,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  });
  
  if (error) {
    console.error('Error creating data_access_requests table:', error);
    return;
  }
  
  console.log('data_access_requests table created successfully');
  
  // Create indexes
  console.log('Creating indexes...');
  const { error: indexError } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE INDEX IF NOT EXISTS data_access_requests_user_id_idx ON data_access_requests(user_id);
      CREATE INDEX IF NOT EXISTS data_access_requests_status_idx ON data_access_requests(status);
      CREATE INDEX IF NOT EXISTS data_access_requests_table_name_idx ON data_access_requests(table_name);
      CREATE INDEX IF NOT EXISTS data_access_requests_created_at_idx ON data_access_requests(created_at);
    `
  });
  
  if (indexError) {
    console.error('Error creating indexes:', indexError);
    return;
  }
  
  console.log('Indexes created successfully');
}

createTableDirect().catch(console.error);