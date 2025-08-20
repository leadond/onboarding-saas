// Using built-in fetch (Node.js 18+)

async function checkSupabaseOAuthConfig() {
  console.log('🔍 Checking Supabase OAuth configuration...\n');
  
  const supabaseUrl = 'https://tfuhfrjokvmectwfrazm.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdWhmcmpva3ZtZWN0d2ZyYXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTE3NjUsImV4cCI6MjA3MDYyNzc2NX0.tYKnTxnKqEVm3mMqo-s6vx06dKPEJBziADgkXJuQ8Ng';
  
  try {
    // Check auth settings
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    const settings = await response.json();
    console.log('📋 Auth Settings:');
    console.log('- Google OAuth enabled:', settings.external?.google || false);
    console.log('- Email auth enabled:', settings.external?.email || false);
    console.log('- Signup disabled:', settings.disable_signup || false);
    console.log('- Email autoconfirm:', settings.mailer_autoconfirm || false);
    
    if (!settings.external?.google) {
      console.log('\n❌ Google OAuth is NOT enabled in Supabase!');
      console.log('You need to enable it in your Supabase dashboard.');
    } else {
      console.log('\n✅ Google OAuth is enabled in Supabase');
    }
    
    // Test OAuth URL generation
    console.log('\n🔗 Testing OAuth URL generation...');
    const testResponse = await fetch(`${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback`, {
      method: 'GET',
      headers: {
        'apikey': anonKey
      },
      redirect: 'manual'
    });
    
    console.log('OAuth URL test status:', testResponse.status);
    console.log('OAuth URL test headers:', Object.fromEntries(testResponse.headers.entries()));
    
    if (testResponse.status === 302) {
      const location = testResponse.headers.get('location');
      console.log('✅ OAuth redirect URL:', location);
      
      if (location && location.includes('accounts.google.com')) {
        console.log('✅ Google OAuth URL looks correct');
      } else {
        console.log('❌ OAuth URL does not redirect to Google');
      }
    } else {
      console.log('❌ OAuth URL generation failed');
    }
    
  } catch (error) {
    console.error('❌ Error checking OAuth config:', error.message);
  }
}

checkSupabaseOAuthConfig();