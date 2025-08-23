const bcrypt = require('bcrypt')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function createInitialAdminUser() {
  const email = 'leadond@gmail.com'
  const password = 'TempPass123!'
  const companyName = 'Dev App Hero'
  const globalAdminRole = 'global_admin'

  // Hash password
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // Delete all existing users
  const { error: deleteError } = await supabase.from('users').delete().neq('id', '')
  if (deleteError) {
    console.error('Error deleting existing users:', deleteError)
    return
  }

  // Insert initial admin user
  const { error: insertError } = await supabase.from('users').insert({
    email,
    password_hash: passwordHash,
    company_name: companyName,
    role: globalAdminRole,
    force_password_change: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (insertError) {
    console.error('Error inserting initial admin user:', insertError)
  } else {
    console.log('Initial admin user created successfully.')
  }
}

createInitialAdminUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error creating initial admin user:', err)
    process.exit(1)
  })