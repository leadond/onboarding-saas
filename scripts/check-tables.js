const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTables() {
  try {
    console.log('Checking if integration tables exist...');
    
    // Test if user_integrations table exists
    const { data: integrations, error: integrationsError } = await supabase
      .from('user_integrations')
      .select('*')
      .limit(1);
    
    if (integrationsError) {
      console.log('user_integrations table does not exist:', integrationsError.message);
    } else {
      console.log('✅ user_integrations table exists');
    }
    
    // Test if integration_providers table exists
    const { data: providers, error: providersError } = await supabase
      .from('integration_providers')
      .select('*')
      .limit(1);
    
    if (providersError) {
      console.log('integration_providers table does not exist:', providersError.message);
    } else {
      console.log('✅ integration_providers table exists');
    }
    
    // Test if integration_sync_logs table exists
    const { data: syncLogs, error: syncLogsError } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .limit(1);
    
    if (syncLogsError) {
      console.log('integration_sync_logs table does not exist:', syncLogsError.message);
    } else {
      console.log('✅ integration_sync_logs table exists');
    }
    
    // If all tables don't exist, we need to run the migration
    if (integrationsError && providersError && syncLogsError) {
      console.log('\n❌ Integration tables are missing. Migration needs to be applied.');
      console.log('Please run the SQL migration manually in the Supabase Dashboard:');
      console.log(`1. Go to ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor`);
      console.log('2. Copy and paste the SQL from supabase/migrations/20241215000001_create_user_integrations.sql');
      console.log('3. Execute the SQL to create the tables');
    } else if (!integrationsError && !providersError && !syncLogsError) {
      console.log('\n✅ All integration tables exist! Database is ready.');
    } else {
      console.log('\n⚠️ Some integration tables are missing. Check the individual results above.');
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

checkTables();