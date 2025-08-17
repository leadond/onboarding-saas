-- OnboardKit Supabase Database Setup (Simple Version)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/sql/new

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CREATE ALL TABLES
-- =============================================

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  subscription_status TEXT DEFAULT 'free',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Kits table
CREATE TABLE IF NOT EXISTS public.kits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  welcome_message TEXT,
  completion_message TEXT,
  is_published BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  brand_color TEXT DEFAULT '#3B82F6',
  logo_url TEXT,
  background_url TEXT,
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(created_by, slug)
);

-- Kit steps table
CREATE TABLE IF NOT EXISTS public.kit_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  form_fields JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  order_index INTEGER NOT NULL,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kit_id, order_index)
);

-- Client progress table
CREATE TABLE IF NOT EXISTS public.client_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  client_identifier TEXT,
  current_step_id UUID REFERENCES public.kit_steps(id),
  completed_steps JSONB DEFAULT '[]',
  step_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'in_progress',
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kit_id, client_email)
);

-- File uploads table
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.users(id),
  kit_id UUID REFERENCES public.kits(id),
  step_id UUID REFERENCES public.kit_steps(id),
  client_progress_id UUID REFERENCES public.client_progress(id),
  storage_provider TEXT DEFAULT 'supabase',
  storage_path TEXT,
  is_public BOOLEAN DEFAULT false,
  access_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  kit_id UUID REFERENCES public.kits(id),
  client_progress_id UUID REFERENCES public.client_progress(id),
  user_id UUID REFERENCES public.users(id),
  client_email TEXT NOT NULL,
  client_name TEXT,
  payment_method_type TEXT,
  receipt_url TEXT,
  refund_reason TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User integrations table
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  user_id UUID REFERENCES public.users(id),
  user_email TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE RLS POLICIES
-- =============================================

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations" ON public.organizations
  FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage their organizations" ON public.organizations;
CREATE POLICY "Users can manage their organizations" ON public.organizations
  FOR ALL USING (created_by = auth.uid());

-- Kits policies
DROP POLICY IF EXISTS "Users can manage own kits" ON public.kits;
CREATE POLICY "Users can manage own kits" ON public.kits
  FOR ALL USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Published kits are viewable" ON public.kits;
CREATE POLICY "Published kits are viewable" ON public.kits
  FOR SELECT USING (is_published = true);

-- Kit steps policies
DROP POLICY IF EXISTS "Kit steps follow kit permissions" ON public.kit_steps;
CREATE POLICY "Kit steps follow kit permissions" ON public.kit_steps
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE created_by = auth.uid())
  );

-- Client progress policies
DROP POLICY IF EXISTS "Kit owners can view client progress" ON public.client_progress;
CREATE POLICY "Kit owners can view client progress" ON public.client_progress
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE created_by = auth.uid())
  );

-- File uploads policies
DROP POLICY IF EXISTS "Users can manage own uploads" ON public.file_uploads;
CREATE POLICY "Users can manage own uploads" ON public.file_uploads
  FOR ALL USING (uploaded_by = auth.uid());

-- Payments policies
DROP POLICY IF EXISTS "Users can view related payments" ON public.payments;
CREATE POLICY "Users can view related payments" ON public.payments
  FOR SELECT USING (
    user_id = auth.uid() OR 
    kit_id IN (SELECT id FROM public.kits WHERE created_by = auth.uid())
  );

-- User integrations policies
DROP POLICY IF EXISTS "Users can manage own integrations" ON public.user_integrations;
CREATE POLICY "Users can manage own integrations" ON public.user_integrations
  FOR ALL USING (user_id = auth.uid());

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- API keys policies
DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;
CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS handle_updated_at_users ON public.users;
CREATE TRIGGER handle_updated_at_users BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_organizations ON public.organizations;
CREATE TRIGGER handle_updated_at_organizations BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_kits ON public.kits;
CREATE TRIGGER handle_updated_at_kits BEFORE UPDATE ON public.kits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_kit_steps ON public.kit_steps;
CREATE TRIGGER handle_updated_at_kit_steps BEFORE UPDATE ON public.kit_steps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_client_progress ON public.client_progress;
CREATE TRIGGER handle_updated_at_client_progress BEFORE UPDATE ON public.client_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_file_uploads ON public.file_uploads;
CREATE TRIGGER handle_updated_at_file_uploads BEFORE UPDATE ON public.file_uploads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_payments ON public.payments;
CREATE TRIGGER handle_updated_at_payments BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_user_integrations ON public.user_integrations;
CREATE TRIGGER handle_updated_at_user_integrations BEFORE UPDATE ON public.user_integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- CREATE INDEXES
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_subscription_status_idx ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS organizations_slug_idx ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS organizations_created_by_idx ON public.organizations(created_by);

-- Kits indexes
CREATE INDEX IF NOT EXISTS kits_created_by_idx ON public.kits(created_by);
CREATE INDEX IF NOT EXISTS kits_organization_id_idx ON public.kits(organization_id);
CREATE INDEX IF NOT EXISTS kits_is_published_idx ON public.kits(is_published);
CREATE INDEX IF NOT EXISTS kits_slug_idx ON public.kits(slug);

-- Kit steps indexes
CREATE INDEX IF NOT EXISTS kit_steps_kit_id_idx ON public.kit_steps(kit_id);
CREATE INDEX IF NOT EXISTS kit_steps_order_idx ON public.kit_steps(kit_id, order_index);

-- Client progress indexes
CREATE INDEX IF NOT EXISTS client_progress_kit_id_idx ON public.client_progress(kit_id);
CREATE INDEX IF NOT EXISTS client_progress_email_idx ON public.client_progress(client_email);
CREATE INDEX IF NOT EXISTS client_progress_status_idx ON public.client_progress(status);

-- Other indexes
CREATE INDEX IF NOT EXISTS file_uploads_uploaded_by_idx ON public.file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS payments_stripe_id_idx ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS user_integrations_user_id_idx ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys(user_id);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- CREATE STORAGE BUCKETS
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('kit-assets', 'kit-assets', true),
  ('client-uploads', 'client-uploads', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Kit assets are publicly accessible" ON storage.objects;
CREATE POLICY "Kit assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'kit-assets');

DROP POLICY IF EXISTS "Users can upload kit assets" ON storage.objects;
CREATE POLICY "Users can upload kit assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kit-assets' AND 
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can access client uploads" ON storage.objects;
CREATE POLICY "Users can access client uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client-uploads' AND
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can upload client files" ON storage.objects;
CREATE POLICY "Users can upload client files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-uploads' AND 
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Users can access documents" ON storage.objects;
CREATE POLICY "Users can access documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '🎉 OnboardKit database setup completed successfully!';
  RAISE NOTICE '📋 Tables: users, organizations, organization_members, kits, kit_steps, client_progress, file_uploads, payments, user_integrations, audit_logs, api_keys';
  RAISE NOTICE '📁 Storage: avatars, kit-assets, client-uploads, documents';
  RAISE NOTICE '🔒 Security: Row Level Security enabled';
  RAISE NOTICE '⚡ Performance: Indexes created';
  RAISE NOTICE '✅ Ready for production!';
END $$;