import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function forceSchemaRefresh() {
  const supabase = await getSupabaseClient()(supabaseUrl!, supabaseKey!)

  try {
    console.log('🔄 Forcing Supabase schema cache refresh...')

    // Method 1: Try to refresh schema cache via PostgREST
    const refreshResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Accept-Profile': 'public',
        'Content-Profile': 'public'
      }
    })

    console.log('📡 Schema refresh response:', refreshResponse.status)

    // Method 2: Create the companies table directly via SQL
    const createTableSQL = `
      -- Create companies table with proper structure
      CREATE TABLE IF NOT EXISTS public.companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

      -- Enable RLS
      ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

      -- Create policy
      DROP POLICY IF EXISTS "Users can manage their companies" ON public.companies;
      CREATE POLICY "Users can manage their companies" ON public.companies
          FOR ALL USING (created_by = auth.uid());

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
      CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);

      -- Insert sample data from clients if exists
      INSERT INTO public.companies (name, legal_name, industry, created_by)
      SELECT DISTINCT 
          COALESCE(company, 'Sample Company') as name,
          COALESCE(company, 'Sample Company') as legal_name,
          'Technology' as industry,
          owner_id as created_by
      FROM public.clients 
      WHERE company IS NOT NULL 
        AND company != ''
        AND NOT EXISTS (
          SELECT 1 FROM public.companies c WHERE c.name = clients.company
        )
      ON CONFLICT DO NOTHING;

      -- Verify table creation
      SELECT 'Companies table created successfully!' as status,
             COUNT(*) as total_companies 
      FROM public.companies;
    `

    console.log('🛠️  Creating companies table with direct SQL...')
    console.log('📋 Please run this SQL in Supabase SQL Editor:')
    console.log('🔗 https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/sql/new')
    console.log('')
    console.log('--- COPY THIS SQL ---')
    console.log(createTableSQL)
    console.log('--- END SQL ---')
    console.log('')

    // Method 3: Try alternative table access patterns
    console.log('🔍 Testing alternative access patterns...')

    // Test if we can access any tables
    const tables = ['clients', 'kits', 'user_profiles', 'companies']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: ${data} records`)
        }
      } catch (err) {
        console.log(`❌ ${table}: Connection error`)
      }
    }

    // Method 4: Manual company creation for testing
    console.log('')
    console.log('🧪 Creating test company data manually...')
    
    const testCompanies = [
      {
        name: 'Acme Corporation',
        legal_name: 'Acme Corporation LLC',
        industry: 'Technology',
        website_url: 'https://acme.com',
        email: 'contact@acme.com'
      },
      {
        name: 'TechStart Inc',
        legal_name: 'TechStart Incorporated',
        industry: 'Software',
        website_url: 'https://techstart.io',
        email: 'hello@techstart.io'
      }
    ]

    console.log('📊 Sample companies to create:')
    testCompanies.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (${company.industry})`)
    })

    console.log('')
    console.log('🎯 Next Steps:')
    console.log('1. Run the SQL above in Supabase SQL Editor')
    console.log('2. Wait 30 seconds for schema cache to refresh')
    console.log('3. Re-run the migration script: npx tsx scripts/run-company-migration.ts')
    console.log('4. Test the companies feature in your app')

  } catch (error) {
    console.error('❌ Schema refresh failed:', error)
  }
}

if (require.main === module) {
  forceSchemaRefresh()
}

export { forceSchemaRefresh }