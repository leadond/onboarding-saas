import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in environment variables.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const sqlFilePath = path.resolve(__dirname, '20250820000001_rebuild_auth_initial_user.sql')
  const sql = fs.readFileSync(sqlFilePath, 'utf-8')

  try {
    const { data, error } = await supabase.rpc('sql', { query: sql })
    if (error) {
      console.error('Error executing SQL:', error)
      process.exit(1)
    }
    console.log('Successfully executed rebuild auth initial user migration.')
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

main()