import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function runSchemaSetup() {
  try {
    console.log('Setting up onboarding kits schema...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'setup-onboarding-kits-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`Error in statement ${i + 1}:`, error)
          console.error('Statement:', statement.substring(0, 100) + '...')
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err)
      }
    }
    
    console.log('Schema setup completed!')
    
  } catch (error) {
    console.error('Schema setup failed:', error)
  }
}

// Alternative: Create tables one by one
async function createTablesDirectly() {
  console.log('Creating tables directly via Supabase client...')
  
  const tables = [
    {
      name: 'kit_templates',
      sql: `
        CREATE TABLE IF NOT EXISTS kit_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          industry VARCHAR(100),
          category VARCHAR(100),
          version VARCHAR(20) DEFAULT '1.0.0',
          is_active BOOLEAN DEFAULT true,
          is_premium BOOLEAN DEFAULT false,
          price DECIMAL(10,2) DEFAULT 0.00,
          created_by UUID REFERENCES user_profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );
        
        ALTER TABLE kit_templates ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Global admin full access to kit templates" ON kit_templates
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM user_profiles 
              WHERE user_profiles.auth_user_id = auth.uid() 
              AND user_profiles.role = 'global_admin'
            )
          );
      `
    },
    {
      name: 'company_kits',
      sql: `
        CREATE TABLE IF NOT EXISTS company_kits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_name VARCHAR(255) NOT NULL,
          template_id UUID REFERENCES kit_templates(id),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          customizations JSONB DEFAULT '{}'::jsonb,
          created_by UUID REFERENCES user_profiles(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE company_kits ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Company users manage their kits" ON company_kits
          FOR ALL USING (
            company_name IN (
              SELECT company_name FROM user_profiles 
              WHERE auth_user_id = auth.uid()
            )
          );
      `
    }
  ]
  
  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.name}`)
      const { error } = await supabase.rpc('exec_sql', { sql: table.sql })
      
      if (error) {
        console.error(`Error creating ${table.name}:`, error)
      } else {
        console.log(`✅ ${table.name} created successfully`)
      }
    } catch (err) {
      console.error(`Error with ${table.name}:`, err)
    }
  }
}

if (require.main === module) {
  createTablesDirectly()
}

export { runSchemaSetup, createTablesDirectly }