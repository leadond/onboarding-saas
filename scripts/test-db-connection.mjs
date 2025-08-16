#!/usr/bin/env node

/**
 * Database Connection Diagnostic Script
 * Tests Supabase connectivity and table existence
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envContent = readFileSync('.env.local', 'utf8')
    const env = {}
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length) {
          env[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
    
    return env
  } catch (error) {
    console.error('❌ Could not load .env.local:', error.message)
    return {}
  }
}

const env = loadEnvFile()

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

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
    
    // Test specific table existence - focusing on the failing one
    console.log('\n🗄️  Testing Table Existence...')
    
    const tablesToCheck = [
      'users',
      'kits', 
      'kit_steps',
      'client_progress'
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
      console.log('❌ Kit query failed:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      if (error.code === 'PGRST205') {
        console.log('\n💡 DIAGNOSIS CONFIRMED: The "kits" table does not exist in the remote database.')
        console.log('   This confirms the PGRST205 error in the application.')
        console.log('   The local schema exists but has not been applied to the remote Supabase instance.')
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
  console.log('The issue is likely that:')
  console.log('1. ❌ The remote Supabase database does not have the required tables')
  console.log('2. ❌ Local migrations have not been applied to the remote database')
  console.log('3. ❌ The app is trying to use a remote DB that has no schema')
  console.log('\n🔧 Recommended Solutions:')
  console.log('A. Apply migrations to remote Supabase database')  
  console.log('B. Use local Supabase with Docker (install Docker first)')
  console.log('C. Implement mock data fallback for development')
  console.log('D. Create new Supabase project with proper schema')
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