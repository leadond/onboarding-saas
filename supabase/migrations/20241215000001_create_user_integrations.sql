-- User Integrations Table
-- Stores user connections to various integration providers (email marketing, CRM, calendar, etc.)

CREATE TABLE IF NOT EXISTS public.user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Integration details
    integration_type VARCHAR(50) NOT NULL, -- 'email_marketing', 'crm', 'calendar', 'storage', etc.
    provider_id VARCHAR(100) NOT NULL, -- 'mailchimp', 'salesforce', 'gmail', etc.
    provider_name VARCHAR(255) NOT NULL,
    
    -- Connection status
    status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending', 'expired')),
    
    -- Credentials (encrypted in production)
    credentials JSONB DEFAULT '{}', -- Store encrypted API keys, tokens, etc.
    
    -- Configuration and settings
    config JSONB DEFAULT '{}', -- Provider-specific configuration
    field_mappings JSONB DEFAULT '[]', -- Field mapping configuration for CRM integrations
    sync_settings JSONB DEFAULT '{}', -- Sync frequency, direction, etc.
    
    -- Connection metadata
    connection_data JSONB DEFAULT '{}', -- Data returned from connection test
    scopes TEXT[], -- OAuth scopes granted
    
    -- Sync tracking
    last_sync_at TIMESTAMPTZ,
    sync_frequency VARCHAR(20) DEFAULT 'manual' CHECK (sync_frequency IN ('real-time', 'hourly', 'daily', 'weekly', 'manual')),
    auto_sync BOOLEAN DEFAULT false,
    
    -- Error tracking
    error_count INTEGER DEFAULT 0,
    last_error_at TIMESTAMPTZ,
    last_error_message TEXT,
    
    -- Usage statistics
    sync_stats JSONB DEFAULT '{}', -- sync counts, success rates, etc.
    usage_stats JSONB DEFAULT '{}', -- API calls, data volume, etc.
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    connected_at TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE(user_id, integration_type, provider_id),
    CONSTRAINT valid_integration_type CHECK (integration_type ~ '^[a-z_]+$'),
    CONSTRAINT valid_provider_id CHECK (provider_id ~ '^[a-z0-9_-]+$')
);

-- Indexes for performance
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_user_integrations_org_id ON user_integrations(organization_id);
CREATE INDEX idx_user_integrations_type ON user_integrations(integration_type);
CREATE INDEX idx_user_integrations_provider ON user_integrations(provider_id);
CREATE INDEX idx_user_integrations_status ON user_integrations(status);
CREATE INDEX idx_user_integrations_last_sync ON user_integrations(last_sync_at DESC);
CREATE INDEX idx_user_integrations_created_at ON user_integrations(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_user_integrations_user_type ON user_integrations(user_id, integration_type);
CREATE INDEX idx_user_integrations_user_status ON user_integrations(user_id, status);
CREATE INDEX idx_user_integrations_type_status ON user_integrations(integration_type, status);

-- Integration sync logs table
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES user_integrations(id) ON DELETE CASCADE,
    
    -- Sync details
    sync_type VARCHAR(50) NOT NULL, -- 'manual', 'scheduled', 'webhook', 'real-time'
    sync_direction VARCHAR(20) NOT NULL DEFAULT 'bidirectional' CHECK (sync_direction IN ('bidirectional', 'to_provider', 'from_provider')),
    
    -- Sync results
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Error tracking
    errors JSONB DEFAULT '[]', -- Array of error objects
    warnings JSONB DEFAULT '[]', -- Array of warning objects
    
    -- Metadata
    metadata JSONB DEFAULT '{}', -- Sync-specific metadata
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sync logs
CREATE INDEX idx_integration_sync_logs_integration_id ON integration_sync_logs(integration_id);
CREATE INDEX idx_integration_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX idx_integration_sync_logs_started_at ON integration_sync_logs(started_at DESC);
CREATE INDEX idx_integration_sync_logs_completed_at ON integration_sync_logs(completed_at DESC);

-- Integration providers configuration table
CREATE TABLE IF NOT EXISTS public.integration_providers (
    id VARCHAR(100) PRIMARY KEY, -- 'mailchimp', 'salesforce', etc.
    name VARCHAR(255) NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    
    -- Provider details
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    documentation_url TEXT,
    
    -- Capabilities
    features TEXT[] DEFAULT '{}',
    supported_auth_methods TEXT[] DEFAULT '{}', -- 'api_key', 'oauth2', 'basic_auth'
    supported_scopes TEXT[] DEFAULT '{}',
    
    -- Configuration
    config_schema JSONB DEFAULT '{}', -- JSON schema for provider configuration
    field_schema JSONB DEFAULT '{}', -- Available fields for mapping
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_beta BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Metadata
    setup_complexity VARCHAR(20) DEFAULT 'medium' CHECK (setup_complexity IN ('easy', 'medium', 'complex')),
    pricing_info TEXT,
    popularity_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for providers
CREATE INDEX idx_integration_providers_type ON integration_providers(integration_type);
CREATE INDEX idx_integration_providers_active ON integration_providers(is_active);
CREATE INDEX idx_integration_providers_popularity ON integration_providers(popularity_score DESC);

-- Insert default integration providers
INSERT INTO integration_providers (id, name, integration_type, description, features, supported_auth_methods, setup_complexity, popularity_score) VALUES
-- Email Marketing Providers
('mailchimp', 'Mailchimp', 'email_marketing', 'Connect with Mailchimp for powerful email marketing automation and audience management.', 
 ARRAY['Email Campaigns', 'Audience Segmentation', 'Marketing Automation', 'A/B Testing', 'Analytics & Reporting', 'Landing Pages'], 
 ARRAY['api_key'], 'easy', 95),
 
('convertkit', 'ConvertKit', 'email_marketing', 'Integrate with ConvertKit for creator-focused email marketing and subscriber management.',
 ARRAY['Email Sequences', 'Subscriber Tagging', 'Landing Pages', 'Forms & Opt-ins', 'Visual Automations', 'Creator Commerce'],
 ARRAY['api_key'], 'easy', 85),
 
('hubspot', 'HubSpot', 'email_marketing', 'Connect with HubSpot CRM and marketing tools for comprehensive customer relationship management.',
 ARRAY['CRM Integration', 'Marketing Automation', 'Lead Scoring', 'Contact Management', 'Email Templates', 'Analytics Dashboard'],
 ARRAY['oauth2', 'api_key'], 'medium', 90),
 
('klaviyo', 'Klaviyo', 'email_marketing', 'Integrate with Klaviyo for data-driven email marketing and customer insights.',
 ARRAY['Behavioral Targeting', 'Predictive Analytics', 'SMS Marketing', 'Dynamic Content', 'Customer Profiles', 'Revenue Attribution'],
 ARRAY['api_key'], 'medium', 88),
 
('activecampaign', 'ActiveCampaign', 'email_marketing', 'Connect with ActiveCampaign for customer experience automation and personalization.',
 ARRAY['Marketing Automation', 'CRM & Sales', 'Machine Learning', 'Site Tracking', 'Event Tracking', 'Predictive Sending'],
 ARRAY['api_key'], 'medium', 82),
 
('mailerlite', 'MailerLite', 'email_marketing', 'Integrate with MailerLite for simple yet powerful email marketing tools.',
 ARRAY['Drag & Drop Editor', 'Automation Workflows', 'Landing Pages', 'Pop-ups & Forms', 'Subscriber Management', 'A/B Testing'],
 ARRAY['api_key'], 'easy', 78),

-- CRM Providers
('salesforce', 'Salesforce', 'crm', 'World''s #1 CRM platform with comprehensive sales and marketing tools.',
 ARRAY['Leads', 'Contacts', 'Opportunities', 'Accounts', 'Custom Objects', 'Workflows', 'Reports'],
 ARRAY['oauth2'], 'complex', 98),
 
('hubspot_crm', 'HubSpot CRM', 'crm', 'Inbound marketing and sales platform with integrated CRM.',
 ARRAY['Contacts', 'Deals', 'Companies', 'Marketing Lists', 'Email Campaigns', 'Analytics'],
 ARRAY['oauth2', 'api_key'], 'medium', 92),
 
('pipedrive', 'Pipedrive', 'crm', 'Sales-focused CRM designed for small teams and growing businesses.',
 ARRAY['Persons', 'Organizations', 'Deals', 'Activities', 'Pipelines', 'Custom Fields'],
 ARRAY['api_key'], 'easy', 85),
 
('zoho_crm', 'Zoho CRM', 'crm', 'Complete business suite with comprehensive CRM capabilities.',
 ARRAY['Leads', 'Contacts', 'Deals', 'Accounts', 'Campaigns', 'Analytics', 'Automation'],
 ARRAY['oauth2'], 'medium', 80),
 
-- Calendar Providers
('google_calendar', 'Google Calendar', 'calendar', 'Sync with Google Calendar for scheduling and availability management.',
 ARRAY['Event Management', 'Availability Checking', 'Meeting Scheduling', 'Reminders', 'Calendar Sharing'],
 ARRAY['oauth2'], 'medium', 95),
 
('outlook_calendar', 'Outlook Calendar', 'calendar', 'Microsoft Outlook calendar integration for business scheduling.',
 ARRAY['Event Management', 'Meeting Scheduling', 'Room Booking', 'Availability', 'Teams Integration'],
 ARRAY['oauth2'], 'medium', 90),

-- Storage Providers  
('google_drive', 'Google Drive', 'storage', 'Cloud storage integration with Google Drive.',
 ARRAY['File Storage', 'Document Sharing', 'Collaboration', 'Version Control'],
 ARRAY['oauth2'], 'medium', 92),
 
('dropbox', 'Dropbox', 'storage', 'Secure cloud storage and file sharing platform.',
 ARRAY['File Storage', 'File Sharing', 'Team Folders', 'Version History'],
 ARRAY['oauth2'], 'medium', 88);

-- Row Level Security (RLS)
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_integrations
CREATE POLICY "Users can view their own integrations" ON user_integrations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own integrations" ON user_integrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own integrations" ON user_integrations
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own integrations" ON user_integrations
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for integration_sync_logs
CREATE POLICY "Users can view sync logs for their integrations" ON integration_sync_logs
    FOR SELECT USING (
        integration_id IN (
            SELECT id FROM user_integrations WHERE user_id = auth.uid()
        )
    );

-- Add updated_at trigger for user_integrations
CREATE TRIGGER update_user_integrations_updated_at 
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_providers_updated_at 
    BEFORE UPDATE ON integration_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for integration management

-- Function to get user's integrations by type
CREATE OR REPLACE FUNCTION get_user_integrations(
    user_uuid UUID,
    integration_type_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    integration_type VARCHAR,
    provider_id VARCHAR,
    provider_name VARCHAR,
    status VARCHAR,
    last_sync_at TIMESTAMPTZ,
    config JSONB,
    sync_stats JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ui.id,
        ui.integration_type,
        ui.provider_id,
        ui.provider_name,
        ui.status,
        ui.last_sync_at,
        ui.config,
        ui.sync_stats
    FROM user_integrations ui
    WHERE ui.user_id = user_uuid
    AND (integration_type_filter IS NULL OR ui.integration_type = integration_type_filter)
    ORDER BY ui.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update integration sync status
CREATE OR REPLACE FUNCTION update_integration_sync_status(
    integration_uuid UUID,
    sync_successful BOOLEAN,
    records_processed INTEGER DEFAULT 0,
    error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_integrations 
    SET 
        last_sync_at = NOW(),
        error_count = CASE 
            WHEN sync_successful THEN 0 
            ELSE error_count + 1 
        END,
        last_error_at = CASE 
            WHEN NOT sync_successful THEN NOW() 
            ELSE last_error_at 
        END,
        last_error_message = CASE 
            WHEN NOT sync_successful THEN error_message 
            ELSE NULL 
        END,
        sync_stats = jsonb_set(
            COALESCE(sync_stats, '{}'),
            '{last_sync}',
            jsonb_build_object(
                'timestamp', NOW(),
                'successful', sync_successful,
                'records_processed', records_processed
            )
        )
    WHERE id = integration_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log integration activity
CREATE OR REPLACE FUNCTION log_integration_activity(
    integration_uuid UUID,
    activity_type VARCHAR,
    activity_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
    log_id UUID;
BEGIN
    -- Get user_id from integration
    SELECT user_id INTO user_uuid 
    FROM user_integrations 
    WHERE id = integration_uuid;
    
    -- Log the activity in audit_logs
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        user_uuid,
        activity_type,
        'integration',
        integration_uuid,
        activity_details
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log integration changes
CREATE OR REPLACE FUNCTION trigger_log_integration_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_integration_activity(
            NEW.id,
            'integration_connected',
            jsonb_build_object(
                'provider', NEW.provider_name,
                'type', NEW.integration_type
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            PERFORM log_integration_activity(
                NEW.id,
                CASE NEW.status
                    WHEN 'connected' THEN 'integration_reconnected'
                    WHEN 'disconnected' THEN 'integration_disconnected'
                    WHEN 'error' THEN 'integration_error'
                    ELSE 'integration_status_changed'
                END,
                jsonb_build_object(
                    'old_status', OLD.status,
                    'new_status', NEW.status,
                    'provider', NEW.provider_name
                )
            );
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_integration_activity(
            OLD.id,
            'integration_deleted',
            jsonb_build_object(
                'provider', OLD.provider_name,
                'type', OLD.integration_type
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER integration_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_integrations
    FOR EACH ROW EXECUTE FUNCTION trigger_log_integration_changes();