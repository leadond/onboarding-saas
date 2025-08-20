import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function setupAssignments() {
  const supabase = await getSupabaseClient()(supabaseUrl, supabaseKey)

  try {
    console.log('🔧 Setting up kit assignment system...')

    // Test if company_kits table exists
    const { data: testAssignments, error: testError } = await supabase
      .from('company_kits')
      .select('count', { count: 'exact', head: true })

    if (testError) {
      console.log('📝 company_kits table not found. Please run this SQL:')
      console.log('🔗 https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/sql/new')
      console.log('')
      console.log('--- COPY THIS SQL ---')
      console.log(`
CREATE TABLE IF NOT EXISTS company_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL,
    company_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE company_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage kit assignments" ON company_kits FOR ALL USING (assigned_by = auth.uid());
CREATE INDEX IF NOT EXISTS idx_company_kits_kit_id ON company_kits(kit_id);
ALTER TABLE kits ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
      `)
      console.log('--- END SQL ---')
      return
    }

    console.log('✅ Assignment system ready!')
    console.log(`📊 Current assignments: ${testAssignments}`)

    // Test assignment functionality
    const { data: companies } = await supabase.from('companies').select('id, name').limit(1)
    const { data: kits } = await supabase.from('kits').select('id, title').limit(1)

    if (companies && companies.length > 0 && kits && kits.length > 0) {
      console.log('🎯 Ready to assign kits!')
      console.log(`  Available companies: ${companies.length}`)
      console.log(`  Available kits: ${kits.length}`)
    }

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

if (require.main === module) {
  setupAssignments()
}

export { setupAssignments }