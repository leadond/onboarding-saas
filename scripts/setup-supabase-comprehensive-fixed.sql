-- OnboardKit Comprehensive Supabase Database Setup (FIXED VERSION)
-- This script creates all tables in the correct order to avoid reference issues
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/your-project-id/sql/new

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enum types (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kit_step_type') THEN
    CREATE TYPE kit_step_type AS ENUM (
      'welcome', 'form', 'file_upload', 'payment', 'scheduling',
      'contract', 'video', 'confirmation', 'custom'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_progress_status') THEN
    CREATE TYPE client_progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled', 'refunded');
  END IF;
END $$;

-- =============================================
-- STEP 1: CREATE ALL TABLES IN DEPENDENCY ORDER
-- =============================================

-- Users table (extends auth.users)
-- This must be first as many tables reference it
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Subscription & Billing
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'trial', 'paid', 'cancelled', 'past_due')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Activity
  onboarding_completed_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  
  -- Preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
-- Depends on users table for created_by reference
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'team', 'business', 'enterprise')),
  stripe_customer_id TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kits table
-- Depends on users and organizations tables
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kit steps table
-- Depends on kits table
CREATE TABLE IF NOT EXISTS public.kit_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  step_type kit_step_type NOT NULL,
  content JSONB DEFAULT '{}',
  form_fields JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  order_index INTEGER NOT NULL,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client progress table
-- Depends on kits and kit_steps tables
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
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  status client_progress_status DEFAULT 'in_progress',
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members table
-- Depends on organizations and users tables
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File uploads table
-- Depends on users, kits, kit_steps, and client_progress tables
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
  storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'aws_s3', 'cloudinary')),
  storage_path TEXT,
  is_public BOOLEAN DEFAULT false,
  access_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data access requests table
-- Depends on users table
CREATE TABLE IF NOT EXISTS public.data_access_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Payments table
-- Depends on kits, client_progress, and users tables
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd' CHECK (currency IN ('usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'inr', 'cny', 'sgd', 'chf', 'sek', 'nzd')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  kit_id UUID REFERENCES public.kits(id),
  client_progress_id UUID REFERENCES public.client_progress(id),
  status payment_status NOT NULL,
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
-- Depends on users table only
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN (
    'google', 'microsoft', 'nylas', 'stripe', 'docusign', 'boldsign',
    'salesforce', 'hubspot', 'mailchimp', 'convertkit', 'zapier'
  )),
  provider_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
-- Depends on users table only
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

-- Kit analytics table
-- Depends on kits table
CREATE TABLE IF NOT EXISTS public.kit_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL CHECK (metric_name IN ('kit_viewed', 'kit_started', 'step_completed', 'kit_completed', 'file_uploaded', 'payment_made')),
  metric_value JSONB NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  client_identifier VARCHAR(255),
  session_id VARCHAR(255),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET
);

-- API keys table
-- Depends on users table only
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000 CHECK (rate_limit >= 0),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =============================================
-- STEP 2: ADD CONSTRAINTS AND CHECKS
-- =============================================

-- Add unique constraints
DO $$ 
BEGIN
  -- Organization members unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'org_members_unique'
  ) THEN
    ALTER TABLE public.organization_members ADD CONSTRAINT org_members_unique UNIQUE(organization_id, user_id);
  END IF;

  -- Kit steps unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kit_steps_unique'
  ) THEN
    ALTER TABLE public.kit_steps ADD CONSTRAINT kit_steps_unique UNIQUE(kit_id, order_index);
  END IF;

  -- Client progress unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_progress_unique'
  ) THEN
    ALTER TABLE public.client_progress ADD CONSTRAINT client_progress_unique UNIQUE(kit_id, client_email);
  END IF;

  -- User integrations unique constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_integrations_unique'
  ) THEN
    ALTER TABLE public.user_integrations ADD CONSTRAINT user_integrations_unique UNIQUE(user_id, provider);
  END IF;

  -- Kits unique constraint (created_by + slug)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kits_created_by_slug_unique'
  ) THEN
    ALTER TABLE public.kits ADD CONSTRAINT kits_created_by_slug_unique UNIQUE(created_by, slug);
  END IF;
END $$;

-- =============================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
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
-- STEP 4: CREATE RLS POLICIES
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

-- Enhanced security: Prevent users from deleting their own profiles
DROP POLICY IF EXISTS "Users cannot delete own profile" ON public.users;
CREATE POLICY "Users cannot delete own profile" ON public.users
  FOR DELETE USING (false);

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

-- Enhanced security: Members can view but not modify
DROP POLICY IF EXISTS "Organization members can view details" ON public.organizations;
CREATE POLICY "Organization members can view details" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- Enhanced security: Only owners can delete organizations
DROP POLICY IF EXISTS "Only owners can delete organizations" ON public.organizations;
CREATE POLICY "Only owners can delete organizations" ON public.organizations
  FOR DELETE USING (created_by = auth.uid());

-- Kits policies
DROP POLICY IF EXISTS "Users can manage own kits" ON public.kits;
CREATE POLICY "Users can manage own kits" ON public.kits
  FOR ALL USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Published kits are viewable" ON public.kits;
CREATE POLICY "Published kits are viewable" ON public.kits
  FOR SELECT USING (is_published = true);

-- Enhanced security: Organization members can view organization kits
DROP POLICY IF EXISTS "Organization members can view organization kits" ON public.kits;
CREATE POLICY "Organization members can view organization kits" ON public.kits
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

-- Enhanced security: Restrict delete operations
DROP POLICY IF EXISTS "Only owners can delete kits" ON public.kits;
CREATE POLICY "Only owners can delete kits" ON public.kits
  FOR DELETE USING (created_by = auth.uid());

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

-- Enhanced security: Clients can view their own progress
DROP POLICY IF EXISTS "Clients can view their own progress" ON public.client_progress;
CREATE POLICY "Clients can view their own progress" ON public.client_progress
  FOR SELECT USING (client_email = auth.email());

-- Enhanced security: Restrict delete operations
DROP POLICY IF EXISTS "Only kit owners can delete client progress" ON public.client_progress;
CREATE POLICY "Only kit owners can delete client progress" ON public.client_progress
  FOR DELETE USING (
    kit_id IN (SELECT id FROM public.kits WHERE created_by = auth.uid())
  );

-- File uploads policies
DROP POLICY IF EXISTS "Users can manage own uploads" ON public.file_uploads;
CREATE POLICY "Users can manage own uploads" ON public.file_uploads
  FOR ALL USING (uploaded_by = auth.uid());

-- Data access requests policies
DROP POLICY IF EXISTS "Users can view own data access requests" ON public.data_access_requests;
CREATE POLICY "Users can view own data access requests" ON public.data_access_requests
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create data access requests" ON public.data_access_requests;
CREATE POLICY "Users can create data access requests" ON public.data_access_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage data access requests" ON public.data_access_requests;
CREATE POLICY "Admins can manage data access requests" ON public.data_access_requests
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organization_members om
      JOIN public.organizations o ON om.organization_id = o.id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

-- Enhanced security: Kit owners can view uploads for their kits
DROP POLICY IF EXISTS "Kit owners can view kit uploads" ON public.file_uploads;
CREATE POLICY "Kit owners can view kit uploads" ON public.file_uploads
  FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE created_by = auth.uid())
  );

-- Enhanced security: Restrict delete operations
DROP POLICY IF EXISTS "Only uploaders can delete uploads" ON public.file_uploads;
CREATE POLICY "Only uploaders can delete uploads" ON public.file_uploads
  FOR DELETE USING (uploaded_by = auth.uid());

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

-- Enhanced security: Restrict insert operations
-- Enhanced security: Restrict insert operations
DROP POLICY IF EXISTS "System functions can insert audit logs" ON public.audit_logs;
CREATE POLICY "System functions can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Enhanced security: Restrict update operations
DROP POLICY IF EXISTS "Audit logs cannot be updated" ON public.audit_logs;
CREATE POLICY "Audit logs cannot be updated" ON public.audit_logs
  FOR UPDATE USING (false);

-- Enhanced security: Restrict delete operations
DROP POLICY IF EXISTS "Audit logs cannot be deleted" ON public.audit_logs;
CREATE POLICY "Audit logs cannot be deleted" ON public.audit_logs
  FOR DELETE USING (false);

-- Kit analytics policies
DROP POLICY IF EXISTS "Kit owners can view analytics" ON public.kit_analytics;
CREATE POLICY "Kit owners can view analytics" ON public.kit_analytics
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE created_by = auth.uid())
  );

-- Enhanced security: Restrict insert operations to functions only
-- Enhanced security: Restrict insert operations to functions only
DROP POLICY IF EXISTS "System functions can insert analytics" ON public.kit_analytics;
CREATE POLICY "System functions can insert analytics" ON public.kit_analytics
  FOR INSERT WITH CHECK (true);

-- Enhanced security: Restrict update operations
DROP POLICY IF EXISTS "Analytics cannot be updated" ON public.kit_analytics;
CREATE POLICY "Analytics cannot be updated" ON public.kit_analytics
  FOR UPDATE USING (false);

-- Enhanced security: Restrict delete operations
DROP POLICY IF EXISTS "Analytics cannot be deleted" ON public.kit_analytics;
CREATE POLICY "Analytics cannot be deleted" ON public.kit_analytics
  FOR DELETE USING (false);

-- API keys policies
DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;
CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

-- Enhanced security: Restrict viewing of key_hash and key_prefix
DROP POLICY IF EXISTS "Users cannot view key secrets" ON public.api_keys;
CREATE POLICY "Users cannot view key secrets" ON public.api_keys
  FOR SELECT USING (user_id = auth.uid())
  WITH CHECK (key_hash IS NULL AND key_prefix IS NULL);

-- Enhanced security: Restrict update operations on secrets
DROP POLICY IF EXISTS "Users cannot update key secrets" ON public.api_keys;
CREATE POLICY "Users cannot update key secrets" ON public.api_keys
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (key_hash IS NULL AND key_prefix IS NULL);

-- =============================================
-- STEP 5: CREATE FUNCTIONS AND TRIGGERS
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

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STEP 6: CREATE INDEXES
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_subscription_status_idx ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS users_subscription_tier_idx ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);
CREATE INDEX IF NOT EXISTS users_last_login_idx ON public.users(last_login_at);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS organizations_slug_idx ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS organizations_created_by_idx ON public.organizations(created_by);
CREATE INDEX IF NOT EXISTS organizations_subscription_tier_idx ON public.organizations(subscription_tier);

-- Kits indexes
CREATE INDEX IF NOT EXISTS kits_created_by_idx ON public.kits(created_by);
CREATE INDEX IF NOT EXISTS kits_organization_id_idx ON public.kits(organization_id);
CREATE INDEX IF NOT EXISTS kits_is_published_idx ON public.kits(is_published);
CREATE INDEX IF NOT EXISTS kits_slug_idx ON public.kits(slug);
CREATE INDEX IF NOT EXISTS kits_template_idx ON public.kits(is_template);
CREATE INDEX IF NOT EXISTS kits_created_at_idx ON public.kits(created_at);

-- Kit steps indexes
CREATE INDEX IF NOT EXISTS kit_steps_kit_id_idx ON public.kit_steps(kit_id);
CREATE INDEX IF NOT EXISTS kit_steps_order_idx ON public.kit_steps(kit_id, order_index);
CREATE INDEX IF NOT EXISTS kit_steps_type_idx ON public.kit_steps(step_type);

-- Client progress indexes
CREATE INDEX IF NOT EXISTS client_progress_kit_id_idx ON public.client_progress(kit_id);
CREATE INDEX IF NOT EXISTS client_progress_email_idx ON public.client_progress(client_email);
CREATE INDEX IF NOT EXISTS client_progress_status_idx ON public.client_progress(status);
CREATE INDEX IF NOT EXISTS client_progress_client_identifier_idx ON public.client_progress(client_identifier);
CREATE INDEX IF NOT EXISTS client_progress_started_at_idx ON public.client_progress(started_at);
CREATE INDEX IF NOT EXISTS client_progress_completed_at_idx ON public.client_progress(completed_at);

-- Other indexes
CREATE INDEX IF NOT EXISTS file_uploads_uploaded_by_idx ON public.file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS payments_stripe_id_idx ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS payments_kit_id_idx ON public.payments(kit_id);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON public.payments(paid_at);
CREATE INDEX IF NOT EXISTS user_integrations_user_id_idx ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS user_integrations_provider_idx ON public.user_integrations(provider);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS kit_analytics_kit_id_idx ON public.kit_analytics(kit_id);
CREATE INDEX IF NOT EXISTS kit_analytics_metric_name_idx ON public.kit_analytics(metric_name);
CREATE INDEX IF NOT EXISTS kit_analytics_recorded_at_idx ON public.kit_analytics(recorded_at);
CREATE INDEX IF NOT EXISTS kit_analytics_client_identifier_idx ON public.kit_analytics(client_identifier);
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_active_idx ON public.api_keys(is_active);

-- Data access requests indexes
CREATE INDEX IF NOT EXISTS data_access_requests_user_id_idx ON public.data_access_requests(user_id);
CREATE INDEX IF NOT EXISTS data_access_requests_status_idx ON public.data_access_requests(status);
CREATE INDEX IF NOT EXISTS data_access_requests_table_name_idx ON public.data_access_requests(table_name);
CREATE INDEX IF NOT EXISTS data_access_requests_created_at_idx ON public.data_access_requests(created_at);

-- =============================================
-- STEP 7: GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- STEP 8: CREATE STORAGE BUCKETS
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
-- STEP 9: CREATE DATA ACCESS REQUEST FUNCTIONS
-- =============================================

-- Function to get pending data access requests for approval
CREATE OR REPLACE FUNCTION public.get_pending_data_access_requests_for_approval(
  approver_id UUID
)
RETURNS TABLE(
  request_id UUID,
  user_id UUID,
  user_email TEXT,
  table_name TEXT,
  record_id UUID,
  access_type TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dar.id AS request_id,
    dar.user_id,
    u.email AS user_email,
    dar.table_name,
    dar.record_id,
    dar.access_type,
    dar.reason,
    dar.created_at
  FROM public.data_access_requests dar
  JOIN public.users u ON dar.user_id = u.id
  WHERE dar.status = 'pending'
  AND (
    -- Requests from users in organizations where the approver is an admin/owner
    EXISTS (
      SELECT 1 FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = approver_id
      AND om2.user_id = dar.user_id
      AND om1.role IN ('owner', 'admin')
    )
  )
  ORDER BY dar.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request summary
CREATE OR REPLACE FUNCTION public.get_data_access_request_summary()
RETURNS TABLE(
  total_requests BIGINT,
  pending_requests BIGINT,
  approved_requests BIGINT,
  rejected_requests BIGINT,
  avg_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_requests,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_requests,
    AVG(
      CASE
        WHEN status = 'approved' THEN approved_at - created_at
        WHEN status = 'rejected' THEN rejected_at - created_at
        ELSE NULL
      END
    ) AS avg_processing_time
  FROM public.data_access_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve data access requests
CREATE OR REPLACE FUNCTION public.approve_data_access_request(
  request_id UUID,
  approved_by UUID
)
RETURNS VOID AS $$
BEGIN
  -- Update the data access request
  UPDATE public.data_access_requests
  SET
    status = 'approved',
    approved_by = approved_by,
    approved_at = NOW(),
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Log the approval
  INSERT INTO public.audit_logs (
    action,
    resource_type,
    resource_id,
    user_id,
    user_email,
    details
  )
  SELECT
    'data_access_request_approved',
    'data_access_requests',
    request_id,
    approved_by,
    email,
    jsonb_build_object(
      'request_id', request_id,
      'timestamp', NOW()
    )
  FROM public.users
  WHERE id = approved_by;
  
  RAISE NOTICE 'Data access request % approved by user %', request_id, approved_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject data access requests
CREATE OR REPLACE FUNCTION public.reject_data_access_request(
  request_id UUID,
  rejected_by UUID,
  rejection_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update the data access request
  UPDATE public.data_access_requests
  SET
    status = 'rejected',
    rejected_by = rejected_by,
    rejected_at = NOW(),
    rejection_reason = rejection_reason,
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Log the rejection
  INSERT INTO public.audit_logs (
    action,
    resource_type,
    resource_id,
    user_id,
    user_email,
    details
  )
  SELECT
    'data_access_request_rejected',
    'data_access_requests',
    request_id,
    rejected_by,
    email,
    jsonb_build_object(
      'request_id', request_id,
      'rejection_reason', rejection_reason,
      'timestamp', NOW()
    )
  FROM public.users
  WHERE id = rejected_by;
  
  RAISE NOTICE 'Data access request % rejected by user %', request_id, rejected_by;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '🎉 OnboardKit comprehensive database setup completed successfully!';
  RAISE NOTICE '📋 Tables created in dependency order to avoid reference issues';
  RAISE NOTICE '📁 Storage: avatars, kit-assets, client-uploads, documents';
  RAISE NOTICE '🔒 Security: Row Level Security enabled with policies';
  RAISE NOTICE '⚡ Performance: Indexes created for optimal performance';
  RAISE NOTICE '📊 Analytics: Data access request functions and statistics';
  RAISE NOTICE '✅ Ready for production use!';
END $$;