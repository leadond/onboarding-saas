import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function migrateFromUsers() {
  const supabase = await getSupabaseClient()(supabaseUrl, supabaseKey)

  try {
    console.log('🔍 Extracting companies from users table...')

    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('company_name, id, created_at')
      .not('company_name', 'is', null)
      .neq('company_name', '')

    if (usersError || !users) {
      console.log('❌ Error fetching users:', usersError)
      return
    }

    console.log(`📊 Found ${users.length} users with companies`)

    const uniqueCompanies = users.reduce((acc, user) => {
      if (!acc[user.company_name]) {
        acc[user.company_name] = {
          name: user.company_name,
          legal_name: user.company_name,
          industry: 'General',
          created_by: user.id,
          created_at: user.created_at
        }
      }
      return acc
    }, {} as Record<string, any>)

    const companiesToCreate = Object.values(uniqueCompanies)
    console.log(`🏢 Unique companies found: ${companiesToCreate.length}`)
    companiesToCreate.forEach((company, i) => {
      console.log(`  ${i + 1}. ${company.name}`)
    })

    const { data: createdCompanies, error: insertError } = await supabase
      .from('companies')
      .insert(companiesToCreate)
      .select()

    if (insertError) {
      console.log('❌ Insert error:', insertError)
      console.log('📝 Run this SQL in Supabase first:')
      console.log(`
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  industry VARCHAR(100),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage companies" ON companies FOR ALL USING (created_by = auth.uid());
      `)
      return
    }

    console.log('✅ Migration completed!')
    console.log(`📈 Created ${createdCompanies?.length} companies`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

if (require.main === module) {
  migrateFromUsers()
}

export { migrateFromUsers }