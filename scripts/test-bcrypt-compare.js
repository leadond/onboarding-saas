require('dotenv').config()
const bcrypt = require('bcrypt')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testPasswordCompare() {
  const email = 'leadond@gmail.com'
  const password = 'TempPass123!'

  const { data: user, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('email', email)
    .single()

  if (error || !user) {
    console.error('User not found or error:', error)
    return
  }

  console.log('Stored password hash:', user.password_hash)

  const match = await bcrypt.compare(password, user.password_hash)
  console.log('Password comparison result:', match)
}

testPasswordCompare()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error testing password compare:', err)
    process.exit(1)
  })