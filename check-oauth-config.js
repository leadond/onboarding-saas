const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tfuhfrjokvmectwfrazm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdWhmcmpva3ZtZWN0d2ZyYXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTE3NjUsImV4cCI6MjA3MDYyNzc2NX0.tYKnTxnKqEVm3mMqo-s6vx06dKPEJBziADgkXJuQ8Ng'

async function checkOAuthConfig() {
  console.log('Checking OAuth configuration...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test OAuth URL generation
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    
    if (error) {
      console.error('❌ OAuth configuration error:', error.message)
      console.error('Error details:', error)
    } else {
      console.log('✅ OAuth URL generation successful!')
      console.log('OAuth data:', data)
    }
    
  } catch (err) {
    console.error('❌ OAuth test failed:', err.message)
    console.error('Full error:', err)
  }
}

checkOAuthConfig()