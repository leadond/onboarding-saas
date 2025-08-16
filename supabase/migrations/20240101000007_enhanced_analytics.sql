-- Enhanced Analytics Schema for Advanced Insights
-- This migration adds comprehensive analytics tracking and reporting capabilities

-- Client behavior tracking table
CREATE TABLE public.client_behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  client_identifier VARCHAR(255) NOT NULL, -- Use client_identifier instead of client_id
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'step_start', 'step_complete', 'field_focus', 'field_blur', 'file_upload', 'button_click', 'form_submit', 'error', 'exit'
  event_data JSONB DEFAULT '{}', -- Additional event-specific data
  step_id UUID REFERENCES public.kit_steps(id) ON DELETE SET NULL,
  session_id VARCHAR(255), -- Browser session identifier
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  page_url TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  scroll_depth DECIMAL(5,2), -- Percentage of page scrolled
  time_on_page INTEGER, -- Seconds spent on page
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion funnel analysis table
CREATE TABLE public.conversion_funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  funnel_name VARCHAR(255) NOT NULL,
  funnel_steps JSONB NOT NULL, -- Array of step definitions
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  total_entries INTEGER DEFAULT 0,
  conversion_data JSONB DEFAULT '{}', -- Step-by-step conversion rates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B testing experiments table
CREATE TABLE public.ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  experiment_name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'archived')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  traffic_split DECIMAL(3,2) DEFAULT 0.50, -- Percentage for variant A (0.50 = 50/50 split)
  hypothesis TEXT,
  success_metric VARCHAR(100), -- 'completion_rate', 'time_to_complete', 'satisfaction_score', etc.
  variants JSONB NOT NULL, -- Array of variant configurations
  results JSONB DEFAULT '{}', -- Experiment results and statistics
  statistical_significance DECIMAL(5,4), -- P-value
  confidence_level DECIMAL(5,4) DEFAULT 0.95,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test participant assignments
CREATE TABLE public.ab_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID REFERENCES public.ab_experiments(id) ON DELETE CASCADE,
  client_identifier VARCHAR(255) NOT NULL, -- Use client_identifier instead of client_id
  variant VARCHAR(50) NOT NULL, -- 'control', 'variant_a', 'variant_b', etc.
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10,2), -- Monetary value if applicable
  converted_at TIMESTAMPTZ,
  
  UNIQUE(experiment_id, client_identifier)
);

-- Performance benchmarks table
CREATE TABLE public.performance_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  benchmark_date DATE NOT NULL,
  completion_rate DECIMAL(5,4), -- 0.8500 = 85%
  avg_completion_time INTEGER, -- Minutes
  bounce_rate DECIMAL(5,4), -- Percentage who leave without completing first step
  drop_off_by_step JSONB, -- Step-by-step drop-off rates
  client_satisfaction DECIMAL(3,2), -- Average satisfaction score
  nps_score INTEGER, -- Net Promoter Score
  support_tickets_count INTEGER DEFAULT 0,
  error_rate DECIMAL(5,4), -- Percentage of sessions with errors
  mobile_completion_rate DECIMAL(5,4), -- Completion rate on mobile devices
  desktop_completion_rate DECIMAL(5,4), -- Completion rate on desktop
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROI calculations table
CREATE TABLE public.roi_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  calculation_period_start DATE NOT NULL,
  calculation_period_end DATE NOT NULL,
  total_clients INTEGER DEFAULT 0,
  completed_clients INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  cost_per_acquisition DECIMAL(10,2) DEFAULT 0,
  customer_lifetime_value DECIMAL(12,2) DEFAULT 0,
  time_saved_hours DECIMAL(8,2) DEFAULT 0, -- Hours saved through automation
  cost_savings DECIMAL(12,2) DEFAULT 0, -- Monetary savings
  roi_percentage DECIMAL(8,4), -- Return on investment percentage
  payback_period_days INTEGER, -- Days to recover investment
  efficiency_score DECIMAL(5,2), -- Overall efficiency rating
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time analytics aggregations (for dashboard performance)
CREATE TABLE public.analytics_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  aggregation_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly'
  aggregation_date DATE NOT NULL,
  metrics JSONB NOT NULL, -- Pre-calculated metrics for fast retrieval
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(kit_id, aggregation_type, aggregation_date)
);

-- Predictive analytics models table
CREATE TABLE public.predictive_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE,
  model_type VARCHAR(50) NOT NULL, -- 'completion_prediction', 'churn_prediction', 'satisfaction_prediction'
  model_version VARCHAR(20) NOT NULL,
  training_data_period_start DATE NOT NULL,
  training_data_period_end DATE NOT NULL,
  model_parameters JSONB, -- Model configuration and hyperparameters
  accuracy_score DECIMAL(5,4), -- Model accuracy on test data
  precision_score DECIMAL(5,4),
  recall_score DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  feature_importance JSONB, -- Which factors most influence predictions
  is_active BOOLEAN DEFAULT FALSE,
  last_retrained_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client predictions table
CREATE TABLE public.client_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES public.predictive_models(id) ON DELETE CASCADE,
  client_identifier VARCHAR(255) NOT NULL, -- Use client_identifier instead of client_id
  prediction_type VARCHAR(50) NOT NULL,
  predicted_value DECIMAL(8,4), -- Probability or score
  confidence_level DECIMAL(5,4), -- Model confidence in prediction
  prediction_factors JSONB, -- Factors that influenced this prediction
  actual_outcome BOOLEAN, -- Actual result (for model validation)
  prediction_date TIMESTAMPTZ DEFAULT NOW(),
  outcome_date TIMESTAMPTZ, -- When actual outcome was recorded
  
  UNIQUE(model_id, client_identifier, prediction_type, prediction_date)
);

-- Indexes for performance optimization
CREATE INDEX idx_client_behavior_events_kit_id ON public.client_behavior_events(kit_id);
CREATE INDEX idx_client_behavior_events_client_id ON public.client_behavior_events(client_identifier);
CREATE INDEX idx_client_behavior_events_event_type ON public.client_behavior_events(event_type);
CREATE INDEX idx_client_behavior_events_created_at ON public.client_behavior_events(created_at);
CREATE INDEX idx_client_behavior_events_session_id ON public.client_behavior_events(session_id);

CREATE INDEX idx_conversion_funnels_kit_id ON public.conversion_funnels(kit_id);
CREATE INDEX idx_conversion_funnels_date_range ON public.conversion_funnels(date_range_start, date_range_end);

CREATE INDEX idx_ab_experiments_kit_id ON public.ab_experiments(kit_id);
CREATE INDEX idx_ab_experiments_status ON public.ab_experiments(status);
CREATE INDEX idx_ab_experiments_dates ON public.ab_experiments(start_date, end_date);

CREATE INDEX idx_ab_participants_experiment_id ON public.ab_participants(experiment_id);
CREATE INDEX idx_ab_participants_client_id ON public.ab_participants(client_identifier);
CREATE INDEX idx_ab_participants_converted ON public.ab_participants(converted);

CREATE INDEX idx_performance_benchmarks_kit_id ON public.performance_benchmarks(kit_id);
CREATE INDEX idx_performance_benchmarks_date ON public.performance_benchmarks(benchmark_date);

CREATE INDEX idx_roi_calculations_kit_id ON public.roi_calculations(kit_id);
CREATE INDEX idx_roi_calculations_user_id ON public.roi_calculations(user_id);
CREATE INDEX idx_roi_calculations_period ON public.roi_calculations(calculation_period_start, calculation_period_end);

CREATE INDEX idx_analytics_aggregations_kit_id ON public.analytics_aggregations(kit_id);
CREATE INDEX idx_analytics_aggregations_type_date ON public.analytics_aggregations(aggregation_type, aggregation_date);

CREATE INDEX idx_predictive_models_kit_id ON public.predictive_models(kit_id);
CREATE INDEX idx_predictive_models_type ON public.predictive_models(model_type);
CREATE INDEX idx_predictive_models_active ON public.predictive_models(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_client_predictions_model_id ON public.client_predictions(model_id);
CREATE INDEX idx_client_predictions_client_id ON public.client_predictions(client_identifier);
CREATE INDEX idx_client_predictions_type ON public.client_predictions(prediction_type);

-- RLS Policies
ALTER TABLE public.client_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_predictions ENABLE ROW LEVEL SECURITY;

-- Client behavior events policies
CREATE POLICY "Users can view behavior events for their kits" ON public.client_behavior_events
  FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

CREATE POLICY "System can insert behavior events" ON public.client_behavior_events
  FOR INSERT WITH CHECK (true); -- Allow system to track events

-- Conversion funnels policies
CREATE POLICY "Users can manage their conversion funnels" ON public.conversion_funnels
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- A/B experiments policies
CREATE POLICY "Users can manage their A/B experiments" ON public.ab_experiments
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view A/B participants for their experiments" ON public.ab_participants
  FOR SELECT USING (
    experiment_id IN (
      SELECT id FROM public.ab_experiments 
      WHERE kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
    )
  );

-- Performance benchmarks policies
CREATE POLICY "Users can view benchmarks for their kits" ON public.performance_benchmarks
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- ROI calculations policies
CREATE POLICY "Users can manage their ROI calculations" ON public.roi_calculations
  FOR ALL USING (auth.uid() = user_id);

-- Analytics aggregations policies
CREATE POLICY "Users can view aggregations for their kits" ON public.analytics_aggregations
  FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

-- Predictive models policies
CREATE POLICY "Users can manage models for their kits" ON public.predictive_models
  FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view predictions for their kits" ON public.client_predictions
  FOR SELECT USING (
    model_id IN (
      SELECT id FROM public.predictive_models 
      WHERE kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
    )
  );

-- Functions for analytics calculations
CREATE OR REPLACE FUNCTION public.calculate_conversion_funnel(
  p_kit_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB AS $$
DECLARE
  funnel_data JSONB;
  step_record RECORD;
  total_entries INTEGER;
  current_count INTEGER;
  conversion_rate DECIMAL(5,4);
BEGIN
  -- Get total entries (clients who started the kit)
  SELECT COUNT(DISTINCT client_identifier) INTO total_entries
  FROM public.client_progress
  WHERE kit_id = p_kit_id
    AND created_at::DATE BETWEEN p_start_date AND p_end_date;

  -- Initialize funnel data
  funnel_data := jsonb_build_object('total_entries', total_entries, 'steps', '[]'::jsonb);

  -- Calculate conversion for each step
  FOR step_record IN
    SELECT id, title, step_order
    FROM public.kit_steps
    WHERE kit_id = p_kit_id
    ORDER BY step_order
  LOOP
    -- Count clients who completed this step
    SELECT COUNT(DISTINCT client_identifier) INTO current_count
    FROM public.client_progress
    WHERE kit_id = p_kit_id
      AND step_id = step_record.id
      AND status = 'completed'
      AND created_at::DATE BETWEEN p_start_date AND p_end_date;

    -- Calculate conversion rate
    IF total_entries > 0 THEN
      conversion_rate := current_count::DECIMAL / total_entries::DECIMAL;
    ELSE
      conversion_rate := 0;
    END IF;

    -- Add step data to funnel
    funnel_data := jsonb_set(
      funnel_data,
      '{steps}',
      (funnel_data->'steps') || jsonb_build_object(
        'step_id', step_record.id,
        'step_title', step_record.title,
        'step_order', step_record.step_order,
        'completions', current_count,
        'conversion_rate', conversion_rate
      )
    );
  END LOOP;

  RETURN funnel_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update analytics aggregations
CREATE OR REPLACE FUNCTION public.update_analytics_aggregations(
  p_kit_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS VOID AS $$
DECLARE
  daily_metrics JSONB;
  completion_rate DECIMAL(5,4);
  avg_time INTEGER;
  bounce_rate DECIMAL(5,4);
BEGIN
  -- Calculate daily metrics
  SELECT 
    COALESCE(
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / 
      NULLIF(COUNT(*)::DECIMAL, 0), 
      0
    ),
    COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/60)::INTEGER, 0),
    COALESCE(
      COUNT(CASE WHEN status = 'abandoned' THEN 1 END)::DECIMAL / 
      NULLIF(COUNT(*)::DECIMAL, 0), 
      0
    )
  INTO completion_rate, avg_time, bounce_rate
  FROM public.client_progress
  WHERE kit_id = p_kit_id
    AND created_at::DATE = p_date;

  -- Build metrics JSON
  daily_metrics := jsonb_build_object(
    'completion_rate', completion_rate,
    'avg_completion_time', avg_time,
    'bounce_rate', bounce_rate,
    'total_clients', (
      SELECT COUNT(*) FROM public.client_progress 
      WHERE kit_id = p_kit_id AND created_at::DATE = p_date
    )
  );

  -- Insert or update aggregation
  INSERT INTO public.analytics_aggregations (kit_id, aggregation_type, aggregation_date, metrics)
  VALUES (p_kit_id, 'daily', p_date, daily_metrics)
  ON CONFLICT (kit_id, aggregation_type, aggregation_date)
  DO UPDATE SET metrics = EXCLUDED.metrics, created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track client behavior events
CREATE OR REPLACE FUNCTION public.track_behavior_event(
  p_kit_id UUID,
  p_client_identifier VARCHAR(255),
  p_event_type VARCHAR(50),
  p_event_data JSONB DEFAULT '{}',
  p_step_id UUID DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.client_behavior_events (
    kit_id, client_identifier, event_type, event_data, step_id,
    session_id, user_agent, ip_address
  )
  VALUES (
    p_kit_id, p_client_identifier, p_event_type, p_event_data, p_step_id,
    p_session_id, p_user_agent, p_ip_address
  )
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;