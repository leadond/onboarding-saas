-- =============================================================================
-- SEED DATA FOR ONBOARDKIT DEVELOPMENT
-- =============================================================================

-- Insert sample subscription plans data
-- This would normally be managed through Stripe, but useful for development
INSERT INTO public.subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  stripe_price_id,
  status,
  current_period_start,
  current_period_end
) VALUES 
-- Sample active subscription
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'sub_sample_active',
  'cus_sample_customer',
  'price_pro_monthly',
  'active',
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '15 days'
);

-- Sample webhook events for testing
INSERT INTO public.webhook_events (
  source,
  event_type,
  event_id,
  event_data,
  processed
) VALUES 
(
  'stripe',
  'invoice.payment_succeeded',
  'evt_test_webhook',
  '{"id": "in_test_invoice", "amount_paid": 9900, "customer": "cus_sample_customer"}',
  true
),
(
  'docusign',
  'envelope.completed',
  'evt_docusign_test',
  '{"envelopeId": "12345", "status": "completed", "signers": [{"email": "client@example.com"}]}',
  true
);

-- Sample kit analytics data
INSERT INTO public.kit_analytics (
  kit_id,
  metric_name,
  metric_value,
  client_identifier,
  recorded_at
) VALUES 
-- Sample kit views
('00000000-0000-0000-0000-000000000001'::uuid, 'kit_viewed', '{"user_agent": "Mozilla/5.0"}', 'client1@example.com', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000001'::uuid, 'kit_started', '{"timestamp": "2024-01-01T10:00:00Z"}', 'client1@example.com', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000001'::uuid, 'step_completed', '{"step_id": "00000000-0000-0000-0000-000000000001", "duration": 120}', 'client1@example.com', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000001'::uuid, 'kit_completed', '{"duration": 1800, "total_steps": 5}', 'client1@example.com', NOW() - INTERVAL '1 day');

-- =============================================================================
-- SAMPLE DATA FUNCTIONS
-- =============================================================================

-- Function to create sample data for development
CREATE OR REPLACE FUNCTION create_sample_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sample_user_id UUID;
  sample_kit_id UUID;
  sample_step_id UUID;
BEGIN
  -- Create sample user (this would normally be created by Supabase Auth)
  INSERT INTO public.users (
    id,
    email,
    full_name,
    company_name,
    subscription_status,
    subscription_tier
  ) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'demo@onboardkit.com',
    'Demo User',
    'OnboardKit Demo',
    'active',
    'pro'
  ) ON CONFLICT (id) DO NOTHING;

  -- Create sample kit
  INSERT INTO public.kits (
    id,
    user_id,
    name,
    slug,
    description,
    welcome_message,
    brand_color,
    status
  ) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Welcome to Our Agency',
    'welcome-to-our-agency',
    'A comprehensive onboarding experience for new clients',
    'Welcome! We''re excited to work with you. Please complete the following steps to get started.',
    '#3B82F6',
    'published'
  ) ON CONFLICT (id) DO NOTHING;

  -- Create sample steps
  INSERT INTO public.kit_steps (
    id,
    kit_id,
    step_order,
    step_type,
    title,
    description,
    content,
    is_required,
    is_active
  ) VALUES 
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    1,
    'welcome_message',
    'Welcome!',
    'Get started with your onboarding journey',
    '{"instructions": "Welcome to our agency! We''re thrilled to have you as a client."}',
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    2,
    'intake_form',
    'Tell Us About Your Project',
    'Help us understand your needs and goals',
    '{"form_fields": [{"id": "project_name", "type": "text", "label": "Project Name", "required": true, "order": 1}, {"id": "project_description", "type": "textarea", "label": "Project Description", "required": true, "order": 2}, {"id": "budget", "type": "select", "label": "Budget Range", "required": true, "options": ["$5,000-$10,000", "$10,000-$25,000", "$25,000-$50,000", "$50,000+"], "order": 3}]}',
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    3,
    'file_upload',
    'Upload Your Assets',
    'Share any relevant files, images, or documents',
    '{"upload_config": {"max_files": 10, "max_file_size": 10485760, "accepted_types": ["image/png", "image/jpeg", "application/pdf", "application/msword"], "description": "Please upload any brand assets, reference materials, or project files."}}',
    false,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    4,
    'contract_signing',
    'Sign Agreement',
    'Review and sign our service agreement',
    '{"contract_template": {"template_id": "template_123", "title": "Service Agreement", "description": "Please review and sign our standard service agreement."}}',
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000005'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    5,
    'scheduling',
    'Schedule Kickoff Meeting',
    'Book your project kickoff call',
    '{"calendar_config": {"provider": "google", "duration": 60, "description": "Let''s schedule your project kickoff meeting to discuss next steps."}}',
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000006'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    6,
    'confirmation',
    'You''re All Set!',
    'Onboarding complete - next steps',
    '{"instructions": "Congratulations! You''ve completed the onboarding process. We''ll be in touch within 24 hours to get started on your project."}',
    true,
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- Create sample client progress
  INSERT INTO public.client_progress (
    kit_id,
    client_identifier,
    client_name,
    client_email,
    step_id,
    status,
    response_data,
    completed_at
  ) VALUES 
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'sample.client@example.com',
    'Sample Client',
    'sample.client@example.com',
    '00000000-0000-0000-0000-000000000001'::uuid,
    'completed',
    '{}',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'sample.client@example.com',
    'Sample Client',
    'sample.client@example.com',
    '00000000-0000-0000-0000-000000000002'::uuid,
    'completed',
    '{"project_name": "Website Redesign", "project_description": "Complete redesign of our company website", "budget": "$25,000-$50,000"}',
    NOW() - INTERVAL '2 days'
  ) ON CONFLICT (kit_id, client_identifier, step_id) DO NOTHING;

  RAISE NOTICE 'Sample data created successfully!';
END;
$$;

-- =============================================================================
-- CLEANUP FUNCTIONS
-- =============================================================================

-- Function to clean up sample data
CREATE OR REPLACE FUNCTION cleanup_sample_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete sample data (in reverse order of dependencies)
  DELETE FROM public.client_progress WHERE client_identifier = 'sample.client@example.com';
  DELETE FROM public.kit_analytics WHERE kit_id = '00000000-0000-0000-0000-000000000001'::uuid;
  DELETE FROM public.kit_steps WHERE kit_id = '00000000-0000-0000-0000-000000000001'::uuid;
  DELETE FROM public.kits WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  DELETE FROM public.subscriptions WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid;
  DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
  DELETE FROM public.webhook_events WHERE source IN ('stripe', 'docusign') AND event_id LIKE '%test%';

  RAISE NOTICE 'Sample data cleaned up successfully!';
END;
$$;

-- Run the sample data creation (uncomment for development)
SELECT create_sample_data();