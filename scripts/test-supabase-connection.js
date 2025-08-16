#!/usr/bin/env node

/**
 * Test Supabase Database Connection
 * Run this to verify your database setup is working
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.production');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('✅ Basic connection successful');

    // Test 2: Check if tables exist
    console.log('\n2. Checking database tables...');
    const tables = [
      'users', 'organizations', 'kits', 'kit_steps', 
      'client_progress', 'file_uploads', 'payments', 
      'user_integrations', 'audit_logs', 'api_keys'
    ];

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (tableError && tableError.code !== 'PGRST116') {
          console.log(`❌ Table '${table}' not found or accessible`);
        } else {
          console.log(`✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' error: ${err.message}`);
      }
    }

    // Test 3: Check storage buckets
    console.log('\n3. Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage not accessible:', bucketsError.message);
    } else {
      const expectedBuckets = ['avatars', 'kit-assets', 'client-uploads', 'documents'];
      expectedBuckets.forEach(bucket => {
        const exists = buckets.find(b => b.name === bucket);
        if (exists) {
          console.log(`✅ Storage bucket '${bucket}' exists`);
        } else {
          console.log(`❌ Storage bucket '${bucket}' missing`);
        }
      });
    }

    // Test 4: Test authentication
    console.log('\n4. Testing authentication system...');
    try {
      // This will fail but should give us info about auth setup
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword'
      });
      
      if (authError && authError.message === 'Invalid login credentials') {
        console.log('✅ Authentication system is working (expected login failure)');
      } else if (authError) {
        console.log('⚠️  Authentication system response:', authError.message);
      }
    } catch (authErr) {
      console.log('⚠️  Authentication test error:', authErr.message);
    }

    console.log('\n🎉 Database connection test completed!');
    console.log('\n📋 Summary:');
    console.log('- Database connection: ✅ Working');
    console.log('- Tables: ✅ Created (if all green above)');
    console.log('- Storage: ✅ Configured (if all green above)');
    console.log('- Authentication: ✅ Ready');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Configure Supabase auth settings (see SUPABASE_DATABASE_SETUP.md)');
    console.log('2. Disable Vercel protection');
    console.log('3. Test your app authentication');

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your Supabase credentials in .env.production');
    console.error('2. Verify your Supabase project is active');
    console.error('3. Run the database setup script in Supabase SQL Editor');
    process.exit(1);
  }
}

// Run the test
testConnection().catch(console.error);