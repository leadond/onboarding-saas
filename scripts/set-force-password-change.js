const { supabaseAdmin } = require('../lib/supabase/admin');

async function setForcePasswordChange(email) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update({ force_password_change: true, updated_at: new Date().toISOString() })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error setting force_password_change flag:', error);
    process.exit(1);
  }

  console.log(`force_password_change flag set for user: ${email}`, data);
}

const ownerEmail = 'leadond@gmail.com';

setForcePasswordChange(ownerEmail).then(() => process.exit(0));