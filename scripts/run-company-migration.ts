import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey)
  process.exit(1)
}

async function migrateCompanies() {
  const supabase = createClient(supabaseUrl!, supabaseKey!)

  try {
    console.log('🔄 Starting company migration...')
    console.log('🔌 Connected to Supabase:', supabaseUrl)
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true })
    
    if (testError) {
      console.log('ℹ️ Clients table not found or accessible, checking for existing companies...')
      
      // Check if companies table exists and has data
      const { data: existingCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('name, created_at')
        .limit(10)
      
      if (companiesError) {
        console.log('ℹ️ Companies table not found, will need to be created first')
        return
      }
      
      if (existingCompanies && existingCompanies.length > 0) {
        console.log('✅ Found existing companies in companies table:')
        existingCompanies.forEach(company => {
          console.log(`  - ${company.name} (created: ${new Date(company.created_at).toLocaleDateString()})`)
        })
        return
      }
      
      console.log('ℹ️ No companies found to migrate')
      return
    }
    
    console.log(`📊 Found ${testData} total client records`)

    // Get unique companies from clients table
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('company, owner_id, created_at')
      .not('company', 'is', null)
      .neq('company', '')

    if (clientsError) {
      console.error('❌ Error fetching clients:', clientsError)
      return
    }

    if (!clients || clients.length === 0) {
      console.log('ℹ️ No companies found in clients table')
      return
    }

    // Group by company name and get earliest created_at
    const uniqueCompanies = clients.reduce((acc, client) => {
      const key = `${client.company}-${client.owner_id}`
      if (!acc[key] || new Date(client.created_at) < new Date(acc[key].created_at)) {
        acc[key] = {
          name: client.company,
          created_by: client.owner_id,
          created_at: client.created_at
        }
      }
      return acc
    }, {} as Record<string, any>)

    const companiesToCreate = Object.values(uniqueCompanies)

    console.log(`📊 Found ${companiesToCreate.length} unique companies to migrate`)

    // Check which companies already exist
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('name')

    const existingNames = new Set(existingCompanies?.map(c => c.name) || [])
    const newCompanies = companiesToCreate.filter(c => !existingNames.has(c.name))

    if (newCompanies.length === 0) {
      console.log('✅ All companies already exist in companies table')
      return
    }

    console.log(`➕ Creating ${newCompanies.length} new companies...`)

    // Ensure companies table exists with proper structure
    console.log('🔧 Ensuring companies table structure...')
    
    // Insert new companies with enhanced data
    const enhancedCompanies = newCompanies.map(company => ({
      ...company,
      legal_name: company.name, // Use name as legal_name initially
      industry: 'General', // Default industry
      created_at: company.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    
    const { data: createdCompanies, error: insertError } = await supabase
      .from('companies')
      .insert(enhancedCompanies)
      .select()

    if (insertError) {
      console.error('❌ Error creating companies:', insertError)
      console.error('💡 This might be due to missing companies table. Creating it first...')
      
      // Try to create the companies table
      const createTableSQL = `
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
      `
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
      
      if (createError) {
        console.error('❌ Failed to create companies table:', createError)
        console.log('📝 Please run this SQL script in Supabase SQL Editor:')
        console.log('🔗 Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/sql/new')
        console.log('📄 Run the file: scripts/create-companies-table.sql')
        console.log('')
        console.log('✨ After running the SQL, the companies will be automatically migrated!')
        console.log('🔄 You can then re-run this script to verify the migration.')
        return
      }
      
      // Retry insertion
      const { data: retryCompanies, error: retryError } = await supabase
        .from('companies')
        .insert(enhancedCompanies)
        .select()
      
      if (retryError) {
        console.error('❌ Retry failed:', retryError)
        return
      }
      
      console.log('✅ Companies table created and populated successfully!')
      console.log(`📈 Created ${retryCompanies?.length || 0} companies on retry`)
      return
    }

    console.log('✅ Migration completed successfully!')
    console.log(`📈 Created ${createdCompanies?.length || 0} companies:`)
    createdCompanies?.forEach(company => {
      console.log(`  - ${company.name}`)
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run if called directly
if (require.main === module) {
  migrateCompanies()
}

export { migrateCompanies }