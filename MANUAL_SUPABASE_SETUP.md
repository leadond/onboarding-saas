# 🗄️ SUPABASE INTEGRATION TABLES SETUP

## **REQUIRED: Run This SQL in Supabase Dashboard**

### **Step 1: Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**

### **Step 2: Copy & Paste This SQL**

```sql
-- ===================================================================
-- INTEGRATION TABLES SETUP
-- Run this in Supabase SQL Editor to enable all integrations
-- ===================================================================

-- Drop existing tables in reverse order of dependency to ensure a clean setup.
-- This is necessary to resolve schema conflicts with older migration files.
DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS integration_webhooks CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;
DROP TABLE IF EXISTS integration_providers CASCADE;

-- Integration providers table
CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  auth_type TEXT NOT NULL DEFAULT 'oauth2', -- oauth2, api_key, basic
  base_url TEXT,
  documentation_url TEXT,
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User integrations table (store connection info per user)
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES integration_providers(id) ON DELETE CASCADE,
  provider_slug TEXT NOT NULL,
  connection_name TEXT,
  is_active BOOLEAN DEFAULT true,
  auth_data JSONB DEFAULT '{}', -- encrypted tokens, api keys
  settings JSONB DEFAULT '{}',  -- user-specific settings
  metadata JSONB DEFAULT '{}',  -- connection metadata
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'connected', -- connected, error, syncing
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider_slug)
);

-- Integration events/logs table
CREATE TABLE IF NOT EXISTS integration_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES user_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- sync, webhook, action, error
  event_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'success', -- success, error, pending
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks table for receiving data from integrations
CREATE TABLE IF NOT EXISTS integration_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_slug TEXT NOT NULL,
  webhook_id TEXT, -- external webhook ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES user_integrations(id) ON DELETE CASCADE,
  endpoint_url TEXT NOT NULL,
  secret TEXT,
  events JSONB DEFAULT '[]', -- array of subscribed events
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all integration providers
INSERT INTO integration_providers (name, slug, category, description, auth_type, features) VALUES
-- Team Communication
('Slack', 'slack', 'communication', 'Team messaging and notifications', 'oauth2', '{"notifications": true, "channels": true, "bots": true}'),
('Microsoft Teams', 'teams', 'communication', 'Microsoft team collaboration platform', 'oauth2', '{"notifications": true, "channels": true, "meetings": true}'),

-- Workflow Automation
('Zapier', 'zapier', 'automation', 'Connect 6000+ apps with automated workflows', 'oauth2', '{"webhooks": true, "triggers": true, "actions": true}'),
('Make', 'make', 'automation', 'Visual workflow automation platform', 'api_key', '{"webhooks": true, "scenarios": true}'),

-- CRM
('Salesforce', 'salesforce', 'crm', 'Leading CRM platform', 'oauth2', '{"contacts": true, "deals": true, "accounts": true}'),
('HubSpot', 'hubspot', 'crm', 'Inbound marketing and CRM platform', 'oauth2', '{"contacts": true, "deals": true, "marketing": true}'),
('Pipedrive', 'pipedrive', 'crm', 'Sales-focused CRM platform', 'oauth2', '{"deals": true, "contacts": true, "pipeline": true}'),

-- Email Marketing
('Mailchimp', 'mailchimp', 'email_marketing', 'Email marketing automation platform', 'oauth2', '{"lists": true, "campaigns": true, "automation": true}'),
('ConvertKit', 'convertkit', 'email_marketing', 'Creator-focused email marketing', 'api_key', '{"sequences": true, "subscribers": true, "forms": true}'),

-- Database & Workspace
('Airtable', 'airtable', 'database', 'Flexible database and collaboration platform', 'oauth2', '{"bases": true, "records": true, "views": true}'),
('Notion', 'notion', 'workspace', 'All-in-one workspace for notes, tasks, and databases', 'oauth2', '{"pages": true, "databases": true, "blocks": true}'),

-- Document Signing
('DocuSign', 'docusign', 'documents', 'Digital signature and document management', 'oauth2', '{"envelopes": true, "templates": true, "signing": true}'),
('HelloSign', 'hellosign', 'documents', 'Simple electronic signature solution', 'api_key', '{"signatures": true, "templates": true}'),
('PandaDoc', 'pandadoc', 'documents', 'Document automation and e-signature platform', 'oauth2', '{"documents": true, "templates": true, "analytics": true}'),

-- Accounting
('QuickBooks', 'quickbooks', 'accounting', 'Small business accounting software', 'oauth2', '{"customers": true, "invoices": true, "payments": true}'),
('Xero', 'xero', 'accounting', 'Cloud accounting software', 'oauth2', '{"contacts": true, "invoices": true, "accounting": true}'),
('FreshBooks', 'freshbooks', 'accounting', 'Cloud accounting for small businesses', 'oauth2', '{"clients": true, "invoices": true, "expenses": true}'),

-- Customer Support
('Intercom', 'intercom', 'support', 'Customer messaging and support platform', 'oauth2', '{"conversations": true, "users": true, "articles": true}'),
('Help Scout', 'helpscout', 'support', 'Email-based customer support platform', 'oauth2', '{"conversations": true, "customers": true, "reports": true}'),
('Zendesk', 'zendesk', 'support', 'Customer service and engagement platform', 'oauth2', '{"tickets": true, "users": true, "organizations": true}'),

-- Meeting & Scheduling
('Calendly', 'calendly', 'scheduling', 'Automated scheduling and calendar management', 'oauth2', '{"events": true, "bookings": true, "availability": true}'),
('Acuity Scheduling', 'acuity', 'scheduling', 'Online appointment scheduling software', 'api_key', '{"appointments": true, "availability": true, "clients": true}'),
('Cal.com', 'calcom', 'scheduling', 'Open source scheduling infrastructure', 'api_key', '{"bookings": true, "availability": true, "integrations": true}'),

-- Analytics
('Google Analytics', 'google_analytics', 'analytics', 'Web analytics and reporting platform', 'oauth2', '{"reports": true, "realtime": true, "goals": true}'),
('Mixpanel', 'mixpanel', 'analytics', 'Product analytics platform', 'api_key', '{"events": true, "funnels": true, "retention": true}'),
('Amplitude', 'amplitude', 'analytics', 'Digital optimization platform', 'api_key', '{"events": true, "cohorts": true, "dashboards": true}'),
('Hotjar', 'hotjar', 'analytics', 'Website heatmaps and user behavior analytics', 'api_key', '{"heatmaps": true, "recordings": true, "surveys": true}'),

-- Development
('GitHub', 'github', 'development', 'Git repository hosting and collaboration', 'oauth2', '{"repositories": true, "issues": true, "webhooks": true}'),
('GitLab', 'gitlab', 'development', 'DevOps lifecycle management platform', 'oauth2', '{"projects": true, "issues": true, "pipelines": true}'),

-- Project Management
('Linear', 'linear', 'project_management', 'Modern software development project management', 'oauth2', '{"issues": true, "projects": true, "teams": true}'),
('Jira', 'jira', 'project_management', 'Issue tracking and project management', 'oauth2', '{"issues": true, "projects": true, "boards": true}'),
('Asana', 'asana', 'project_management', 'Work management platform for teams', 'oauth2', '{"tasks": true, "projects": true, "teams": true}'),
('Trello', 'trello', 'project_management', 'Visual project management with boards and cards', 'oauth2', '{"boards": true, "cards": true, "lists": true}'),

-- Additional Business
('Typeform', 'typeform', 'forms', 'Online form and survey builder', 'oauth2', '{"forms": true, "responses": true, "webhooks": true}'),
('Loom', 'loom', 'video', 'Screen and video recording platform', 'oauth2', '{"videos": true, "sharing": true, "analytics": true}'),

-- Calendar
('Google Calendar', 'google_calendar', 'calendar', 'Google calendar and scheduling', 'oauth2', '{"events": true, "calendars": true, "availability": true}'),
('Microsoft Outlook', 'outlook', 'calendar', 'Microsoft calendar and email', 'oauth2', '{"events": true, "calendars": true, "mail": true}'),

-- Email & Calendar
('Nylas', 'nylas', 'communication', 'Email, calendar, and contact API platform', 'api_key', '{"email": true, "calendar": true, "contacts": true, "scheduling": true}')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Enable RLS (Row Level Security)
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Integration providers are public (read-only)
DROP POLICY IF EXISTS "Integration providers are viewable by everyone" ON integration_providers;
CREATE POLICY "Integration providers are viewable by everyone" ON integration_providers
  FOR SELECT USING (true);

-- User integrations are private to the user
DROP POLICY IF EXISTS "Users can view own integrations" ON user_integrations;
CREATE POLICY "Users can view own integrations" ON user_integrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own integrations" ON user_integrations;
CREATE POLICY "Users can insert own integrations" ON user_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own integrations" ON user_integrations;
CREATE POLICY "Users can update own integrations" ON user_integrations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own integrations" ON user_integrations;
CREATE POLICY "Users can delete own integrations" ON user_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Integration events are private to the user
DROP POLICY IF EXISTS "Users can view own integration events" ON integration_events;
CREATE POLICY "Users can view own integration events" ON integration_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own integration events" ON integration_events;
CREATE POLICY "Users can insert own integration events" ON integration_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Integration webhooks are private to the user
DROP POLICY IF EXISTS "Users can view own integration webhooks" ON integration_webhooks;
CREATE POLICY "Users can view own integration webhooks" ON integration_webhooks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own integration webhooks" ON integration_webhooks;
CREATE POLICY "Users can insert own integration webhooks" ON integration_webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own integration webhooks" ON integration_webhooks;
CREATE POLICY "Users can update own integration webhooks" ON integration_webhooks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own integration webhooks" ON integration_webhooks;
CREATE POLICY "Users can delete own integration webhooks" ON integration_webhooks
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_provider_slug ON user_integrations(provider_slug);
CREATE INDEX IF NOT EXISTS idx_integration_events_user_id ON integration_events(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_integration_id ON integration_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_provider_slug ON integration_webhooks(provider_slug);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_integration_providers_updated_at ON integration_providers;
CREATE TRIGGER update_integration_providers_updated_at 
  BEFORE UPDATE ON integration_providers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_integrations_updated_at ON user_integrations;
CREATE TRIGGER update_user_integrations_updated_at 
  BEFORE UPDATE ON user_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_integration_webhooks_updated_at ON integration_webhooks;
CREATE TRIGGER update_integration_webhooks_updated_at 
  BEFORE UPDATE ON integration_webhooks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Step 3: Click "RUN" Button**

The SQL will:
✅ Create 4 integration tables  
✅ Insert 38 integration providers  
✅ Set up security policies  
✅ Create performance indexes  

### **Step 4: Verify Setup**

After running the SQL, you should see:
- `integration_providers` table with 38 rows
- `user_integrations` table (empty)
- `integration_events` table (empty)  
- `integration_webhooks` table (empty)

### **Step 5: Test Your Integrations**

Visit: http://localhost:3000/dashboard/integrations

You should now see all 38 integrations with real data instead of mock data!

---

## **🚨 IMPORTANT:** 
If you skip this step, the integrations page will use mock data and won't persist connections. Run the SQL to unlock full functionality!