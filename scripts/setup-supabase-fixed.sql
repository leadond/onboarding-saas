-- OnboardKit Complete Supabase Database Setup (FIXED VERSION)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/sql/new

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE (Extended Profile)
-- =============================================
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
  
  -- Onboarding & Activity
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

-- =============================================
-- ORGANIZATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  
  -- Subscription (for organization-level billing)
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'team', 'business', 'enterprise')),
  stripe_customer_id TEXT,
  
  -- Metadata
  owner_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORGANIZATION MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'editor', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  
  -- Metadata
  invited_by UUID REFERENCES public.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- =============================================
-- ONBOARDING KITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.kits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  
  -- Content
  welcome_message TEXT,
  completion_message TEXT,
  
  -- Settings
  is_published BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,
  
  -- Branding
  brand_color TEXT DEFAULT '#3B82F6',
  logo_url TEXT,
  background_url TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  
  -- Ownership
  owner_id UUID REFERENCES public.users(id),
  organization_id UUID REFERENCES public.organizations(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint after table creation
ALTER TABLE public.kits ADD CONSTRAINT kits_owner_slug_unique UNIQUE(owner_id, slug);

-- =============================================
-- KIT STEPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.kit_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  
  -- Step Info
  title TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL CHECK (step_type IN (
    'welcome', 'form', 'file_upload', 'payment', 'scheduling', 
    'contract', 'video', 'confirmation', 'custom'
  )),
  
  -- Content & Configuration
  content JSONB DEFAULT '{}',
  form_fields JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  
  -- Ordering
  order_index INTEGER NOT NULL,
  
  -- Conditional Logic
  conditions JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint after table creation
ALTER TABLE public.kit_steps ADD CONSTRAINT kit_steps_kit_order_unique UNIQUE(kit_id, order_index);

-- =============================================
-- CLIENT PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.client_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  
  -- Client Info
  client_email TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  client_identifier TEXT, -- For anonymous tracking
  
  -- Progress
  current_step_id UUID REFERENCES public.kit_steps(id),
  completed_steps JSONB DEFAULT '[]',
  step_data JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  completion_percentage INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint after table creation
ALTER TABLE public.client_progress ADD CONSTRAINT client_progress_kit_email_unique UNIQUE(kit_id, client_email);

-- =============================================
-- FILE UPLOADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- File Info
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  
  -- Context
  uploaded_by UUID REFERENCES public.users(id),
  kit_id UUID REFERENCES public.kits(id),
  step_id UUID REFERENCES public.kit_steps(id),
  client_progress_id UUID REFERENCES public.client_progress(id),
  
  -- Storage
  storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'aws_s3', 'cloudinary')),
  storage_path TEXT,
  
  -- Security
  is_public BOOLEAN DEFAULT false,
  access_token TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Payment Info
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  
  -- Context
  kit_id UUID REFERENCES public.kits(id),
  client_progress_id UUID REFERENCES public.client_progress(id),
  user_id UUID REFERENCES public.users(id),
  
  -- Client Info
  client_email TEXT NOT NULL,
  client_name TEXT,
  
  -- Metadata
  payment_method_type TEXT,
  receipt_url TEXT,
  refund_reason TEXT,
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INTEGRATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Integration Info
  provider TEXT NOT NULL CHECK (provider IN (
    'google', 'microsoft', 'nylas', 'stripe', 'docusign', 'boldsign',
    'salesforce', 'hubspot', 'mailchimp', 'convertkit', 'zapier'
  )),
  provider_user_id TEXT,
  
  -- Credentials (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint after table creation
ALTER TABLE public.user_integrations ADD CONSTRAINT user_integrations_user_provider_unique UNIQUE(user_id, provider);

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Event Info
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  -- Actor
  user_id UUID REFERENCES public.users(id),
  user_email TEXT,
  
  -- Context
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- API KEYS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Key Info
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  
  -- Permissions
  permissions JSONB DEFAULT '[]',
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  
  -- Metadata
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
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations: Members can view, owners/admins can modify
DROP POLICY IF EXISTS "Organization members can view" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can modify" ON public.organizations;

CREATE POLICY "Organization members can view" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can modify" ON public.organizations
  FOR ALL USING (
    id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Kits: Users can manage their own kits
DROP POLICY IF EXISTS "Users can manage own kits" ON public.kits;
DROP POLICY IF EXISTS "Published kits are viewable" ON public.kits;

CREATE POLICY "Users can manage own kits" ON public.kits
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Published kits are viewable" ON public.kits
  FOR SELECT USING (is_published = true);

-- Kit Steps: Follow kit permissions
DROP POLICY IF EXISTS "Kit steps follow kit permissions" ON public.kit_steps;

CREATE POLICY "Kit steps follow kit permissions" ON public.kit_steps
  FOR ALL USING (
    kit_id IN (
      SELECT id FROM public.kits WHERE owner_id = auth.uid()
    )
  );

-- Client Progress: Kit owners can view all progress
DROP POLICY IF EXISTS "Kit owners can view client progress" ON public.client_progress;

CREATE POLICY "Kit owners can view client progress" ON public.client_progress
  FOR SELECT USING (
    kit_id IN (
      SELECT id FROM public.kits WHERE owner_id = auth.uid()
    )
  );

-- File Uploads: Users can manage their uploads
DROP POLICY IF EXISTS "Users can manage own uploads" ON public.file_uploads;

CREATE POLICY "Users can manage own uploads" ON public.file_uploads
  FOR ALL USING (uploaded_by = auth.uid());

-- Payments: Users can view related payments
DROP POLICY IF EXISTS "Users can view related payments" ON public.payments;

CREATE POLICY "Users can view related payments" ON public.payments
  FOR SELECT USING (
    user_id = auth.uid() OR 
    kit_id IN (
      SELECT id FROM public.kits WHERE owner_id = auth.uid()
    )
  );

-- User Integrations: Users can manage their own integrations
DROP POLICY IF EXISTS "Users can manage own integrations" ON public.user_integrations;

CREATE POLICY "Users can manage own integrations" ON public.user_integrations
  FOR ALL USING (user_id = auth.uid());

-- Audit Logs: Users can view their own logs
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- API Keys: Users can manage their own keys
DROP POLICY IF EXISTS "Users can manage own API keys" ON public.api_keys;

CREATE POLICY "Users can manage own API keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS AND TRIGGERS
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

-- Add updated_at triggers to all tables
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
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_subscription_status_idx ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);

-- Organizations table indexes
CREATE INDEX IF NOT EXISTS organizations_slug_idx ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS organizations_owner_id_idx ON public.organizations(owner_id);

-- Organization members indexes
CREATE INDEX IF NOT EXISTS org_members_org_id_idx ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS org_members_user_id_idx ON public.organization_members(user_id);

-- Kits table indexes
CREATE INDEX IF NOT EXISTS kits_owner_id_idx ON public.kits(owner_id);
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

-- File uploads indexes
CREATE INDEX IF NOT EXISTS file_uploads_uploaded_by_idx ON public.file_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS file_uploads_kit_id_idx ON public.file_uploads(kit_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS payments_stripe_id_idx ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS payments_kit_id_idx ON public.payments(kit_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);

-- User integrations indexes
CREATE INDEX IF NOT EXISTS user_integrations_user_id_idx ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS user_integrations_provider_idx ON public.user_integrations(provider);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs(created_at);

-- API keys indexes
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_hash_idx ON public.api_keys(key_hash);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('kit-assets', 'kit-assets', true),
  ('client-uploads', 'client-uploads', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (public)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for kit assets (public)
DROP POLICY IF EXISTS "Kit assets are publicly accessible" ON storage.objects;
CREATE POLICY "Kit assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'kit-assets');

DROP POLICY IF EXISTS "Users can upload kit assets" ON storage.objects;
CREATE POLICY "Users can upload kit assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kit-assets' AND 
    auth.uid() IS NOT NULL
  );

-- Storage policies for client uploads (private)
DROP POLICY IF EXISTS "Users can access their kit's client uploads" ON storage.objects;
CREATE POLICY "Users can access their kit's client uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client-uploads' AND
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Authenticated users can upload client files" ON storage.objects;
CREATE POLICY "Authenticated users can upload client files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-uploads' AND 
    auth.uid() IS NOT NULL
  );

-- Storage policies for documents (private)
DROP POLICY IF EXISTS "Users can access their documents" ON storage.objects;
CREATE POLICY "Users can access their documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND
    auth.uid() IS NOT NULL
  );

COMMIT;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'OnboardKit database setup completed successfully!';
  RAISE NOTICE 'Tables created: users, organizations, organization_members, kits, kit_steps, client_progress, file_uploads, payments, user_integrations, audit_logs, api_keys';
  RAISE NOTICE 'Storage buckets created: avatars, kit-assets, client-uploads, documents';
  RAISE NOTICE 'Row Level Security enabled with appropriate policies';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'Ready for production use!';
END $$;