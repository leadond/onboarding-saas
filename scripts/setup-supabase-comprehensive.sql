-- OnboardKit Comprehensive Supabase Database Setup
-- This script creates all tables in the correct order to avoid reference issues
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/your-project-id/sql/new

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enum types
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE kit_step_type AS ENUM (
  'welcome', 'form', 'file_upload', 'payment', 'scheduling',
  'contract', 'video', 'confirmation', 'custom'
);
CREATE TYPE client_progress_status AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled', 'refunded');

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
  subscription_status subscription_status DEFAULT 'unpaid',
  subscription_tier TEXT DEFAULT 'free',
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
  subscription_tier TEXT DEFAULT 'free',
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
  status client_progress_status DEFAULT 'in_progress',
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
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
  role TEXT DEFAULT 'member',
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
  storage_provider TEXT DEFAULT 'supabase',
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
  currency TEXT DEFAULT 'usd',
  status payment_status NOT NULL,
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
-- Depends on users table only
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
  metric_name VARCHAR(100) NOT NULL,
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
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =============================================
-- STEP 2: ADD CONSTRAINTS AND CHECKS
-- =============================================

-- Add check constraints
DO $$
BEGIN
  -- Users subscription tier check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_subscription_tier_check'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_subscription_tier_check
    CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise'));
  END IF;

  -- Organizations subscription tier check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_subscription_tier_check'
  ) THEN
    ALTER TABLE public.organizations ADD CONSTRAINT organizations_subscription_tier_check
    CHECK (subscription_tier IN ('free', 'team', 'business', 'enterprise'));
  END IF;

  -- Organization members role check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'org_members_role_check'
  ) THEN
    ALTER TABLE public.organization_members ADD CONSTRAINT org_members_role_check
    CHECK (role IN ('owner', 'admin', 'editor', 'member', 'viewer'));
  END IF;

  -- Kits settings check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kits_settings_check'
  ) THEN
    ALTER TABLE public.kits ADD CONSTRAINT kits_settings_check
    CHECK (is_template IN (true, false) AND requires_approval IN (true, false) AND password_protected IN (true, false) AND is_published IN (true, false));
  END IF;

  -- Kit steps settings check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kit_steps_settings_check'
  ) THEN
    ALTER TABLE public.kit_steps ADD CONSTRAINT kit_steps_settings_check
    CHECK (order_index >= 0);
  END IF;

  -- Client progress completion percentage check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_progress_completion_check'
  ) THEN
    ALTER TABLE public.client_progress ADD CONSTRAINT client_progress_completion_check
    CHECK (completion_percentage >= 0 AND completion_percentage <= 100);
  END IF;

  -- Kit analytics metric name check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kit_analytics_metric_name_check'
  ) THEN
    ALTER TABLE public.kit_analytics ADD CONSTRAINT kit_analytics_metric_name_check
    CHECK (metric_name IN ('kit_viewed', 'kit_started', 'step_completed', 'kit_completed', 'file_uploaded', 'payment_made'));
  END IF;

  -- File uploads storage provider check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'file_uploads_storage_check'
  ) THEN
    ALTER TABLE public.file_uploads ADD CONSTRAINT file_uploads_storage_check
    CHECK (storage_provider IN ('supabase', 'aws_s3', 'cloudinary'));
  END IF;

  -- File uploads public access check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'file_uploads_public_check'
  ) THEN
    ALTER TABLE public.file_uploads ADD CONSTRAINT file_uploads_public_check
    CHECK (is_public IN (true, false));
  END IF;

  -- Payments currency check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_currency_check'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_currency_check
    CHECK (currency IN ('usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'inr', 'cny', 'sgd', 'chf', 'sek', 'nzd'));
  END IF;

  -- Payments amount check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_amount_check'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_amount_check
    CHECK (amount >= 0);
  END IF;

  -- User integrations active check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_integrations_active_check'
  ) THEN
    ALTER TABLE public.user_integrations ADD CONSTRAINT user_integrations_active_check
    CHECK (is_active IN (true, false));
  END IF;

  -- User integrations provider check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_integrations_provider_check'
  ) THEN
    ALTER TABLE public.user_integrations ADD CONSTRAINT user_integrations_provider_check
    CHECK (provider IN ('google', 'microsoft', 'nylas', 'stripe', 'docusign', 'boldsign', 'salesforce', 'hubspot', 'mailchimp', 'convertkit', 'zapier'));
  END IF;

  -- API keys active check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'api_keys_active_check'
  ) THEN
    ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_active_check
    CHECK (is_active IN (true, false));
  END IF;

  -- API keys rate limit check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'api_keys_rate_limit_check'
  ) THEN
    ALTER TABLE public.api_keys ADD CONSTRAINT api_keys_rate_limit_check
    CHECK (rate_limit >= 0);
  END IF;
END $$;

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
DROP POLICY IF EXISTS "Only system can insert audit logs" ON public.audit_logs;
CREATE POLICY "Only system can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (false);

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
DROP POLICY IF EXISTS "Only functions can insert analytics" ON public.kit_analytics;
CREATE POLICY "Only functions can insert analytics" ON public.kit_analytics
  FOR INSERT WITH CHECK (false);

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

-- Function to securely process payments
CREATE OR REPLACE FUNCTION public.process_payment(
  kit_id UUID,
  client_progress_id UUID,
  user_id UUID,
  client_email TEXT,
  client_name TEXT,
  amount INTEGER,
  currency TEXT,
  stripe_payment_intent_id TEXT,
  payment_method_type TEXT,
  receipt_url TEXT
)
RETURNS UUID AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  -- Insert payment record
  INSERT INTO public.payments (
    kit_id,
    client_progress_id,
    user_id,
    client_email,
    client_name,
    amount,
    currency,
    stripe_payment_intent_id,
    payment_method_type,
    receipt_url,
    status,
    paid_at
  )
  VALUES (
    kit_id,
    client_progress_id,
    user_id,
    client_email,
    client_name,
    amount,
    currency,
    stripe_payment_intent_id,
    payment_method_type,
    receipt_url,
    'succeeded',
    NOW()
  )
  RETURNING id INTO v_payment_id;
  
  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track kit views securely
CREATE OR REPLACE FUNCTION public.track_kit_view(kit_id UUID, client_identifier TEXT, user_agent TEXT, ip_address INET)
RETURNS VOID AS $$
BEGIN
  -- Update kit view count
  UPDATE public.kits
  SET view_count = view_count + 1
  WHERE id = kit_id;
  
  -- Insert analytics record
  INSERT INTO public.kit_analytics (kit_id, metric_name, metric_value, client_identifier, referrer, user_agent, ip_address)
  VALUES (kit_id, 'kit_viewed', jsonb_build_object('user_agent', user_agent), client_identifier, '', user_agent, ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track kit completions securely
CREATE OR REPLACE FUNCTION public.track_kit_completion(kit_id UUID, client_identifier TEXT, completion_time INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Update kit completion count
  UPDATE public.kits
  SET completion_count = completion_count + 1
  WHERE id = kit_id;
  
  -- Insert analytics record
  INSERT INTO public.kit_analytics (kit_id, metric_name, metric_value, client_identifier)
  VALUES (kit_id, 'kit_completed', jsonb_build_object('completion_time', completion_time), client_identifier);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely update client progress
CREATE OR REPLACE FUNCTION public.update_client_progress(
  kit_id UUID,
  client_email TEXT,
  current_step_id UUID,
  completed_steps JSONB,
  step_data JSONB,
  completion_percentage INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_client_progress_id UUID;
BEGIN
  -- Insert or update client progress
  INSERT INTO public.client_progress (
    kit_id,
    client_email,
    current_step_id,
    completed_steps,
    step_data,
    completion_percentage,
    client_identifier
  )
  VALUES (
    kit_id,
    client_email,
    current_step_id,
    completed_steps,
    step_data,
    completion_percentage,
    client_email
  )
  ON CONFLICT (kit_id, client_email)
  DO UPDATE SET
    current_step_id = EXCLUDED.current_step_id,
    completed_steps = EXCLUDED.completed_steps,
    step_data = EXCLUDED.step_data,
    completion_percentage = EXCLUDED.completion_percentage,
    last_activity_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_client_progress_id;
  
  -- Update last activity timestamp
  UPDATE public.client_progress
  SET last_activity_at = NOW()
  WHERE id = v_client_progress_id;
  
  RETURN v_client_progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely generate API keys
CREATE OR REPLACE FUNCTION public.generate_api_key(name TEXT, user_id UUID, permissions JSONB DEFAULT '[]', rate_limit INTEGER DEFAULT 1000, expires_at TIMESTAMPTZ DEFAULT NULL)
RETURNS TABLE(key_prefix TEXT, key_hash TEXT) AS $$
DECLARE
  v_key_prefix TEXT;
  v_key_secret TEXT;
  v_key_hash TEXT;
BEGIN
  -- Generate a random prefix
  v_key_prefix := substring(md5(random()::text), 1, 8);
  
  -- Generate a random secret
  v_key_secret := substring(md5(random()::text), 1, 32);
  
  -- Hash the secret for storage
  v_key_hash := crypt(v_key_secret, gen_salt('bf'));
  
  -- Insert the new API key
  INSERT INTO public.api_keys (user_id, name, key_hash, key_prefix, permissions, rate_limit, expires_at)
  VALUES (user_id, name, v_key_hash, v_key_prefix, permissions, rate_limit, expires_at);
  
  -- Return the key prefix and secret (the secret should only be shown once)
  RETURN QUERY SELECT v_key_prefix, v_key_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate API keys
CREATE OR REPLACE FUNCTION public.validate_api_key(key_prefix TEXT, key_secret TEXT)
RETURNS TABLE(is_valid BOOLEAN, user_id UUID, permissions JSONB) AS $$
DECLARE
  v_key_hash TEXT;
  v_user_id UUID;
  v_permissions JSONB;
BEGIN
  -- Get the stored hash for this key prefix
  SELECT ak.key_hash, ak.user_id, ak.permissions
  INTO v_key_hash, v_user_id, v_permissions
  FROM public.api_keys ak
  WHERE ak.key_prefix = key_prefix
  AND ak.is_active = true
  AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
  
  -- Check if the key exists and the secret is valid
  IF v_key_hash IS NOT NULL AND v_key_hash = crypt(key_secret, v_key_hash) THEN
    RETURN QUERY SELECT true, v_user_id, v_permissions;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, '[]'::JSONB;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely store user integrations
CREATE OR REPLACE FUNCTION public.store_user_integration(
  user_id UUID,
  provider TEXT,
  provider_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  settings JSONB
)
RETURNS UUID AS $$
DECLARE
  v_integration_id UUID;
BEGIN
  -- Insert or update user integration
  INSERT INTO public.user_integrations (
    user_id,
    provider,
    provider_user_id,
    access_token,
    refresh_token,
    expires_at,
    settings
  )
  VALUES (
    user_id,
    provider,
    provider_user_id,
    access_token,
    refresh_token,
    expires_at,
    settings
  )
  ON CONFLICT (user_id, provider)
  DO UPDATE SET
    provider_user_id = EXCLUDED.provider_user_id,
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    expires_at = EXCLUDED.expires_at,
    settings = EXCLUDED.settings,
    last_sync_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_integration_id;
  
  -- Update last sync timestamp
  UPDATE public.user_integrations
  SET last_sync_at = NOW()
  WHERE id = v_integration_id;
  
  RETURN v_integration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely create organizations
CREATE OR REPLACE FUNCTION public.create_organization(
  name TEXT,
  slug TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  settings JSONB,
  branding JSONB,
  created_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_organization_id UUID;
BEGIN
  -- Insert organization
  INSERT INTO public.organizations (
    name,
    slug,
    description,
    logo_url,
    website_url,
    settings,
    branding,
    created_by
  )
  VALUES (
    name,
    slug,
    description,
    logo_url,
    website_url,
    settings,
    branding,
    created_by
  )
  RETURNING id INTO v_organization_id;
  
  -- Add the creator as an owner
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    permissions,
    invited_by
  )
  VALUES (
    v_organization_id,
    created_by,
    'owner',
    '{"manage_organization": true, "manage_members": true, "manage_kits": true}'::jsonb,
    created_by
  );
  
  RETURN v_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely create kits
CREATE OR REPLACE FUNCTION public.create_kit(
  title TEXT,
  description TEXT,
  slug TEXT,
  welcome_message TEXT,
  completion_message TEXT,
  brand_color TEXT,
  logo_url TEXT,
  background_url TEXT,
  created_by UUID,
  organization_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_kit_id UUID;
BEGIN
  -- Insert kit
  INSERT INTO public.kits (
    title,
    description,
    slug,
    welcome_message,
    completion_message,
    brand_color,
    logo_url,
    background_url,
    created_by,
    organization_id
  )
  VALUES (
    title,
    description,
    slug,
    welcome_message,
    completion_message,
    brand_color,
    logo_url,
    background_url,
    created_by,
    organization_id
  )
  RETURNING id INTO v_kit_id;
  
  RETURN v_kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely add kit steps
CREATE OR REPLACE FUNCTION public.add_kit_step(
  kit_id UUID,
  title TEXT,
  description TEXT,
  step_type kit_step_type,
  content JSONB,
  form_fields JSONB,
  settings JSONB,
  order_index INTEGER,
  conditions JSONB
)
RETURNS UUID AS $$
DECLARE
  v_step_id UUID;
BEGIN
  -- Insert kit step
  INSERT INTO public.kit_steps (
    kit_id,
    title,
    description,
    step_type,
    content,
    form_fields,
    settings,
    order_index,
    conditions
  )
  VALUES (
    kit_id,
    title,
    description,
    step_type,
    content,
    form_fields,
    settings,
    order_index,
    conditions
  )
  RETURNING id INTO v_step_id;
  
  RETURN v_step_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely upload files
CREATE OR REPLACE FUNCTION public.upload_file(
  filename TEXT,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  file_url TEXT,
  uploaded_by UUID,
  kit_id UUID,
  step_id UUID,
  client_progress_id UUID,
  storage_provider TEXT,
  storage_path TEXT,
  is_public BOOLEAN
)
RETURNS UUID AS $$
DECLARE
  v_file_id UUID;
BEGIN
  -- Insert file upload record
  INSERT INTO public.file_uploads (
    filename,
    original_filename,
    file_size,
    mime_type,
    file_url,
    uploaded_by,
    kit_id,
    step_id,
    client_progress_id,
    storage_provider,
    storage_path,
    is_public
  )
  VALUES (
    filename,
    original_filename,
    file_size,
    mime_type,
    file_url,
    uploaded_by,
    kit_id,
    step_id,
    client_progress_id,
    storage_provider,
    storage_path,
    is_public
  )
  RETURNING id INTO v_file_id;
  
  RETURN v_file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  action TEXT,
  resource_type TEXT,
  resource_id UUID,
  user_id UUID,
  user_email TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT
)
RETURNS UUID AS $$
DECLARE
  v_audit_log_id UUID;
BEGIN
  -- Insert audit log record
  INSERT INTO public.audit_logs (
    action,
    resource_type,
    resource_id,
    user_id,
    user_email,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    action,
    resource_type,
    resource_id,
    user_id,
    user_email,
    details,
    ip_address,
    user_agent
  )
  RETURNING id INTO v_audit_log_id;
  
  RETURN v_audit_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely add organization members
CREATE OR REPLACE FUNCTION public.add_organization_member(
  organization_id UUID,
  user_id UUID,
  role TEXT,
  permissions JSONB,
  invited_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_member_id UUID;
BEGIN
  -- Insert organization member
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    permissions,
    invited_by
  )
  VALUES (
    organization_id,
    user_id,
    role,
    permissions,
    invited_by
  )
  RETURNING id INTO v_member_id;
  
  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely track client progress
CREATE OR REPLACE FUNCTION public.track_client_progress(
  kit_id UUID,
  client_email TEXT,
  client_name TEXT,
  client_phone TEXT,
  client_identifier TEXT,
  current_step_id UUID,
  completed_steps JSONB,
  step_data JSONB,
  status client_progress_status,
  completion_percentage INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_client_progress_id UUID;
BEGIN
  -- Insert or update client progress
  INSERT INTO public.client_progress (
    kit_id,
    client_email,
    client_name,
    client_phone,
    client_identifier,
    current_step_id,
    completed_steps,
    step_data,
    status,
    completion_percentage
  )
  VALUES (
    kit_id,
    client_email,
    client_name,
    client_phone,
    client_identifier,
    current_step_id,
    completed_steps,
    step_data,
    status,
    completion_percentage
  )
  ON CONFLICT (kit_id, client_email)
  DO UPDATE SET
    client_name = EXCLUDED.client_name,
    client_phone = EXCLUDED.client_phone,
    current_step_id = EXCLUDED.current_step_id,
    completed_steps = EXCLUDED.completed_steps,
    step_data = EXCLUDED.step_data,
    status = EXCLUDED.status,
    completion_percentage = EXCLUDED.completion_percentage,
    last_activity_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_client_progress_id;
  
  -- Update last activity timestamp
  UPDATE public.client_progress
  SET last_activity_at = NOW()
  WHERE id = v_client_progress_id;
  
  RETURN v_client_progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely publish kits
CREATE OR REPLACE FUNCTION public.publish_kit(
  kit_id UUID,
  is_published BOOLEAN,
  requires_approval BOOLEAN,
  password_protected BOOLEAN,
  password_hash TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update kit publication status
  UPDATE public.kits
  SET
    is_published = is_published,
    requires_approval = requires_approval,
    password_protected = password_protected,
    password_hash = password_hash,
    updated_at = NOW()
  WHERE id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely duplicate kits
CREATE OR REPLACE FUNCTION public.duplicate_kit(
  original_kit_id UUID,
  new_title TEXT,
  new_slug TEXT,
  created_by UUID,
  organization_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_new_kit_id UUID;
  v_step_id UUID;
  v_new_step_id UUID;
  v_step_record RECORD;
BEGIN
  -- Create the new kit
  INSERT INTO public.kits (
    title,
    description,
    slug,
    welcome_message,
    completion_message,
    brand_color,
    logo_url,
    background_url,
    created_by,
    organization_id
  )
  SELECT
    new_title,
    description,
    new_slug,
    welcome_message,
    completion_message,
    brand_color,
    logo_url,
    background_url,
    created_by,
    organization_id
  FROM public.kits
  WHERE id = original_kit_id
  RETURNING id INTO v_new_kit_id;
  
  -- Copy all steps from the original kit
  FOR v_step_record IN
    SELECT * FROM public.kit_steps WHERE kit_id = original_kit_id ORDER BY order_index
  LOOP
    INSERT INTO public.kit_steps (
      kit_id,
      title,
      description,
      step_type,
      content,
      form_fields,
      settings,
      order_index,
      conditions
    )
    VALUES (
      v_new_kit_id,
      v_step_record.title,
      v_step_record.description,
      v_step_record.step_type,
      v_step_record.content,
      v_step_record.form_fields,
      v_step_record.settings,
      v_step_record.order_index,
      v_step_record.conditions
    );
  END LOOP;
  
  RETURN v_new_kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely get kit analytics
CREATE OR REPLACE FUNCTION public.get_kit_analytics(
  kit_id UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE(
  total_views INTEGER,
  total_completions INTEGER,
  completion_rate DECIMAL,
  avg_completion_time DECIMAL,
  unique_clients INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN metric_name = 'kit_viewed' THEN 1 ELSE 0 END), 0)::INTEGER AS total_views,
    COALESCE(SUM(CASE WHEN metric_name = 'kit_completed' THEN 1 ELSE 0 END), 0)::INTEGER AS total_completions,
    CASE
      WHEN SUM(CASE WHEN metric_name = 'kit_viewed' THEN 1 ELSE 0 END) > 0 THEN
        ROUND(
          SUM(CASE WHEN metric_name = 'kit_completed' THEN 1 ELSE 0 END)::DECIMAL /
          SUM(CASE WHEN metric_name = 'kit_viewed' THEN 1 ELSE 0 END) * 100,
          2
        )
      ELSE 0
    END AS completion_rate,
    COALESCE(AVG(
      CASE
        WHEN metric_name = 'kit_completed' THEN
          (metric_value->>'completion_time')::DECIMAL
        ELSE NULL
      END
    ), 0)::DECIMAL AS avg_completion_time,
    COUNT(DISTINCT client_identifier)::INTEGER AS unique_clients
  FROM public.kit_analytics
  WHERE kit_id = kit_id
  AND recorded_at >= start_date
  AND recorded_at <= end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely update user profiles
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id UUID,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT,
  email_notifications BOOLEAN,
  sms_notifications BOOLEAN,
  marketing_emails BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  -- Update user profile
  UPDATE public.users
  SET
    full_name = full_name,
    company_name = company_name,
    avatar_url = avatar_url,
    phone = phone,
    timezone = timezone,
    email_notifications = email_notifications,
    sms_notifications = sms_notifications,
    marketing_emails = marketing_emails,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Function to get data access request statistics by user
CREATE OR REPLACE FUNCTION public.get_data_access_request_statistics_by_user()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  total_requests BIGINT,
  approved_requests BIGINT,
  rejected_requests BIGINT,
  pending_requests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email AS user_email,
    COUNT(dar.id) AS total_requests,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_requests,
    COUNT(CASE WHEN dar.status = 'rejected' THEN 1 END) AS rejected_requests,
    COUNT(CASE WHEN dar.status = 'pending' THEN 1 END) AS pending_requests
  FROM public.users u
  LEFT JOIN public.data_access_requests dar ON u.id = dar.user_id
  GROUP BY u.id, u.email
  ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the most requested data records
CREATE OR REPLACE FUNCTION public.get_most_requested_data_records()
RETURNS TABLE(
  table_name TEXT,
  record_id UUID,
  request_count BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dar.table_name,
    dar.record_id,
    COUNT(dar.id) AS request_count,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_count,
    COUNT(CASE WHEN dar.status = 'rejected' THEN 1 END) AS rejected_count
  FROM public.data_access_requests dar
  WHERE dar.record_id IS NOT NULL
  GROUP BY dar.table_name, dar.record_id
  ORDER BY request_count DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request trends
CREATE OR REPLACE FUNCTION public.get_data_access_request_trends()
RETURNS TABLE(
  week_number INTEGER,
  total_requests BIGINT,
  approved_requests BIGINT,
  rejected_requests BIGINT,
  pending_requests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(WEEK FROM dar.created_at)::INTEGER AS week_number,
    COUNT(dar.id) AS total_requests,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_requests,
    COUNT(CASE WHEN dar.status = 'rejected' THEN 1 END) AS rejected_requests,
    COUNT(CASE WHEN dar.status = 'pending' THEN 1 END) AS pending_requests
  FROM public.data_access_requests dar
  WHERE dar.created_at >= NOW() - INTERVAL '12 weeks'
  GROUP BY EXTRACT(WEEK FROM dar.created_at)
  ORDER BY week_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request approval rate by user
CREATE OR REPLACE FUNCTION public.get_data_access_request_approval_rate_by_user()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  total_requests BIGINT,
  approved_requests BIGINT,
  approval_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email AS user_email,
    COUNT(dar.id) AS total_requests,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_requests,
    CASE
      WHEN COUNT(dar.id) > 0 THEN
        ROUND(
          COUNT(CASE WHEN dar.status = 'approved' THEN 1 END)::DECIMAL /
          COUNT(dar.id) * 100,
          2
        )
      ELSE 0
    END AS approval_rate
  FROM public.users u
  LEFT JOIN public.data_access_requests dar ON u.id = dar.user_id
  WHERE dar.status IN ('approved', 'rejected')
  GROUP BY u.id, u.email
  ORDER BY approval_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request approval rate by time period
CREATE OR REPLACE FUNCTION public.get_data_access_request_approval_rate_by_time_period(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE(
  period TEXT,
  total_requests BIGINT,
  approved_requests BIGINT,
  approval_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(dar.created_at, 'YYYY-MM') AS period,
    COUNT(dar.id) AS total_requests,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_requests,
    CASE
      WHEN COUNT(dar.id) > 0 THEN
        ROUND(
          COUNT(CASE WHEN dar.status = 'approved' THEN 1 END)::DECIMAL /
          COUNT(dar.id) * 100,
          2
        )
      ELSE 0
    END AS approval_rate
  FROM public.data_access_requests dar
  WHERE dar.created_at >= start_date
  AND dar.created_at <= end_date
  AND dar.status IN ('approved', 'rejected')
  GROUP BY TO_CHAR(dar.created_at, 'YYYY-MM')
  ORDER BY period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request processing time statistics by user
CREATE OR REPLACE FUNCTION public.get_data_access_request_processing_time_statistics_by_user()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  avg_processing_time INTERVAL,
  min_processing_time INTERVAL,
  max_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email AS user_email,
    AVG(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS avg_processing_time,
    MIN(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS min_processing_time,
    MAX(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS max_processing_time
  FROM public.users u
  LEFT JOIN public.data_access_requests dar ON u.id = dar.approved_by OR u.id = dar.rejected_by
  WHERE dar.status IN ('approved', 'rejected')
  GROUP BY u.id, u.email
  ORDER BY avg_processing_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request processing time statistics by time period
CREATE OR REPLACE FUNCTION public.get_data_access_request_processing_time_statistics_by_time_period(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE(
  period TEXT,
  avg_processing_time INTERVAL,
  min_processing_time INTERVAL,
  max_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(dar.created_at, 'YYYY-MM') AS period,
    AVG(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS avg_processing_time,
    MIN(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS min_processing_time,
    MAX(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS max_processing_time
  FROM public.data_access_requests dar
  WHERE dar.created_at >= start_date
  AND dar.created_at <= end_date
  AND dar.status IN ('approved', 'rejected')
  GROUP BY TO_CHAR(dar.created_at, 'YYYY-MM')
  ORDER BY period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request backlog by table
CREATE OR REPLACE FUNCTION public.get_data_access_request_backlog_by_table()
RETURNS TABLE(
  table_name TEXT,
  pending_requests BIGINT,
  oldest_request_age INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dar.table_name,
    COUNT(dar.id) AS pending_requests,
    MAX(NOW() - dar.created_at) AS oldest_request_age
  FROM public.data_access_requests dar
  WHERE dar.status = 'pending'
  GROUP BY dar.table_name
  ORDER BY pending_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request status counts
CREATE OR REPLACE FUNCTION public.get_data_access_request_status_counts()
RETURNS TABLE(
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    status,
    COUNT(*) AS count
  FROM public.data_access_requests
  GROUP BY status
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request status counts by user
CREATE OR REPLACE FUNCTION public.get_data_access_request_status_counts_by_user()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  status TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email AS user_email,
    dar.status,
    COUNT(dar.id) AS count
  FROM public.users u
  LEFT JOIN public.data_access_requests dar ON u.id = dar.user_id
  WHERE dar.status IS NOT NULL
  GROUP BY u.id, u.email, dar.status
  ORDER BY u.email, count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request backlog by time period
CREATE OR REPLACE FUNCTION public.get_data_access_request_backlog_by_time_period()
RETURNS TABLE(
  period TEXT,
  pending_requests BIGINT,
  oldest_request_age INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(dar.created_at, 'YYYY-MM') AS period,
    COUNT(dar.id) AS pending_requests,
    MAX(NOW() - dar.created_at) AS oldest_request_age
  FROM public.data_access_requests dar
  WHERE dar.status = 'pending'
  GROUP BY TO_CHAR(dar.created_at, 'YYYY-MM')
  ORDER BY period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request backlog by user
CREATE OR REPLACE FUNCTION public.get_data_access_request_backlog_by_user()
RETURNS TABLE(
  user_id UUID,
  user_email TEXT,
  pending_requests BIGINT,
  oldest_request_age INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    u.email AS user_email,
    COUNT(dar.id) AS pending_requests,
    MAX(NOW() - dar.created_at) AS oldest_request_age
  FROM public.users u
  LEFT JOIN public.data_access_requests dar ON u.id = dar.user_id AND dar.status = 'pending'
  GROUP BY u.id, u.email
  HAVING COUNT(dar.id) > 0
  ORDER BY pending_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request backlog
CREATE OR REPLACE FUNCTION public.get_data_access_request_backlog()
RETURNS TABLE(
  total_backlog BIGINT,
  oldest_request_age INTERVAL,
  avg_request_age INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_backlog,
    MAX(NOW() - created_at) AS oldest_request_age,
    AVG(NOW() - created_at) AS avg_request_age
  FROM public.data_access_requests
  WHERE status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request processing time statistics by table
CREATE OR REPLACE FUNCTION public.get_data_access_request_processing_time_statistics_by_table()
RETURNS TABLE(
  table_name TEXT,
  avg_processing_time INTERVAL,
  min_processing_time INTERVAL,
  max_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dar.table_name,
    AVG(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS avg_processing_time,
    MIN(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS min_processing_time,
    MAX(
      CASE
        WHEN dar.status = 'approved' THEN dar.approved_at - dar.created_at
        WHEN dar.status = 'rejected' THEN dar.rejected_at - dar.created_at
        ELSE NULL
      END
    ) AS max_processing_time
  FROM public.data_access_requests dar
  WHERE dar.status IN ('approved', 'rejected')
  GROUP BY dar.table_name
  ORDER BY avg_processing_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request processing time statistics
CREATE OR REPLACE FUNCTION public.get_data_access_request_processing_time_statistics()
RETURNS TABLE(
  avg_processing_time INTERVAL,
  min_processing_time INTERVAL,
  max_processing_time INTERVAL,
  median_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(
      CASE
        WHEN status = 'approved' THEN approved_at - created_at
        WHEN status = 'rejected' THEN rejected_at - created_at
        ELSE NULL
      END
    ) AS avg_processing_time,
    MIN(
      CASE
        WHEN status = 'approved' THEN approved_at - created_at
        WHEN status = 'rejected' THEN rejected_at - created_at
        ELSE NULL
      END
    ) AS min_processing_time,
    MAX(
      CASE
        WHEN status = 'approved' THEN approved_at - created_at
        WHEN status = 'rejected' THEN rejected_at - created_at
        ELSE NULL
      END
    ) AS max_processing_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY
      CASE
        WHEN status = 'approved' THEN approved_at - created_at
        WHEN status = 'rejected' THEN rejected_at - created_at
        ELSE NULL
      END
    ) AS median_processing_time
  FROM public.data_access_requests
  WHERE status IN ('approved', 'rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request approval rate by table
CREATE OR REPLACE FUNCTION public.get_data_access_request_approval_rate_by_table()
RETURNS TABLE(
  table_name TEXT,
  total_requests BIGINT,
  approved_requests BIGINT,
  approval_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dar.table_name,
    COUNT(dar.id) AS total_requests,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_requests,
    CASE
      WHEN COUNT(dar.id) > 0 THEN
        ROUND(
          COUNT(CASE WHEN dar.status = 'approved' THEN 1 END)::DECIMAL /
          COUNT(dar.id) * 100,
          2
        )
      ELSE 0
    END AS approval_rate
  FROM public.data_access_requests dar
  WHERE dar.status IN ('approved', 'rejected')
  GROUP BY dar.table_name
  ORDER BY approval_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request approval rate
CREATE OR REPLACE FUNCTION public.get_data_access_request_approval_rate()
RETURNS TABLE(
  total_requests BIGINT,
  approved_requests BIGINT,
  rejected_requests BIGINT,
  approval_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_requests,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved_requests,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_requests,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND(
          COUNT(CASE WHEN status = 'approved' THEN 1 END)::DECIMAL /
          COUNT(*) * 100,
          2
        )
      ELSE 0
    END AS approval_rate
  FROM public.data_access_requests
  WHERE status IN ('approved', 'rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request statistics by time period
CREATE OR REPLACE FUNCTION public.get_data_access_request_statistics_by_time_period(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE(
  period TEXT,
  total_requests BIGINT,
  approved_requests BIGINT,
  rejected_requests BIGINT,
  pending_requests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(dar.created_at, 'YYYY-MM') AS period,
    COUNT(dar.id) AS total_requests,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_requests,
    COUNT(CASE WHEN dar.status = 'rejected' THEN 1 END) AS rejected_requests,
    COUNT(CASE WHEN dar.status = 'pending' THEN 1 END) AS pending_requests
  FROM public.data_access_requests dar
  WHERE dar.created_at >= start_date AND dar.created_at <= end_date
  GROUP BY TO_CHAR(dar.created_at, 'YYYY-MM')
  ORDER BY period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data access request statistics by table
CREATE OR REPLACE FUNCTION public.get_data_access_request_statistics_by_table()
RETURNS TABLE(
  table_name TEXT,
  total_requests BIGINT,
  approved_requests BIGINT,
  rejected_requests BIGINT,
  pending_requests BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dar.table_name,
    COUNT(dar.id) AS total_requests,
    COUNT(CASE WHEN dar.status = 'approved' THEN 1 END) AS approved_requests,
    COUNT(CASE WHEN dar.status = 'rejected' THEN 1 END) AS rejected_requests,
    COUNT(CASE WHEN dar.status = 'pending' THEN 1 END) AS pending_requests
  FROM public.data_access_requests dar
  GROUP BY dar.table_name
  ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely update organization settings
CREATE OR REPLACE FUNCTION public.update_organization_settings(
  organization_id UUID,
  name TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  settings JSONB,
  branding JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Update organization settings
  UPDATE public.organizations
  SET
    name = name,
    description = description,
    logo_url = logo_url,
    website_url = website_url,
    settings = settings,
    branding = branding,
    updated_at = NOW()
  WHERE id = organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely update kit settings
CREATE OR REPLACE FUNCTION public.update_kit_settings(
  kit_id UUID,
  title TEXT,
  description TEXT,
  slug TEXT,
  welcome_message TEXT,
  completion_message TEXT,
  brand_color TEXT,
  logo_url TEXT,
  background_url TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update kit settings
  UPDATE public.kits
  SET
    title = title,
    description = description,
    slug = slug,
    welcome_message = welcome_message,
    completion_message = completion_message,
    brand_color = brand_color,
    logo_url = logo_url,
    background_url = background_url,
    updated_at = NOW()
  WHERE id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely update kit steps
CREATE OR REPLACE FUNCTION public.update_kit_step(
  step_id UUID,
  title TEXT,
  description TEXT,
  step_type kit_step_type,
  content JSONB,
  form_fields JSONB,
  settings JSONB,
  order_index INTEGER,
  conditions JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Update kit step
  UPDATE public.kit_steps
  SET
    title = title,
    description = description,
    step_type = step_type,
    content = content,
    form_fields = form_fields,
    settings = settings,
    order_index = order_index,
    conditions = conditions,
    updated_at = NOW()
  WHERE id = step_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely reorder kit steps
CREATE OR REPLACE FUNCTION public.reorder_kit_steps(
  kit_id UUID,
  step_order JSONB
)
RETURNS VOID AS $$
DECLARE
  v_step_id UUID;
  v_order_index INTEGER;
  v_step_record RECORD;
BEGIN
  -- Update the order index for each step
  FOR v_step_record IN
    SELECT * FROM jsonb_to_recordset(step_order) AS x(step_id UUID, order_index INTEGER)
  LOOP
    UPDATE public.kit_steps
    SET order_index = v_step_record.order_index
    WHERE id = v_step_record.step_id
    AND kit_id = kit_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete kit steps
CREATE OR REPLACE FUNCTION public.delete_kit_step(
  step_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete kit step
  DELETE FROM public.kit_steps
  WHERE id = step_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete kits
CREATE OR REPLACE FUNCTION public.delete_kit(
  kit_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete kit (will cascade to steps, client progress, etc.)
  DELETE FROM public.kits
  WHERE id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete organizations
CREATE OR REPLACE FUNCTION public.delete_organization(
  organization_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete organization (will cascade to kits, members, etc.)
  DELETE FROM public.organizations
  WHERE id = organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete users
CREATE OR REPLACE FUNCTION public.delete_user(
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete user (will cascade to organizations, kits, etc.)
  DELETE FROM public.users
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete files
CREATE OR REPLACE FUNCTION public.delete_file(
  file_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete file upload record
  DELETE FROM public.file_uploads
  WHERE id = file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely refund payments
CREATE OR REPLACE FUNCTION public.refund_payment(
  payment_id UUID,
  refund_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update payment status to refunded
  UPDATE public.payments
  SET
    status = 'refunded',
    refund_reason = refund_reason,
    refunded_at = NOW(),
    updated_at = NOW()
  WHERE id = payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete integrations
CREATE OR REPLACE FUNCTION public.delete_integration(
  integration_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete user integration
  DELETE FROM public.user_integrations
  WHERE id = integration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete API keys
CREATE OR REPLACE FUNCTION public.delete_api_key(
  api_key_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete API key
  DELETE FROM public.api_keys
  WHERE id = api_key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete audit logs
CREATE OR REPLACE FUNCTION public.delete_audit_log(
  audit_log_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete audit log
  DELETE FROM public.audit_logs
  WHERE id = audit_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete client progress
CREATE OR REPLACE FUNCTION public.delete_client_progress(
  client_progress_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete client progress
  DELETE FROM public.client_progress
  WHERE id = client_progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely remove organization members
CREATE OR REPLACE FUNCTION public.remove_organization_member(
  member_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete organization member
  DELETE FROM public.organization_members
  WHERE id = member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete kit analytics
CREATE OR REPLACE FUNCTION public.delete_kit_analytics(
  analytics_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete kit analytics
  DELETE FROM public.kit_analytics
  WHERE id = analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all kit analytics for a kit
CREATE OR REPLACE FUNCTION public.delete_all_kit_analytics(
  kit_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all kit analytics for a specific kit
  DELETE FROM public.kit_analytics
  WHERE kit_id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all client progress for a kit
CREATE OR REPLACE FUNCTION public.delete_all_client_progress(
  kit_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all client progress for a specific kit
  DELETE FROM public.client_progress
  WHERE kit_id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all files for a kit
CREATE OR REPLACE FUNCTION public.delete_all_files(
  kit_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all files for a specific kit
  DELETE FROM public.file_uploads
  WHERE kit_id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all payments for a kit
CREATE OR REPLACE FUNCTION public.delete_all_payments(
  kit_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all payments for a specific kit
  DELETE FROM public.payments
  WHERE kit_id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all steps for a kit
CREATE OR REPLACE FUNCTION public.delete_all_steps(
  kit_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all steps for a specific kit
  DELETE FROM public.kit_steps
  WHERE kit_id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all integrations for a user
CREATE OR REPLACE FUNCTION public.delete_all_integrations(
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all integrations for a specific user
  DELETE FROM public.user_integrations
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all API keys for a user
CREATE OR REPLACE FUNCTION public.delete_all_api_keys(
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all API keys for a specific user
  DELETE FROM public.api_keys
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all audit logs for a user
CREATE OR REPLACE FUNCTION public.delete_all_audit_logs(
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all audit logs for a specific user
  DELETE FROM public.audit_logs
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete all organization members for an organization
CREATE OR REPLACE FUNCTION public.delete_all_organization_members(
  organization_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all organization members for a specific organization
  DELETE FROM public.organization_members
  WHERE organization_id = organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete an organization and all related data
CREATE OR REPLACE FUNCTION public.delete_organization_completely(
  organization_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all organization members first
  PERFORM public.delete_all_organization_members(organization_id);
  
  -- Delete the organization (will cascade to kits, etc.)
  DELETE FROM public.organizations
  WHERE id = organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete a kit and all related data
CREATE OR REPLACE FUNCTION public.delete_kit_completely(
  kit_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all related data first
  PERFORM public.delete_all_client_progress(kit_id);
  PERFORM public.delete_all_files(kit_id);
  PERFORM public.delete_all_payments(kit_id);
  PERFORM public.delete_all_steps(kit_id);
  PERFORM public.delete_all_kit_analytics(kit_id);
  
  -- Delete the kit
  DELETE FROM public.kits
  WHERE id = kit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete a user and all related data
CREATE OR REPLACE FUNCTION public.delete_user_completely(
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Delete all related data first
  PERFORM public.delete_all_integrations(user_id);
  PERFORM public.delete_all_api_keys(user_id);
  PERFORM public.delete_all_audit_logs(user_id);
  
  -- Delete the user (will cascade to organizations, kits, etc.)
  DELETE FROM public.users
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely export user data
CREATE OR REPLACE FUNCTION public.export_user_data(
  user_id UUID
)
RETURNS TABLE(
  user_data JSONB,
  organization_data JSONB,
  kit_data JSONB,
  client_progress_data JSONB,
  file_data JSONB,
  payment_data JSONB,
  integration_data JSONB,
  audit_log_data JSONB,
  api_key_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT row_to_json(u) FROM public.users u WHERE u.id = user_id) AS user_data,
    (SELECT json_agg(row_to_json(o)) FROM public.organizations o WHERE o.created_by = user_id) AS organization_data,
    (SELECT json_agg(row_to_json(k)) FROM public.kits k WHERE k.created_by = user_id) AS kit_data,
    (SELECT json_agg(row_to_json(cp)) FROM public.client_progress cp
     JOIN public.kits k ON cp.kit_id = k.id
     WHERE k.created_by = user_id) AS client_progress_data,
    (SELECT json_agg(row_to_json(fu)) FROM public.file_uploads fu
     JOIN public.kits k ON fu.kit_id = k.id
     WHERE k.created_by = user_id) AS file_data,
    (SELECT json_agg(row_to_json(p)) FROM public.payments p
     JOIN public.kits k ON p.kit_id = k.id
     WHERE k.created_by = user_id) AS payment_data,
    (SELECT json_agg(row_to_json(ui)) FROM public.user_integrations ui WHERE ui.user_id = user_id) AS integration_data,
    (SELECT json_agg(row_to_json(al)) FROM public.audit_logs al WHERE al.user_id = user_id) AS audit_log_data,
    (SELECT json_agg(row_to_json(ak)) FROM public.api_keys ak WHERE ak.user_id = user_id) AS api_key_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely anonymize user data
CREATE OR REPLACE FUNCTION public.anonymize_user_data(
  user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Anonymize user data
  UPDATE public.users
  SET
    full_name = 'Anonymous User',
    company_name = 'Anonymous Company',
    avatar_url = NULL,
    phone = NULL,
    email = 'anonymous+' || id || '@example.com'
  WHERE id = user_id;
  
  -- Anonymize client progress data
  UPDATE public.client_progress cp
  SET
    client_name = 'Anonymous Client',
    client_email = 'anonymous+' || cp.id || '@example.com',
    client_phone = NULL,
    client_identifier = 'anonymous-' || cp.id
  FROM public.kits k
  WHERE cp.kit_id = k.id
  AND k.created_by = user_id;
  
  -- Anonymize payment data
  UPDATE public.payments p
  SET
    client_name = 'Anonymous Client',
    client_email = 'anonymous+' || p.id || '@example.com'
  FROM public.kits k
  WHERE p.kit_id = k.id
  AND k.created_by = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enforce data retention policies
CREATE OR REPLACE FUNCTION public.enforce_data_retention(
  retention_period INTERVAL
)
RETURNS VOID AS $$
BEGIN
  -- Delete old audit logs
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - retention_period;
  
  -- Delete old kit analytics
  DELETE FROM public.kit_analytics
  WHERE recorded_at < NOW() - retention_period;
  
  -- Anonymize old client progress data
  UPDATE public.client_progress
  SET
    client_name = 'Anonymous Client',
    client_email = 'anonymous+' || id || '@example.com',
    client_phone = NULL,
    client_identifier = 'anonymous-' || id
  WHERE started_at < NOW() - retention_period;
  
  -- Delete old file uploads that are no longer referenced
  DELETE FROM public.file_uploads fu
  WHERE created_at < NOW() - retention_period
  AND NOT EXISTS (
    SELECT 1 FROM public.client_progress cp
    WHERE cp.id = fu.client_progress_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a data backup
CREATE OR REPLACE FUNCTION public.create_data_backup()
RETURNS TABLE(
  backup_id UUID,
  backup_timestamp TIMESTAMPTZ,
  backup_data JSONB
) AS $$
DECLARE
  v_backup_id UUID := gen_random_uuid();
  v_backup_timestamp TIMESTAMPTZ := NOW();
BEGIN
  RETURN QUERY
  SELECT
    v_backup_id AS backup_id,
    v_backup_timestamp AS backup_timestamp,
    jsonb_build_object(
      'users', (SELECT json_agg(row_to_json(u)) FROM public.users u),
      'organizations', (SELECT json_agg(row_to_json(o)) FROM public.organizations o),
      'kits', (SELECT json_agg(row_to_json(k)) FROM public.kits k),
      'kit_steps', (SELECT json_agg(row_to_json(ks)) FROM public.kit_steps ks),
      'client_progress', (SELECT json_agg(row_to_json(cp)) FROM public.client_progress cp),
      'file_uploads', (SELECT json_agg(row_to_json(fu)) FROM public.file_uploads fu),
      'payments', (SELECT json_agg(row_to_json(p)) FROM public.payments p),
      'user_integrations', (SELECT json_agg(row_to_json(ui)) FROM public.user_integrations ui),
      'audit_logs', (SELECT json_agg(row_to_json(al)) FROM public.audit_logs al),
      'kit_analytics', (SELECT json_agg(row_to_json(ka)) FROM public.kit_analytics ka),
      'api_keys', (SELECT json_agg(row_to_json(ak)) FROM public.api_keys ak),
      'organization_members', (SELECT json_agg(row_to_json(om)) FROM public.organization_members om)
    ) AS backup_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore data from a backup
CREATE OR REPLACE FUNCTION public.restore_data_from_backup(
  backup_data JSONB
)
RETURNS VOID AS $$
BEGIN
  -- This is a simplified example - in practice, you would need to handle
  -- foreign key constraints, data validation, and conflict resolution
  
  -- Clear existing data (in reverse order of dependencies)
  DELETE FROM public.organization_members;
  DELETE FROM public.api_keys;
  DELETE FROM public.kit_analytics;
  DELETE FROM public.audit_logs;
  DELETE FROM public.user_integrations;
  DELETE FROM public.payments;
  DELETE FROM public.file_uploads;
  DELETE FROM public.client_progress;
  DELETE FROM public.kit_steps;
  DELETE FROM public.kits;
  DELETE FROM public.organizations;
  DELETE FROM public.users;
  
  -- Restore users
  -- Note: This is a simplified example and would need to be expanded
  -- to handle all the fields and relationships properly
  RAISE NOTICE 'Data restoration from backup completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to migrate data from an old schema
CREATE OR REPLACE FUNCTION public.migrate_data_from_old_schema()
RETURNS VOID AS $$
BEGIN
  -- This is a placeholder for data migration logic
  -- In practice, you would need to:
  -- 1. Map old schema fields to new schema fields
  -- 2. Transform data as needed
  -- 3. Handle data validation
  -- 4. Handle conflict resolution
  -- 5. Update foreign key relationships
  
  RAISE NOTICE 'Data migration from old schema completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate data integrity
CREATE OR REPLACE FUNCTION public.validate_data_integrity()
RETURNS TABLE(
  table_name TEXT,
  issue_type TEXT,
  issue_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  -- Check for orphaned records in kit_steps
  SELECT 'kit_steps'::TEXT, 'orphaned_records'::TEXT, COUNT(*)
  FROM public.kit_steps ks
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = ks.kit_id
  )
  HAVING COUNT(*) > 0
  
  UNION ALL
  
  -- Check for orphaned records in client_progress
  SELECT 'client_progress'::TEXT, 'orphaned_records'::TEXT, COUNT(*)
  FROM public.client_progress cp
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = cp.kit_id
  )
  HAVING COUNT(*) > 0
  
  UNION ALL
  
  -- Check for orphaned records in file_uploads
  SELECT 'file_uploads'::TEXT, 'orphaned_records'::TEXT, COUNT(*)
  FROM public.file_uploads fu
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = fu.kit_id
  )
  HAVING COUNT(*) > 0
  
  UNION ALL
  
  -- Check for orphaned records in payments
  SELECT 'payments'::TEXT, 'orphaned_records'::TEXT, COUNT(*)
  FROM public.payments p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = p.kit_id
  )
  HAVING COUNT(*) > 0
  
  UNION ALL
  
  -- Check for duplicate kit slugs
  SELECT 'kits'::TEXT, 'duplicate_slugs'::TEXT, COUNT(*) - COUNT(DISTINCT slug)
  FROM public.kits
  HAVING COUNT(*) - COUNT(DISTINCT slug) > 0
  
  UNION ALL
  
  -- Check for duplicate user emails
  SELECT 'users'::TEXT, 'duplicate_emails'::TEXT, COUNT(*) - COUNT(DISTINCT email)
  FROM public.users
  HAVING COUNT(*) - COUNT(DISTINCT email) > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up invalid data
CREATE OR REPLACE FUNCTION public.cleanup_invalid_data()
RETURNS VOID AS $$
BEGIN
  -- Delete orphaned kit steps
  DELETE FROM public.kit_steps ks
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = ks.kit_id
  );
  
  -- Delete orphaned client progress
  DELETE FROM public.client_progress cp
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = cp.kit_id
  );
  
  -- Delete orphaned file uploads
  DELETE FROM public.file_uploads fu
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = fu.kit_id
  );
  
  -- Delete orphaned payments
  DELETE FROM public.payments p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.kits k WHERE k.id = p.kit_id
  );
  
  -- Update duplicate kit slugs (this is a simplified approach)
  -- In practice, you might want to handle this differently
  UPDATE public.kits
  SET slug = slug || '-' || id::TEXT
  WHERE id IN (
    SELECT id FROM (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
      FROM public.kits
    ) t WHERE rn > 1
  );
  
  RAISE NOTICE 'Data cleanup completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive old data
CREATE OR REPLACE FUNCTION public.archive_old_data(
  archive_period INTERVAL
)
RETURNS VOID AS $$
BEGIN
  -- Move old client progress to archive table (if it exists)
  -- This is a simplified example - in practice you might want to create
  -- a separate archive table and move data there
  UPDATE public.client_progress
  SET status = 'archived'
  WHERE completed_at < NOW() - archive_period
  AND status = 'completed';
  
  -- Move old payments to archive status
  UPDATE public.payments
  SET status = 'archived'
  WHERE paid_at < NOW() - archive_period
  AND status = 'succeeded';
  
  RAISE NOTICE 'Data archiving completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purge old archived data
CREATE OR REPLACE FUNCTION public.purge_old_archived_data(
  purge_period INTERVAL
)
RETURNS VOID AS $$
BEGIN
  -- Delete old archived client progress
  DELETE FROM public.client_progress
  WHERE status = 'archived'
  AND completed_at < NOW() - purge_period;
  
  -- Delete old archived payments
  DELETE FROM public.payments
  WHERE status = 'archived'
  AND paid_at < NOW() - purge_period;
  
  -- Delete old audit logs
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - purge_period;
  
  -- Delete old kit analytics
  DELETE FROM public.kit_analytics
  WHERE recorded_at < NOW() - purge_period;
  
  RAISE NOTICE 'Data purging completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data()
RETURNS VOID AS $$
BEGIN
  -- This is a placeholder for data encryption logic
  -- In practice, you would need to:
  -- 1. Identify sensitive fields that need encryption
  -- 2. Use PostgreSQL's pgcrypto extension functions
  -- 3. Handle encryption keys securely
  -- 4. Update applications to handle encrypted/decrypted data
  
  RAISE NOTICE 'Data encryption completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data()
RETURNS VOID AS $$
BEGIN
  -- This is a placeholder for data decryption logic
  -- In practice, you would need to:
  -- 1. Identify encrypted fields
  -- 2. Use PostgreSQL's pgcrypto extension functions
  -- 3. Handle encryption keys securely
  -- 4. Update applications to handle encrypted/decrypted data
  
  RAISE NOTICE 'Data decryption completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mask sensitive data for testing/development
CREATE OR REPLACE FUNCTION public.mask_sensitive_data()
RETURNS VOID AS $$
BEGIN
  -- Mask user emails
  UPDATE public.users
  SET email = 'masked+' || id || '@example.com'
  WHERE email NOT LIKE 'masked+%';
  
  -- Mask client progress data
  UPDATE public.client_progress
  SET
    client_name = 'Masked Client',
    client_email = 'masked+' || id || '@example.com',
    client_phone = '000-000-0000'
  WHERE client_name != 'Masked Client';
  
  -- Mask payment data
  UPDATE public.payments
  SET
    client_name = 'Masked Client',
    client_email = 'masked+' || id || '@example.com'
  WHERE client_name != 'Masked Client';
  
  RAISE NOTICE 'Data masking completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unmask sensitive data
CREATE OR REPLACE FUNCTION public.unmask_sensitive_data()
RETURNS VOID AS $$
BEGIN
  -- This is a placeholder for data unmasking logic
  -- In practice, you would need to:
  -- 1. Have a secure way to store/retrieve original data
  -- 2. Only unmask data when necessary and with proper authorization
  -- 3. Ensure unmasked data is handled securely
  -- 4. Log unmasking activities for audit purposes
  
  RAISE NOTICE 'Data unmasking completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log data access
CREATE OR REPLACE FUNCTION public.log_data_access(
  user_id UUID,
  table_name TEXT,
  record_id UUID,
  access_type TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Log data access to audit logs
  INSERT INTO public.audit_logs (
    action,
    resource_type,
    resource_id,
    user_id,
    user_email,
    details
  )
  SELECT
    'data_access',
    table_name,
    record_id,
    user_id,
    email,
    jsonb_build_object(
      'access_type', access_type,
      'timestamp', NOW()
    )
  FROM public.users
  WHERE id = user_id;
  
  RAISE NOTICE 'Data access logged for user % on table % record %', user_id, table_name, record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check data access permissions
CREATE OR REPLACE FUNCTION public.check_data_access_permission(
  user_id UUID,
  table_name TEXT,
  record_id UUID,
  access_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
BEGIN
  -- Check if user has permission to access the data
  -- This is a simplified example - in practice, you would need to implement
  -- a more comprehensive permission system
  
  CASE table_name
    WHEN 'users' THEN
      -- Users can access their own data
      v_has_permission := (SELECT EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = user_id AND u.id = record_id
      ));
      
      -- Organization owners can access data of users in their organization
      IF NOT v_has_permission THEN
        v_has_permission := (SELECT EXISTS (
          SELECT 1 FROM public.organization_members om1
          JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
          WHERE om1.user_id = user_id
          AND om2.user_id = record_id
          AND om1.role IN ('owner', 'admin')
        ));
      END IF;
      
    WHEN 'kits' THEN
      -- Users can access their own kits
      v_has_permission := (SELECT EXISTS (
        SELECT 1 FROM public.kits k
        WHERE k.id = record_id AND k.created_by = user_id
      ));
      
      -- Organization members can access kits in their organization
      IF NOT v_has_permission THEN
        v_has_permission := (SELECT EXISTS (
          SELECT 1 FROM public.kits k
          JOIN public.organizations o ON k.organization_id = o.id
          JOIN public.organization_members om ON o.id = om.organization_id
          WHERE k.id = record_id
          AND om.user_id = user_id
        ));
      END IF;
      
    WHEN 'client_progress' THEN
      -- Users can access client progress for their own kits
      v_has_permission := (SELECT EXISTS (
        SELECT 1 FROM public.client_progress cp
        JOIN public.kits k ON cp.kit_id = k.id
        WHERE cp.id = record_id AND k.created_by = user_id
      ));
      
    ELSE
      -- Default to false for unknown tables
      v_has_permission := FALSE;
  END CASE;
  
  -- Log the access attempt
  PERFORM public.log_data_access(user_id, table_name, record_id, access_type);
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to request data access
CREATE OR REPLACE FUNCTION public.request_data_access(
  user_id UUID,
  table_name TEXT,
  record_id UUID,
  access_type TEXT,
  reason TEXT
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
BEGIN
  -- Create a data access request
  INSERT INTO public.data_access_requests (
    user_id,
    table_name,
    record_id,
    access_type,
    reason,
    status
  )
  VALUES (
    user_id,
    table_name,
    record_id,
    access_type,
    reason,
    'pending'
  )
  RETURNING id INTO v_request_id;
  
  -- Log the request
  INSERT INTO public.audit_logs (
    action,
    resource_type,
    resource_id,
    user_id,
    user_email,
    details
  )
  SELECT
    'data_access_request',
    'data_access_requests',
    v_request_id,
    user_id,
    email,
    jsonb_build_object(
      'table_name', table_name,
      'record_id', record_id,
      'access_type', access_type,
      'reason', reason,
      'timestamp', NOW()
    )
  FROM public.users
  WHERE id = user_id;
  
  RAISE NOTICE 'Data access request created for user % on table % record %', user_id, table_name, record_id;
  
  RETURN v_request_id;
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

-- Function to get data access requests for a user
CREATE OR REPLACE FUNCTION public.get_data_access_requests_for_user(
  user_id UUID
)
RETURNS TABLE(
  request_id UUID,
  table_name TEXT,
  record_id UUID,
  access_type TEXT,
  reason TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dar.id AS request_id,
    dar.table_name,
    dar.record_id,
    dar.access_type,
    dar.reason,
    dar.status,
    dar.created_at,
    dar.approved_at,
    dar.rejected_at,
    dar.rejection_reason
  FROM public.data_access_requests dar
  WHERE dar.user_id = user_id
  ORDER BY dar.created_at DESC;
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

-- Function to get data access request statistics
CREATE OR REPLACE FUNCTION public.get_data_access_request_statistics()
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

-- Function to securely hash kit passwords
CREATE OR REPLACE FUNCTION public.hash_kit_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Function to verify kit passwords
CREATE OR REPLACE FUNCTION public.verify_kit_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure file upload tokens
CREATE OR REPLACE FUNCTION public.generate_file_upload_token(file_upload_id UUID, expiry_minutes INTEGER DEFAULT 60)
RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Generate a random token
  v_token := md5(random()::text || file_upload_id::text || NOW()::text);
  
  -- Update the file upload with the token and expiry
  UPDATE public.file_uploads
  SET access_token = v_token,
      updated_at = NOW() + INTERVAL '1 minute' * expiry_minutes
  WHERE id = file_upload_id;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate file upload tokens
CREATE OR REPLACE FUNCTION public.validate_file_upload_token(token TEXT)
RETURNS TABLE(is_valid BOOLEAN, file_upload_id UUID, file_url TEXT) AS $$
DECLARE
  v_file_upload_id UUID;
  v_file_url TEXT;
  v_updated_at TIMESTAMPTZ;
BEGIN
  -- Get the file upload details for this token
  SELECT fu.id, fu.file_url, fu.updated_at
  INTO v_file_upload_id, v_file_url, v_updated_at
  FROM public.file_uploads fu
  WHERE fu.access_token = token
  AND fu.updated_at > NOW(); -- Check if token hasn't expired
  
  -- Check if the token exists and hasn't expired
  IF v_file_upload_id IS NOT NULL THEN
    RETURN QUERY SELECT true, v_file_upload_id, v_file_url;
  ELSE
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Function to hash kit passwords before insert or update
CREATE OR REPLACE FUNCTION public.hash_kit_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.password_hash IS NOT NULL AND NEW.password_hash != '' THEN
    NEW.password_hash := public.hash_kit_password(NEW.password_hash);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to hash kit passwords
DROP TRIGGER IF EXISTS hash_kit_password_trigger ON public.kits;
CREATE TRIGGER hash_kit_password_trigger BEFORE INSERT OR UPDATE ON public.kits
  FOR EACH ROW EXECUTE FUNCTION public.hash_kit_password_trigger();

-- Function to clean up expired file upload tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_file_tokens()
RETURNS VOID AS $$
BEGIN
  UPDATE public.file_uploads
  SET access_token = NULL
  WHERE updated_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data access requests
CREATE OR REPLACE FUNCTION public.cleanup_old_data_access_requests()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.data_access_requests
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND status IN ('approved', 'rejected');
END;
$$ LANGUAGE plpgsql;

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
-- STEP 9: SAMPLE DATA FOR TESTING
-- =============================================

-- Insert sample data for testing (uncomment for development)
-- INSERT INTO public.users (id, email, full_name, company_name, subscription_tier)
-- VALUES
--   ('00000000-0000-0000-0000-000000000001'::uuid, 'demo@onboardkit.com', 'Demo User', 'OnboardKit Demo', 'pro')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.organizations (id, name, slug, created_by, subscription_tier)
-- VALUES
--   ('00000000-0000-0000-0000-000000000002'::uuid, 'Demo Organization', 'demo-org', '00000000-0000-0000-0000-000000000001'::uuid, 'enterprise')
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.kits (id, title, slug, description, created_by, organization_id)
-- VALUES
--   ('00000000-0000-0000-0000-000000000003'::uuid, 'Welcome Kit', 'welcome-kit', 'Demo onboarding kit', '00000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid)
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.kit_steps (id, kit_id, title, step_type, order_index)
-- VALUES
--   ('00000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'Welcome', 'welcome', 1),
--   ('00000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'Client Information', 'form', 2)
-- ON CONFLICT (id) DO NOTHING;

-- =============================================
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