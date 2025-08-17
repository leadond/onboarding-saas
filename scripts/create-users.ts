import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createUsers() {
  console.log('Creating users...');
  
  // Create admin user
  console.log('Creating admin user: leadond@gmail.com');
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email: 'leadond@gmail.com',
    password: 'password123',
    user_metadata: {
      full_name: 'Derrick Paul Leadon'
    }
  });
  
  if (adminError) {
    console.error('Error creating admin user:', adminError);
  } else {
    console.log('Admin user created:', adminData.user?.email);
  }
  
  // Create client user
  console.log('Creating client user: leadond@yahoo.com');
  const { data: clientData, error: clientError } = await supabase.auth.admin.createUser({
    email: 'leadond@yahoo.com',
    password: 'client123',
    user_metadata: {
      full_name: 'Client User'
    }
  });
  
  if (clientError) {
    console.error('Error creating client user:', clientError);
  } else {
    console.log('Client user created:', clientData.user?.email);
  }
  
  // Add users to the users table with appropriate roles
  if (adminData?.user) {
    console.log('Adding admin user to users table...');
    const { error: adminInsertError } = await supabase
      .from('users')
      .upsert({
        id: adminData.user.id,
        email: adminData.user.email,
        full_name: 'Derrick Paul Leadon',
        company_name: 'Onboard Hero',
        subscription_status: 'active',
        subscription_tier: 'enterprise',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (adminInsertError) {
      console.error('Error adding admin to users table:', adminInsertError);
    } else {
      console.log('Admin user added to users table');
    }
  }
  
  if (clientData?.user) {
    console.log('Adding client user to users table...');
    const { error: clientInsertError } = await supabase
      .from('users')
      .upsert({
        id: clientData.user.id,
        email: clientData.user.email,
        full_name: 'Client User',
        company_name: null,
        subscription_status: 'active',
        subscription_tier: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (clientInsertError) {
      console.error('Error adding client to users table:', clientInsertError);
    } else {
      console.log('Client user added to users table');
    }
  }
}

createUsers().catch(console.error);