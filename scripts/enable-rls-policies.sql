-- Enable Row Level Security (RLS) for all tables
-- This script enables RLS and creates appropriate policies for secure multi-tenant access

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

-- Core tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Onboarding core
ALTER TABLE public.onboarding_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_completions ENABLE ROW LEVEL SECURITY;

-- Workflows and automation
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Integrations
ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Analytics and reporting
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- AI and insights
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Templates and marketplace
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_reviews ENABLE ROW LEVEL SECURITY;

-- Files and documents
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_signatures ENABLE ROW LEVEL SECURITY;

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Audit and security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Localization
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

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
-- RLS POLICIES
-- =============================================

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT USING (id = auth.user_organization_id());

CREATE POLICY "Admins can update their organization" ON public.organizations
  FOR UPDATE USING (id = auth.user_organization_id() AND auth.is_admin());

-- Users: Users can see users in their organization
CREATE POLICY "Users can view organization members" ON public.users
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage organization users" ON public.users
  FOR ALL USING (organization_id = auth.user_organization_id() AND auth.is_admin());

-- Teams: Organization-scoped access
CREATE POLICY "Users can view organization teams" ON public.teams
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can manage teams they created or are admin" ON public.teams
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND 
    (created_by = auth.uid() OR auth.is_admin())
  );

-- Team Members: Users can see team memberships in their organization
CREATE POLICY "Users can view team memberships" ON public.team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage team memberships" ON public.team_members
  FOR ALL USING (
    team_id IN (
      SELECT id FROM public.teams 
      WHERE organization_id = auth.user_organization_id() AND 
      (created_by = auth.uid() OR auth.is_admin())
    )
  );

-- Onboarding Kits: Organization-scoped
CREATE POLICY "Users can view organization kits" ON public.onboarding_kits
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can manage kits they created or are admin" ON public.onboarding_kits
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND 
    (created_by = auth.uid() OR auth.is_admin())
  );

-- Client Sessions: Organization-scoped through kit relationship
CREATE POLICY "Users can view organization client sessions" ON public.client_sessions
  FOR SELECT USING (
    kit_id IN (
      SELECT id FROM public.onboarding_kits 
      WHERE organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage client sessions" ON public.client_sessions
  FOR ALL USING (
    kit_id IN (
      SELECT id FROM public.onboarding_kits 
      WHERE organization_id = auth.user_organization_id()
    )
  );

-- Step Completions: Through session relationship
CREATE POLICY "Users can view step completions" ON public.step_completions
  FOR SELECT USING (
    session_id IN (
      SELECT cs.id FROM public.client_sessions cs
      JOIN public.onboarding_kits ok ON cs.kit_id = ok.id
      WHERE ok.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage step completions" ON public.step_completions
  FOR ALL USING (
    session_id IN (
      SELECT cs.id FROM public.client_sessions cs
      JOIN public.onboarding_kits ok ON cs.kit_id = ok.id
      WHERE ok.organization_id = auth.user_organization_id()
    )
  );

-- Workflows: Organization-scoped
CREATE POLICY "Users can view organization workflows" ON public.workflows
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can manage workflows they created or are admin" ON public.workflows
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND 
    (created_by = auth.uid() OR auth.is_admin())
  );

-- Workflow Executions: Through workflow relationship
CREATE POLICY "Users can view workflow executions" ON public.workflow_executions
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM public.workflows 
      WHERE organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage workflow executions" ON public.workflow_executions
  FOR ALL USING (
    workflow_id IN (
      SELECT id FROM public.workflows 
      WHERE organization_id = auth.user_organization_id()
    )
  );

-- Integrations: Organization-scoped
CREATE POLICY "Users can view organization CRM integrations" ON public.crm_integrations
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage CRM integrations" ON public.crm_integrations
  FOR ALL USING (organization_id = auth.user_organization_id() AND auth.is_admin());

CREATE POLICY "Users can view organization email integrations" ON public.email_integrations
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage email integrations" ON public.email_integrations
  FOR ALL USING (organization_id = auth.user_organization_id() AND auth.is_admin());

CREATE POLICY "Users can view their calendar integrations" ON public.calendar_integrations
  FOR SELECT USING (
    organization_id = auth.user_organization_id() AND 
    (user_id = auth.uid() OR auth.is_admin())
  );

CREATE POLICY "Users can manage their calendar integrations" ON public.calendar_integrations
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND user_id = auth.uid()
  );

-- Analytics: Organization-scoped
CREATE POLICY "Users can view organization analytics" ON public.analytics_events
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "System can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (organization_id = auth.user_organization_id());

CREATE POLICY "Users can view organization metrics" ON public.performance_metrics
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "System can insert performance metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (organization_id = auth.user_organization_id());

-- AI Insights: Organization-scoped
CREATE POLICY "Users can view organization AI insights" ON public.ai_insights
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "System can manage AI insights" ON public.ai_insights
  FOR ALL USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can view AI recommendations" ON public.ai_recommendations
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "System can manage AI recommendations" ON public.ai_recommendations
  FOR ALL USING (organization_id = auth.user_organization_id());

-- Templates: Public templates visible to all, private templates organization-scoped
CREATE POLICY "Users can view public templates or their organization templates" ON public.templates
  FOR SELECT USING (
    is_public = true OR organization_id = auth.user_organization_id()
  );

CREATE POLICY "Users can manage their organization templates" ON public.templates
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND 
    (created_by = auth.uid() OR auth.is_admin())
  );

-- Template Reviews: Users can review public templates
CREATE POLICY "Users can view template reviews" ON public.template_reviews
  FOR SELECT USING (
    template_id IN (
      SELECT id FROM public.templates 
      WHERE is_public = true OR organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage their own reviews" ON public.template_reviews
  FOR ALL USING (user_id = auth.uid());

-- Files: Organization-scoped
CREATE POLICY "Users can view organization files" ON public.files
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "Users can manage files they uploaded or are admin" ON public.files
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND 
    (uploaded_by = auth.uid() OR auth.is_admin())
  );

-- Document Signatures: Through session relationship
CREATE POLICY "Users can view document signatures" ON public.document_signatures
  FOR SELECT USING (
    session_id IN (
      SELECT cs.id FROM public.client_sessions cs
      JOIN public.onboarding_kits ok ON cs.kit_id = ok.id
      WHERE ok.organization_id = auth.user_organization_id()
    )
  );

CREATE POLICY "Users can manage document signatures" ON public.document_signatures
  FOR ALL USING (
    session_id IN (
      SELECT cs.id FROM public.client_sessions cs
      JOIN public.onboarding_kits ok ON cs.kit_id = ok.id
      WHERE ok.organization_id = auth.user_organization_id()
    )
  );

-- Notifications: User-specific or organization-wide
CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND organization_id = auth.user_organization_id())
  );

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    organization_id = auth.user_organization_id() OR 
    user_id = auth.uid()
  );

-- Notification Preferences: User-specific
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Activity Logs: Organization-scoped, read-only for users
CREATE POLICY "Users can view organization activity logs" ON public.activity_logs
  FOR SELECT USING (organization_id = auth.user_organization_id());

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (organization_id = auth.user_organization_id());

-- Security Events: Organization-scoped, admin-only
CREATE POLICY "Admins can view organization security events" ON public.security_events
  FOR SELECT USING (
    organization_id = auth.user_organization_id() AND auth.is_admin()
  );

CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

-- Translations: Organization-scoped or global
CREATE POLICY "Users can view translations" ON public.translations
  FOR SELECT USING (
    organization_id IS NULL OR organization_id = auth.user_organization_id()
  );

CREATE POLICY "Admins can manage organization translations" ON public.translations
  FOR ALL USING (
    organization_id = auth.user_organization_id() AND auth.is_admin()
  );

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on auth schema functions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON SCHEMA public IS 'RLS enabled for secure multi-tenant access';