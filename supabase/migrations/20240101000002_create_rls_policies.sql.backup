-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can view their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- KITS TABLE POLICIES
-- =============================================================================

-- Users can view their own kits
CREATE POLICY "kits_select_own" ON public.kits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create kits (with subscription limits enforced in app layer)
CREATE POLICY "kits_insert_own" ON public.kits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own kits
CREATE POLICY "kits_update_own" ON public.kits
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own kits
CREATE POLICY "kits_delete_own" ON public.kits
  FOR DELETE USING (auth.uid() = user_id);

-- Published kits are publicly viewable (for client access)
CREATE POLICY "kits_select_published" ON public.kits
  FOR SELECT USING (status = 'published');

-- =============================================================================
-- KIT STEPS TABLE POLICIES
-- =============================================================================

-- Users can manage steps of their own kits
CREATE POLICY "kit_steps_all_own_kit" ON public.kit_steps
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- Published kit steps are publicly viewable (for client access)
CREATE POLICY "kit_steps_select_published" ON public.kit_steps
  FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE status = 'published')
    AND is_active = true
  );

-- =============================================================================
-- CLIENT PROGRESS TABLE POLICIES
-- =============================================================================

-- Kit owners can view all progress for their kits
CREATE POLICY "client_progress_select_kit_owner" ON public.client_progress
  FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- Anyone can create progress entries for published kits
CREATE POLICY "client_progress_insert_public" ON public.client_progress
  FOR INSERT WITH CHECK (
    kit_id IN (SELECT id FROM public.kits WHERE status = 'published')
  );

-- Anyone can update their own progress entries
CREATE POLICY "client_progress_update_own" ON public.client_progress
  FOR UPDATE USING (
    kit_id IN (SELECT id FROM public.kits WHERE status = 'published')
  );

-- Kit owners can update progress (for manual adjustments)
CREATE POLICY "client_progress_update_kit_owner" ON public.client_progress
  FOR UPDATE USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- =============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =============================================================================

-- Users can view their own subscription data
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert/update subscription data (via webhook/admin)
-- This will be handled by service role key in webhook handlers

-- =============================================================================
-- USAGE TRACKING TABLE POLICIES
-- =============================================================================

-- Users can view their own usage data
CREATE POLICY "usage_tracking_select_own" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert/update usage data
-- This will be handled by triggers and service role key

-- =============================================================================
-- AUDIT LOGS TABLE POLICIES
-- =============================================================================

-- Users can view their own audit logs
CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert audit logs (via triggers)

-- =============================================================================
-- KIT ANALYTICS TABLE POLICIES
-- =============================================================================

-- Kit owners can view analytics for their kits
CREATE POLICY "kit_analytics_select_own" ON public.kit_analytics
  FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- System can insert analytics data (public access for tracking)
CREATE POLICY "kit_analytics_insert_public" ON public.kit_analytics
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- FILE UPLOADS TABLE POLICIES
-- =============================================================================

-- Kit owners can view all files uploaded to their kits
CREATE POLICY "file_uploads_select_kit_owner" ON public.file_uploads
  FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- Anyone can upload files to published kits
CREATE POLICY "file_uploads_insert_public" ON public.file_uploads
  FOR INSERT WITH CHECK (
    kit_id IN (SELECT id FROM public.kits WHERE status = 'published')
  );

-- Kit owners can delete files from their kits
CREATE POLICY "file_uploads_delete_kit_owner" ON public.file_uploads
  FOR DELETE USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- =============================================================================
-- WEBHOOK EVENTS TABLE POLICIES
-- =============================================================================

-- Only system can manage webhook events (via service role key)
-- No RLS policies needed as this is system-only data

-- =============================================================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================================================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION auth.user_has_active_subscription()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND subscription_status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription tier
CREATE OR REPLACE FUNCTION auth.user_subscription_tier()
RETURNS TEXT AS $$
DECLARE
  tier TEXT;
BEGIN
  SELECT subscription_tier INTO tier
  FROM public.users 
  WHERE id = auth.uid();
  
  RETURN COALESCE(tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is within kit limits
CREATE OR REPLACE FUNCTION auth.user_within_kit_limit()
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  tier_limit INTEGER;
  user_tier TEXT;
BEGIN
  -- Get current kit count
  SELECT COUNT(*) INTO current_count
  FROM public.kits 
  WHERE user_id = auth.uid() 
  AND status != 'archived';
  
  -- Get user's tier
  SELECT auth.user_subscription_tier() INTO user_tier;
  
  -- Set limits based on tier
  CASE user_tier
    WHEN 'free' THEN tier_limit := 1;
    WHEN 'starter' THEN tier_limit := 5;
    WHEN 'pro' THEN tier_limit := 25;
    WHEN 'enterprise' THEN tier_limit := -1; -- unlimited
    ELSE tier_limit := 1;
  END CASE;
  
  -- Check if within limit
  RETURN tier_limit = -1 OR current_count < tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;