const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tfuhfrjokvmectwfrazm.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdWhmcmpva3ZtZWN0d2ZyYXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTE3NjUsImV4cCI6MjA3MDYyNzc2NX0.tYKnTxnKqEVm3mMqo-s6vx06dKPEJBziADgkXJuQ8Ng'

async function testConnection() {
  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  console.log('Key:', supabaseKey.substring(0, 20) + '...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
    } else {
      console.log('✅ Connection successful!')
      console.log('Session:', data.session ? 'Active' : 'No active session')
    }
    
    // Test database connection
    const { data: profiles, error: dbError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.error('❌ Database connection failed:', dbError.message)
    } else {
      console.log('✅ Database connection successful!')
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

testConnection()