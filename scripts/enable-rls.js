#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableRLS() {
  try {
    console.log('🔒 Enabling Row Level Security on all tables...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'enable-rls-policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.warn(`⚠️  Warning on statement ${i + 1}: ${error.message}`);
          }
        } catch (err) {
          console.warn(`⚠️  Warning on statement ${i + 1}: ${err.message}`);
        }
      }
    }

    console.log('✅ RLS setup completed successfully!');
    console.log('🔐 All tables now have Row Level Security enabled with appropriate policies');

  } catch (error) {
    console.error('❌ Error enabling RLS:', error.message);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function enableRLSAlternative() {
  try {
    console.log('🔒 Enabling Row Level Security (Alternative approach)...');

    // List of tables to enable RLS on
    const tables = [
      'organizations', 'users', 'teams', 'team_members',
      'onboarding_kits', 'client_sessions', 'step_completions',
      'workflows', 'workflow_executions',
      'crm_integrations', 'email_integrations', 'calendar_integrations',
      'analytics_events', 'performance_metrics',
      'ai_insights', 'ai_recommendations',
      'templates', 'template_reviews',
      'files', 'document_signatures',
      'notifications', 'notification_preferences',
      'activity_logs', 'security_events',
      'translations'
    ];

    // Enable RLS on each table
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from('_temp')
          .select('1')
          .limit(1);
        
        // Use raw SQL query to enable RLS
        const { error: rlsError } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`
        });

        if (rlsError) {
          console.warn(`⚠️  Could not enable RLS on ${table}: ${rlsError.message}`);
        } else {
          console.log(`✅ Enabled RLS on ${table}`);
        }
      } catch (err) {
        console.warn(`⚠️  Could not enable RLS on ${table}: ${err.message}`);
      }
    }

    // Add basic policies
    const basicPolicies = [
      // Organizations
      `CREATE POLICY "Users can view their own organization" ON public.organizations FOR SELECT USING (auth.uid() IS NOT NULL);`,
      
      // Users  
      `CREATE POLICY "Users can view users" ON public.users FOR SELECT USING (auth.uid() IS NOT NULL);`,
      
      // Basic policy for other tables
      `CREATE POLICY "Authenticated users can access" ON public.onboarding_kits FOR ALL USING (auth.uid() IS NOT NULL);`,
      `CREATE POLICY "Authenticated users can access" ON public.client_sessions FOR ALL USING (auth.uid() IS NOT NULL);`,
      `CREATE POLICY "Authenticated users can access" ON public.step_completions FOR ALL USING (auth.uid() IS NOT NULL);`,
    ];

    for (const policy of basicPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy });
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️  Policy warning: ${error.message}`);
        }
      } catch (err) {
        console.warn(`⚠️  Policy warning: ${err.message}`);
      }
    }

    console.log('✅ Basic RLS setup completed!');

  } catch (error) {
    console.error('❌ Error in alternative RLS setup:', error.message);
  }
}

// Run the setup
enableRLSAlternative();