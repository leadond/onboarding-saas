import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create Supabase client with service role key for admin access
const supabase = await getSupabaseClient()(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createDataAccessTable() {
  console.log('Creating data_access_requests table...');
  
  // Create the table
  const { error } = await supabase.rpc('execute_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.data_access_requests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
        table_name TEXT NOT NULL,
        record_id UUID,
        access_type TEXT NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
        approved_by UUID REFERENCES public.users(id),
        approved_at TIMESTAMPTZ,
        rejected_by UUID REFERENCES public.users(id),
        rejected_at TIMESTAMPTZ,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS data_access_requests_user_id_idx ON public.data_access_requests(user_id);
      CREATE INDEX IF NOT EXISTS data_access_requests_status_idx ON public.data_access_requests(status);
      CREATE INDEX IF NOT EXISTS data_access_requests_table_name_idx ON public.data_access_requests(table_name);
      CREATE INDEX IF NOT EXISTS data_access_requests_created_at_idx ON public.data_access_requests(created_at);
      
      -- Enable RLS
      ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;
      
      -- RLS Policies
      -- Users can view their own requests
      CREATE POLICY "Users can view own data access requests" ON public.data_access_requests
        FOR SELECT USING (user_id = auth.uid());
      
      -- Users can create requests
      CREATE POLICY "Users can create data access requests" ON public.data_access_requests
        FOR INSERT WITH CHECK (user_id = auth.uid());
      
      -- Admins can manage requests
      CREATE POLICY "Admins can manage data access requests" ON public.data_access_requests
        FOR ALL USING (
          user_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.organization_members om
            JOIN public.organizations o ON om.organization_id = o.id
            WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
          )
        );
      
      -- Add updated_at trigger
      CREATE TRIGGER handle_updated_at_data_access_requests 
        BEFORE UPDATE ON public.data_access_requests
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    `
  });
  
  if (error) {
    console.error('Error creating data_access_requests table:', error);
    return;
  }
  
  console.log('data_access_requests table created successfully');
}

createDataAccessTable().catch(console.error);