import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

async function directMigration() {
  const supabase = await getSupabaseClient()(supabaseUrl!, supabaseKey!)

  try {
    console.log('🚀 Starting direct company migration with table creation...')

    // Step 1: Create companies table using raw SQL
    const createTableSQL = `
      -- Enable UUID extension if not already enabled
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create companies table
      CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          legal_name VARCHAR(255),
          industry VARCHAR(100),
          website_url TEXT,
          email VARCHAR(255),
          phone VARCHAR(50),
          created_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS for security
      ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

      -- Create RLS policy for companies (drop if exists first)
      DROP POLICY IF EXISTS "Users can manage their companies" ON companies;
      CREATE POLICY "Users can manage their companies" ON companies
          FOR ALL USING (
              created_by = auth.uid()
          );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
      CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

      -- Add update trigger function
      CREATE OR REPLACE FUNCTION update_companies_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Add update trigger (drop if exists first)
      DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
      CREATE TRIGGER update_companies_updated_at 
          BEFORE UPDATE ON companies 
          FOR EACH ROW 
          EXECUTE FUNCTION update_companies_updated_at();
    `

    console.log('🔧 Creating companies table structure...')
    
    // Execute the table creation SQL using the SQL editor endpoint
    const { data: createResult, error: createError } = await supabase
      .from('_sql')
      .select('*')
      .limit(1)

    if (createError) {
      console.log('📝 Direct SQL execution not available, using alternative approach...')
      
      // Alternative: Use Supabase management API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql: createTableSQL })
      })

      if (!response.ok) {
        console.log('⚠️  Direct execution failed, proceeding with manual table creation check...')
        
        // Try to access companies table to see if it exists
        const { data: testCompanies, error: testError } = await supabase
          .from('companies')
          .select('count', { count: 'exact', head: true })

        if (testError) {
          console.log('❌ Companies table does not exist. Please run the SQL manually:')
          console.log('🔗 Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/sql/new')
          console.log('📄 Copy and paste the contents of: scripts/create-companies-table.sql')
          console.log('▶️  Click "Run" to execute the SQL')
          console.log('')
          console.log('✨ After running the SQL, re-run this script to complete the migration.')
          return
        }

        console.log('✅ Companies table already exists!')
      } else {
        console.log('✅ Companies table created successfully!')
      }
    }

    // Step 2: Migrate data from clients table
    console.log('📊 Migrating company data from clients...')

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('company, owner_id, created_at')
      .not('company', 'is', null)
      .neq('company', '')

    if (clientsError || !clients || clients.length === 0) {
      console.log('ℹ️  No client companies found to migrate')
      
      // Check existing companies
      const { data: existingCompanies } = await supabase
        .from('companies')
        .select('name, created_at')
        .order('created_at', { ascending: false })

      if (existingCompanies && existingCompanies.length > 0) {
        console.log('📋 Existing companies in database:')
        existingCompanies.forEach((company, index) => {
          console.log(`  ${index + 1}. ${company.name} (${new Date(company.created_at).toLocaleDateString()})`)
        })
      }
      return
    }

    // Process unique companies
    const uniqueCompanies = clients.reduce((acc, client) => {
      const key = `${client.company}-${client.owner_id}`
      if (!acc[key] || new Date(client.created_at) < new Date(acc[key].created_at)) {
        acc[key] = {
          name: client.company,
          legal_name: client.company,
          industry: 'General',
          created_by: client.owner_id,
          created_at: client.created_at,
          updated_at: new Date().toISOString()
        }
      }
      return acc
    }, {} as Record<string, any>)

    const companiesToCreate = Object.values(uniqueCompanies)

    // Check for existing companies
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('name')

    const existingNames = new Set(existingCompanies?.map(c => c.name) || [])
    const newCompanies = companiesToCreate.filter(c => !existingNames.has(c.name))

    if (newCompanies.length === 0) {
      console.log('✅ All companies already migrated!')
      console.log(`📊 Total companies in database: ${existingCompanies?.length || 0}`)
      return
    }

    // Insert new companies
    console.log(`➕ Inserting ${newCompanies.length} new companies...`)
    
    const { data: createdCompanies, error: insertError } = await supabase
      .from('companies')
      .insert(newCompanies)
      .select()

    if (insertError) {
      console.error('❌ Error inserting companies:', insertError)
      return
    }

    console.log('🎉 Migration completed successfully!')
    console.log(`📈 Created ${createdCompanies?.length || 0} companies:`)
    createdCompanies?.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name}`)
    })

    // Final verification
    const { data: allCompanies } = await supabase
      .from('companies')
      .select('name, created_at')
      .order('created_at', { ascending: false })

    console.log(`\n📊 Total companies now in database: ${allCompanies?.length || 0}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  directMigration()
}

export { directMigration }