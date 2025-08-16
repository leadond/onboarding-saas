-- =============================================================================
-- AUDIT LOGGING TRIGGER FUNCTION
-- =============================================================================

-- Function to automatically log audit trail for data changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_type audit_action;
BEGIN
  -- Determine action type
  CASE TG_OP
    WHEN 'INSERT' THEN
      action_type := 'create';
      new_data := to_jsonb(NEW);
      old_data := NULL;
    WHEN 'UPDATE' THEN
      action_type := 'update';
      new_data := to_jsonb(NEW);
      old_data := to_jsonb(OLD);
    WHEN 'DELETE' THEN
      action_type := 'delete';
      new_data := NULL;
      old_data := to_jsonb(OLD);
  END CASE;

  -- Insert audit log
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old_data', old_data,
      'new_data', new_data,
      'changed_fields', CASE 
        WHEN TG_OP = 'UPDATE' THEN 
          (SELECT array_agg(key) FROM jsonb_each(new_data) WHERE new_data->key != old_data->key)
        ELSE NULL 
      END
    ),
    current_setting('request.headers', true)::jsonb->>'x-real-ip',
    current_setting('request.headers', true)::jsonb->>'user-agent'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- USAGE TRACKING FUNCTIONS
-- =============================================================================

-- Function to track resource usage
CREATE OR REPLACE FUNCTION track_usage(
  p_user_id UUID,
  p_resource_type VARCHAR(50),
  p_resource_id UUID DEFAULT NULL,
  p_usage_count INTEGER DEFAULT 1,
  p_usage_amount BIGINT DEFAULT 0
) RETURNS VOID AS $$
DECLARE
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  -- Calculate current billing period (monthly)
  period_start := date_trunc('month', NOW());
  period_end := period_start + INTERVAL '1 month';
  
  -- Upsert usage record
  INSERT INTO public.usage_tracking (
    user_id,
    resource_type,
    resource_id,
    usage_count,
    usage_amount,
    period_start,
    period_end
  ) VALUES (
    p_user_id,
    p_resource_type,
    p_resource_id,
    p_usage_count,
    p_usage_amount,
    period_start,
    period_end
  )
  ON CONFLICT (user_id, resource_type, period_start, COALESCE(resource_id, '00000000-0000-0000-0000-000000000000'::UUID))
  DO UPDATE SET
    usage_count = usage_tracking.usage_count + p_usage_count,
    usage_amount = usage_tracking.usage_amount + p_usage_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_resource_type VARCHAR(50),
  p_requested_amount INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  user_tier TEXT;
  tier_limit INTEGER;
  period_start TIMESTAMPTZ;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.users 
  WHERE id = p_user_id;
  
  -- Set limits based on tier and resource type
  CASE p_resource_type
    WHEN 'kits' THEN
      CASE user_tier
        WHEN 'free' THEN tier_limit := 1;
        WHEN 'starter' THEN tier_limit := 5;
        WHEN 'pro' THEN tier_limit := 25;
        WHEN 'enterprise' THEN tier_limit := -1; -- unlimited
        ELSE tier_limit := 1;
      END CASE;
    WHEN 'clients' THEN
      CASE user_tier
        WHEN 'free' THEN tier_limit := 10;
        WHEN 'starter' THEN tier_limit := 100;
        WHEN 'pro' THEN tier_limit := 1000;
        WHEN 'enterprise' THEN tier_limit := -1; -- unlimited
        ELSE tier_limit := 10;
      END CASE;
    WHEN 'storage' THEN -- in MB
      CASE user_tier
        WHEN 'free' THEN tier_limit := 100;
        WHEN 'starter' THEN tier_limit := 1024;
        WHEN 'pro' THEN tier_limit := 10240;
        WHEN 'enterprise' THEN tier_limit := -1; -- unlimited
        ELSE tier_limit := 100;
      END CASE;
    ELSE
      tier_limit := 0;
  END CASE;
  
  -- If unlimited, return true
  IF tier_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Calculate current billing period
  period_start := date_trunc('month', NOW());
  
  -- Get current usage
  SELECT COALESCE(SUM(usage_count), 0) INTO current_usage
  FROM public.usage_tracking
  WHERE user_id = p_user_id 
    AND resource_type = p_resource_type
    AND period_start = date_trunc('month', NOW());
  
  -- Check if requested amount would exceed limit
  RETURN (current_usage + p_requested_amount) <= tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- ANALYTICS FUNCTIONS
-- =============================================================================

-- Function to track kit analytics events
CREATE OR REPLACE FUNCTION track_kit_event(
  p_kit_id UUID,
  p_event_name VARCHAR(100),
  p_event_data JSONB DEFAULT '{}',
  p_client_identifier VARCHAR(255) DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.kit_analytics (
    kit_id,
    metric_name,
    metric_value,
    client_identifier,
    session_id,
    recorded_at
  ) VALUES (
    p_kit_id,
    p_event_name,
    p_event_data,
    p_client_identifier,
    p_session_id,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate kit conversion metrics
CREATE OR REPLACE FUNCTION get_kit_metrics(
  p_kit_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
DECLARE
  total_views INTEGER;
  total_starts INTEGER;
  total_completions INTEGER;
  completion_rate NUMERIC;
  avg_time_seconds NUMERIC;
  step_metrics JSONB;
BEGIN
  -- Get total views
  SELECT COUNT(*) INTO total_views
  FROM public.kit_analytics
  WHERE kit_id = p_kit_id
    AND metric_name = 'kit_viewed'
    AND recorded_at BETWEEN p_start_date AND p_end_date;
    
  -- Get total starts
  SELECT COUNT(*) INTO total_starts
  FROM public.kit_analytics
  WHERE kit_id = p_kit_id
    AND metric_name = 'kit_started'
    AND recorded_at BETWEEN p_start_date AND p_end_date;
    
  -- Get total completions
  SELECT COUNT(*) INTO total_completions
  FROM public.kit_analytics
  WHERE kit_id = p_kit_id
    AND metric_name = 'kit_completed'
    AND recorded_at BETWEEN p_start_date AND p_end_date;
    
  -- Calculate completion rate
  completion_rate := CASE 
    WHEN total_starts > 0 THEN (total_completions::NUMERIC / total_starts::NUMERIC) * 100
    ELSE 0
  END;
  
  -- Calculate average completion time
  SELECT AVG((metric_value->>'duration')::INTEGER) INTO avg_time_seconds
  FROM public.kit_analytics
  WHERE kit_id = p_kit_id
    AND metric_name = 'kit_completed'
    AND recorded_at BETWEEN p_start_date AND p_end_date
    AND metric_value ? 'duration';
    
  -- Get step-level metrics
  SELECT jsonb_agg(
    jsonb_build_object(
      'step_id', ks.id,
      'step_title', ks.title,
      'step_order', ks.step_order,
      'views', COALESCE(step_views.count, 0),
      'completions', COALESCE(step_completions.count, 0),
      'completion_rate', CASE 
        WHEN COALESCE(step_views.count, 0) > 0 
        THEN (COALESCE(step_completions.count, 0)::NUMERIC / step_views.count::NUMERIC) * 100
        ELSE 0
      END
    ) ORDER BY ks.step_order
  ) INTO step_metrics
  FROM public.kit_steps ks
  LEFT JOIN (
    SELECT 
      (metric_value->>'step_id')::UUID as step_id,
      COUNT(*) as count
    FROM public.kit_analytics
    WHERE kit_id = p_kit_id
      AND metric_name = 'step_viewed'
      AND recorded_at BETWEEN p_start_date AND p_end_date
    GROUP BY (metric_value->>'step_id')::UUID
  ) step_views ON ks.id = step_views.step_id
  LEFT JOIN (
    SELECT 
      (metric_value->>'step_id')::UUID as step_id,
      COUNT(*) as count
    FROM public.kit_analytics
    WHERE kit_id = p_kit_id
      AND metric_name = 'step_completed'
      AND recorded_at BETWEEN p_start_date AND p_end_date
    GROUP BY (metric_value->>'step_id')::UUID
  ) step_completions ON ks.id = step_completions.step_id
  WHERE ks.kit_id = p_kit_id;
  
  RETURN jsonb_build_object(
    'total_views', total_views,
    'total_starts', total_starts,
    'total_completions', total_completions,
    'completion_rate', completion_rate,
    'avg_completion_time_seconds', COALESCE(avg_time_seconds, 0),
    'step_metrics', COALESCE(step_metrics, '[]'::jsonb),
    'period', jsonb_build_object(
      'start_date', p_start_date,
      'end_date', p_end_date
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Audit triggers for sensitive tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_kits_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.kits
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_subscriptions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Usage tracking triggers
CREATE OR REPLACE FUNCTION track_kit_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Track kit creation
  PERFORM track_usage(NEW.user_id, 'kits', NEW.id, 1, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_kit_usage_trigger
  AFTER INSERT ON public.kits
  FOR EACH ROW EXECUTE FUNCTION track_kit_creation();

-- File upload usage tracking
CREATE OR REPLACE FUNCTION track_file_upload()
RETURNS TRIGGER AS $$
DECLARE
  kit_user_id UUID;
BEGIN
  -- Get kit owner
  SELECT user_id INTO kit_user_id
  FROM public.kits
  WHERE id = NEW.kit_id;
  
  -- Track storage usage (file size in MB)
  PERFORM track_usage(
    kit_user_id, 
    'storage', 
    NEW.id, 
    1, 
    COALESCE(NEW.file_size, 0)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_file_usage_trigger
  AFTER INSERT ON public.file_uploads
  FOR EACH ROW EXECUTE FUNCTION track_file_upload();

-- Client progress tracking
CREATE OR REPLACE FUNCTION track_client_usage()
RETURNS TRIGGER AS $$
DECLARE
  kit_user_id UUID;
BEGIN
  -- Get kit owner
  SELECT user_id INTO kit_user_id
  FROM public.kits
  WHERE id = NEW.kit_id;
  
  -- Track unique client (only count each client once per kit)
  IF NOT EXISTS (
    SELECT 1 FROM public.client_progress
    WHERE kit_id = NEW.kit_id 
    AND client_identifier = NEW.client_identifier
    AND id != NEW.id
  ) THEN
    PERFORM track_usage(kit_user_id, 'clients', NEW.kit_id, 1, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_client_usage_trigger
  AFTER INSERT ON public.client_progress
  FOR EACH ROW EXECUTE FUNCTION track_client_usage();