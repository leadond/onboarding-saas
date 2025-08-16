-- =============================================================================
-- PERFORMANCE INDEXES FOR ONBOARDKIT
-- =============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Kits table indexes
CREATE INDEX IF NOT EXISTS idx_kits_user_id ON public.kits(user_id);
CREATE INDEX IF NOT EXISTS idx_kits_slug ON public.kits(slug);
CREATE INDEX IF NOT EXISTS idx_kits_status ON public.kits(status);
CREATE INDEX IF NOT EXISTS idx_kits_user_status ON public.kits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_kits_is_template ON public.kits(is_template);
CREATE INDEX IF NOT EXISTS idx_kits_created_at ON public.kits(created_at);
CREATE INDEX IF NOT EXISTS idx_kits_custom_domain ON public.kits(custom_domain) WHERE custom_domain IS NOT NULL;

-- Kit steps table indexes
CREATE INDEX IF NOT EXISTS idx_kit_steps_kit_id ON public.kit_steps(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_steps_order ON public.kit_steps(kit_id, step_order);
CREATE INDEX IF NOT EXISTS idx_kit_steps_type ON public.kit_steps(step_type);
CREATE INDEX IF NOT EXISTS idx_kit_steps_active ON public.kit_steps(kit_id, is_active);
CREATE INDEX IF NOT EXISTS idx_kit_steps_required ON public.kit_steps(kit_id, is_required);

-- Client progress table indexes
CREATE INDEX IF NOT EXISTS idx_client_progress_kit_id ON public.client_progress(kit_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_client ON public.client_progress(client_identifier);
CREATE INDEX IF NOT EXISTS idx_client_progress_kit_client ON public.client_progress(kit_id, client_identifier);
CREATE INDEX IF NOT EXISTS idx_client_progress_step_id ON public.client_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_status ON public.client_progress(status);
CREATE INDEX IF NOT EXISTS idx_client_progress_kit_status ON public.client_progress(kit_id, status);
CREATE INDEX IF NOT EXISTS idx_client_progress_started_at ON public.client_progress(started_at);
CREATE INDEX IF NOT EXISTS idx_client_progress_completed_at ON public.client_progress(completed_at);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period ON public.subscriptions(current_period_start, current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON public.subscriptions(trial_end) WHERE trial_end IS NOT NULL;

-- Usage tracking table indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_type ON public.usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_resource ON public.usage_tracking(user_id, resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON public.usage_tracking(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_id ON public.usage_tracking(resource_id) WHERE resource_id IS NOT NULL;

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON public.audit_logs(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON public.audit_logs(session_id) WHERE session_id IS NOT NULL;

-- Kit analytics table indexes
CREATE INDEX IF NOT EXISTS idx_kit_analytics_kit_id ON public.kit_analytics(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_analytics_metric_name ON public.kit_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_kit_analytics_kit_metric ON public.kit_analytics(kit_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_kit_analytics_recorded_at ON public.kit_analytics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_kit_analytics_kit_date ON public.kit_analytics(kit_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_kit_analytics_client ON public.kit_analytics(client_identifier) WHERE client_identifier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_kit_analytics_session ON public.kit_analytics(session_id) WHERE session_id IS NOT NULL;

-- File uploads table indexes
CREATE INDEX IF NOT EXISTS idx_file_uploads_kit_id ON public.file_uploads(kit_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_step_id ON public.file_uploads(step_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_client ON public.file_uploads(client_identifier);
CREATE INDEX IF NOT EXISTS idx_file_uploads_kit_client ON public.file_uploads(kit_id, client_identifier);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON public.file_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_virus_scan ON public.file_uploads(virus_scan_status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON public.file_uploads(created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_file_type ON public.file_uploads(file_type);

-- Webhook events table indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON public.webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source_type ON public.webhook_events(source, event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_retry_count ON public.webhook_events(retry_count);

-- =============================================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- =============================================================================

-- User dashboard queries
CREATE INDEX IF NOT EXISTS idx_kits_user_status_created ON public.kits(user_id, status, created_at DESC);

-- Kit client progress overview
CREATE INDEX IF NOT EXISTS idx_progress_kit_client_step ON public.client_progress(kit_id, client_identifier, step_id);

-- Analytics time-series queries
CREATE INDEX IF NOT EXISTS idx_analytics_kit_date_desc ON public.kit_analytics(kit_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_date ON public.kit_analytics(metric_name, recorded_at DESC);

-- Usage tracking current period queries
CREATE INDEX IF NOT EXISTS idx_usage_current_period ON public.usage_tracking(user_id, resource_type, period_start DESC);

-- Audit trail queries
CREATE INDEX IF NOT EXISTS idx_audit_user_resource_date ON public.audit_logs(user_id, resource_type, created_at DESC);

-- File management queries
CREATE INDEX IF NOT EXISTS idx_files_kit_step_client ON public.file_uploads(kit_id, step_id, client_identifier);

-- Subscription management queries
CREATE INDEX IF NOT EXISTS idx_subscription_status_period ON public.subscriptions(status, current_period_end);

-- =============================================================================
-- PARTIAL INDEXES FOR BETTER PERFORMANCE
-- =============================================================================

-- Only index active kits for public access
CREATE INDEX IF NOT EXISTS idx_kits_published_active ON public.kits(slug, status) 
  WHERE status = 'published';

-- Only index completed progress for analytics
CREATE INDEX IF NOT EXISTS idx_progress_completed ON public.client_progress(kit_id, completed_at) 
  WHERE status = 'completed' AND completed_at IS NOT NULL;

-- Only index failed file uploads for monitoring
CREATE INDEX IF NOT EXISTS idx_files_failed_uploads ON public.file_uploads(kit_id, created_at) 
  WHERE upload_status = 'failed';

-- Only index unprocessed webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_unprocessed ON public.webhook_events(created_at) 
  WHERE processed = false;

-- Only index active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(user_id, current_period_end) 
  WHERE status = 'active';

-- =============================================================================
-- FUNCTIONAL INDEXES FOR JSON QUERIES
-- =============================================================================

-- Index for form field searches in step content
CREATE INDEX IF NOT EXISTS idx_kit_steps_form_fields ON public.kit_steps
  USING GIN ((content->'form_fields')) WHERE step_type = 'intake_form';

-- Index for file upload configuration
CREATE INDEX IF NOT EXISTS idx_kit_steps_upload_config ON public.kit_steps
  USING GIN ((content->'upload_config')) WHERE step_type = 'file_upload';

-- Index for contract templates
CREATE INDEX IF NOT EXISTS idx_kit_steps_contract_template ON public.kit_steps
  USING GIN ((content->'contract_template')) WHERE step_type = 'contract_signing';

-- Index for step settings
CREATE INDEX IF NOT EXISTS idx_kit_steps_settings ON public.kit_steps
  USING GIN (settings);

-- Index for client response data
CREATE INDEX IF NOT EXISTS idx_progress_response_data ON public.client_progress
  USING GIN (response_data) WHERE response_data IS NOT NULL;

-- Index for analytics metric values
CREATE INDEX IF NOT EXISTS idx_analytics_metric_values ON public.kit_analytics
  USING GIN (metric_value);

-- Index for audit log details
CREATE INDEX IF NOT EXISTS idx_audit_details ON public.audit_logs
  USING GIN (details);

-- Index for usage tracking metadata
CREATE INDEX IF NOT EXISTS idx_file_metadata ON public.file_uploads
  USING GIN (metadata) WHERE metadata IS NOT NULL;

-- =============================================================================
-- TEXT SEARCH INDEXES
-- =============================================================================

-- Full-text search for kit names and descriptions
CREATE INDEX IF NOT EXISTS idx_kits_text_search ON public.kits
  USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));

-- Full-text search for step titles and descriptions
CREATE INDEX IF NOT EXISTS idx_steps_text_search ON public.kit_steps
  USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));