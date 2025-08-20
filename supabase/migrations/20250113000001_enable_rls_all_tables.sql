-- Enable Row Level Security (RLS) for all tables
-- Migration: 20250113000001_enable_rls_all_tables.sql

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

-- Core tables
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.team_members ENABLE ROW LEVEL SECURITY;

-- Onboarding core
ALTER TABLE IF EXISTS public.onboarding_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.step_completions ENABLE ROW LEVEL SECURITY;

-- Workflows and automation
ALTER TABLE IF EXISTS public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Integrations
ALTER TABLE IF EXISTS public.crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Analytics and reporting
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- AI and insights
ALTER TABLE IF EXISTS public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Templates and marketplace
ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.template_reviews ENABLE ROW LEVEL SECURITY;

-- Files and documents
ALTER TABLE IF EXISTS public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Notifications
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Audit and security
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.security_events ENABLE ROW LEVEL SECURITY;

-- Localization
ALTER TABLE IF EXISTS public.translations ENABLE ROW LEVEL SECURITY;

-- Legacy tables (if they exist)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_kit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.client_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to get current user's organization ID
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- BASIC RLS POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organization members" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view organization kits" ON public.onboarding_kits;
DROP POLICY IF EXISTS "Users can view organization client sessions" ON public.client_sessions;
DROP POLICY IF EXISTS "Authenticated users can access" ON public.onboarding_kits;
DROP POLICY IF EXISTS "Authenticated users can access" ON public.client_sessions;
DROP POLICY IF EXISTS "Authenticated users can access" ON public.step_completions;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      id = auth.user_organization_id() OR
      id IN (SELECT organization_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Users: Users can see users in their organization
CREATE POLICY "Users can view organization members" ON public.users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      organization_id = auth.user_organization_id() OR
      id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Onboarding Kits: Organization-scoped
CREATE POLICY "Users can view organization kits" ON public.onboarding_kits
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    organization_id = auth.user_organization_id()
  );

CREATE POLICY "Users can manage organization kits" ON public.onboarding_kits
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    organization_id = auth.user_organization_id()
  );

-- Client Sessions: Organization-scoped through kit relationship
CREATE POLICY "Users can view organization client sessions" ON public.client_sessions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    kit_id IN (
      SELECT id FROM public.onboarding_kits 
      WHERE organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage client sessions" ON public.client_sessions
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    kit_id IN (
      SELECT id FROM public.onboarding_kits 
      WHERE organization_id = auth.user_organization_id()
    )
  );

-- Step Completions: Through session relationship
CREATE POLICY "Users can view step completions" ON public.step_completions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    session_id IN (
      SELECT cs.id FROM public.client_sessions cs
      JOIN public.onboarding_kits ok ON cs.kit_id = ok.id
      WHERE ok.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage step completions" ON public.step_completions
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    session_id IN (
      SELECT cs.id FROM public.client_sessions cs
      JOIN public.onboarding_kits ok ON cs.kit_id = ok.id
      WHERE ok.organization_id = auth.user_organization_id()
    )
  );

-- Basic policies for other tables (authenticated users only)
CREATE POLICY "Authenticated users can access workflows" ON public.workflows
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access workflow executions" ON public.workflow_executions
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access integrations" ON public.crm_integrations
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access email integrations" ON public.email_integrations
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access calendar integrations" ON public.calendar_integrations
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access analytics" ON public.analytics_events
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access metrics" ON public.performance_metrics
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access AI insights" ON public.ai_insights
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access AI recommendations" ON public.ai_recommendations
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access templates" ON public.templates
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access template reviews" ON public.template_reviews
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access files" ON public.files
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access document signatures" ON public.document_signatures
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access notifications" ON public.notifications
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access activity logs" ON public.activity_logs
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access security events" ON public.security_events
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access translations" ON public.translations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Legacy table policies (if they exist)
CREATE POLICY "Authenticated users can access profiles" ON public.profiles
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access kits" ON public.kits
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access kit steps" ON public.kit_steps
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access clients" ON public.clients
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access client kit assignments" ON public.client_kit_assignments
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access client step progress" ON public.client_step_progress
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on auth schema functions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;