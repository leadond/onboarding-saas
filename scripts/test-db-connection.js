#!/usr/bin/env node

/**
 * Database Connection Diagnostic Script
 * Tests Supabase connectivity and table existence
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Starting Database Connection Diagnostic...\n')

// Configuration check
console.log('📋 Configuration Check:')
console.log(`- SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
console.log(`- SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
console.log(`- SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`)
console.log()

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required Supabase configuration')
  process.exit(1)
}

// Create Supabase clients
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabaseAdmin = SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) 
  : null

async function testConnection() {
  try {
    console.log('🌐 Testing Supabase Connection...')
    
    // Test basic connectivity
    const { data: healthCheck, error: healthError } = await supabaseAnon
      .from('_supabase_health_check')
      .select('*')
      .limit(1)
    
    if (healthError && healthError.code !== 'PGRST116') {
      console.log('⚠️  Basic connectivity test failed:', healthError.message)
    } else {
      console.log('✅ Basic Supabase connectivity working')
    }

    // Test specific table existence
    console.log('\n🗄️  Testing Table Existence...')
    
    const tablesToCheck = [
      'users',
      'kits', 
      'kit_steps',
      'client_progress',
      'subscriptions',
      'audit_logs'
    ]

    for (const table of tablesToCheck) {
      try {
        const { data, error, count } = await supabaseAnon
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1)
        
        if (error) {
          if (error.code === 'PGRST205') {
            console.log(`❌ Table '${table}' does not exist (PGRST205)`)
          } else if (error.code === '42501') {
            console.log(`⚠️  Table '${table}' exists but access denied (${error.code})`)
          } else {
            console.log(`⚠️  Table '${table}' error: ${error.code} - ${error.message}`)
          }
        } else {
          console.log(`✅ Table '${table}' exists (${count || 0} records)`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' check failed:`, err.message)
      }
    }

    // Test authentication if admin client is available
    if (supabaseAdmin) {
      console.log('\n🔐 Testing Admin Access...')
      try {
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
        
        if (authError) {
          console.log('❌ Admin auth access failed:', authError.message)
        } else {
          console.log(`✅ Admin auth working (${authUsers?.users?.length || 0} users)`)
        }
      } catch (err) {
        console.log('❌ Admin auth test failed:', err.message)
      }
    }

    // Test functions/procedures
    console.log('\n⚙️  Testing Functions...')
    const functionsToTest = [
      'generate_unique_slug',
      'user_within_kit_limit',
      'track_usage'
    ]

    for (const funcName of functionsToTest) {
      try {
        // Test function existence by trying to call with minimal params
        const { data, error } = await (supabaseAdmin || supabaseAnon).rpc(funcName, {
          name: 'test'
        })
        
        if (error) {
          if (error.code === '42883') {
            console.log(`❌ Function '${funcName}' does not exist`)
          } else {
            console.log(`⚠️  Function '${funcName}' exists but failed: ${error.message}`)
          }
        } else {
          console.log(`✅ Function '${funcName}' exists and callable`)
        }
      } catch (err) {
        console.log(`❌ Function '${funcName}' test failed:`, err.message)
      }
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

async function testKitFlow() {
  console.log('\n🎯 Testing Kit-specific Flow...')
  
  try {
    // Test the exact query from the API route
    const { data: kits, error, count } = await supabaseAnon
      .from('kits')
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      console.log('❌ Kit query failed:', error)
      console.log('   - Error Code:', error.code)
      console.log('   - Error Message:', error.message)
      
      if (error.code === 'PGRST205') {
        console.log('\n💡 DIAGNOSIS: The "kits" table does not exist in the remote database.')
        console.log('   This confirms the PGRST205 error in the application.')
      }
    } else {
      console.log('✅ Kit query successful:', { count, records: kits?.length || 0 })
    }
  } catch (err) {
    console.log('❌ Kit flow test failed:', err.message)
  }
}

async function main() {
  await testConnection()
  await testKitFlow()
  
  console.log('\n📊 Diagnostic Summary:')
  console.log('1. Check if all required tables exist in the remote Supabase database')
  console.log('2. If tables are missing, run migrations against the remote database')
  console.log('3. Verify RLS policies allow proper access to tables')
  console.log('4. Consider implementing fallback/offline functionality')
}

main()
  .then(() => {
    console.log('\n✨ Diagnostic complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Diagnostic failed:', error)
    process.exit(1)
  })