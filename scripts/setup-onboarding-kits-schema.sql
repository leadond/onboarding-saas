-- Onboarding Kits System Database Schema
-- This schema supports the complete onboarding kit marketplace and workflow system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kit Templates (Global templates created by global admin)
CREATE TABLE kit_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    category VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Kit Template Steps (Steps within a template)
CREATE TABLE kit_template_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES kit_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL, -- 'form', 'document', 'payment', 'approval', 'task', 'calendar'
    responsibility VARCHAR(50) NOT NULL, -- 'client', 'company', 'both'
    is_required BOOLEAN DEFAULT true,
    estimated_duration_hours INTEGER DEFAULT 1,
    config JSONB DEFAULT '{}'::jsonb, -- Step-specific configuration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Kits (Instances of templates customized by companies)
CREATE TABLE company_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES kit_templates(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    customizations JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Kit Steps (Customized steps for company kits)
CREATE TABLE company_kit_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_id UUID REFERENCES company_kits(id) ON DELETE CASCADE,
    template_step_id UUID REFERENCES kit_template_steps(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    responsibility VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    estimated_duration_hours INTEGER DEFAULT 1,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Onboarding Sessions (Active onboarding processes)
CREATE TABLE onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_id UUID REFERENCES company_kits(id),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    assigned_user_id UUID REFERENCES user_profiles(id),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step Instances (Individual step executions within sessions)
CREATE TABLE step_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES company_kit_steps(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped', 'blocked'
    assigned_to VARCHAR(50), -- 'client', 'company', 'both'
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    completion_data JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Templates
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100), -- 'contract', 'agreement', 'form', 'checklist'
    industry VARCHAR(100),
    content TEXT NOT NULL, -- HTML/Markdown content with placeholders
    is_global BOOLEAN DEFAULT false, -- Global templates available to all
    company_name VARCHAR(255), -- Company-specific templates
    created_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Templates
CREATE TABLE form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_type VARCHAR(100), -- 'intake', 'survey', 'application', 'feedback'
    industry VARCHAR(100),
    fields JSONB NOT NULL, -- Form field definitions
    is_global BOOLEAN DEFAULT false,
    company_name VARCHAR(255),
    created_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_instance_id UUID REFERENCES step_instances(id),
    form_template_id UUID REFERENCES form_templates(id),
    session_id UUID REFERENCES onboarding_sessions(id),
    submitted_by VARCHAR(50), -- 'client', 'company'
    submission_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Instances (Generated documents for sessions)
CREATE TABLE document_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_instance_id UUID REFERENCES step_instances(id),
    template_id UUID REFERENCES document_templates(id),
    session_id UUID REFERENCES onboarding_sessions(id),
    document_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Populated content
    file_url VARCHAR(500), -- S3 URL if generated as PDF
    signature_request_id VARCHAR(255), -- BoldSign request ID
    signature_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'signed', 'declined', 'expired'
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Uploads
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_instance_id UUID REFERENCES step_instances(id),
    session_id UUID REFERENCES onboarding_sessions(id),
    original_filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL, -- S3 URL
    file_size INTEGER,
    file_type VARCHAR(100),
    uploaded_by VARCHAR(50), -- 'client', 'company'
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Requests
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_instance_id UUID REFERENCES step_instances(id),
    session_id UUID REFERENCES onboarding_sessions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications & Communications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES onboarding_sessions(id),
    step_instance_id UUID REFERENCES step_instances(id),
    recipient_type VARCHAR(50), -- 'client', 'company', 'assigned_user'
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    notification_type VARCHAR(50), -- 'email', 'sms', 'both'
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Integrations (API keys and settings per company)
CREATE TABLE company_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    integration_type VARCHAR(100) NOT NULL, -- 'stripe', 'twilio', 'boldsign', etc.
    api_key_encrypted TEXT, -- Encrypted API key
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_name, integration_type)
);

-- Calendar Events
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES onboarding_sessions(id),
    step_instance_id UUID REFERENCES step_instances(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50), -- 'deadline', 'meeting', 'reminder'
    attendees JSONB DEFAULT '[]'::jsonb,
    calendar_url VARCHAR(500), -- iCal URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analysis Results
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_instance_id UUID REFERENCES document_instances(id),
    analysis_type VARCHAR(100), -- 'legal_review', 'error_check', 'compliance'
    analysis_result JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_kit_templates_industry ON kit_templates(industry);
CREATE INDEX idx_kit_templates_category ON kit_templates(category);
CREATE INDEX idx_company_kits_company ON company_kits(company_name);
CREATE INDEX idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX idx_onboarding_sessions_assigned_user ON onboarding_sessions(assigned_user_id);
CREATE INDEX idx_step_instances_session ON step_instances(session_id);
CREATE INDEX idx_step_instances_status ON step_instances(status);
CREATE INDEX idx_document_instances_session ON document_instances(session_id);
CREATE INDEX idx_form_submissions_session ON form_submissions(session_id);
CREATE INDEX idx_notifications_session ON notifications(session_id);
CREATE INDEX idx_company_integrations_company ON company_integrations(company_name);

-- Add RLS policies
ALTER TABLE kit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_kit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- Global admin can see all kit templates
CREATE POLICY "Global admin full access to kit templates" ON kit_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

-- Users can see active global templates and their company's templates
CREATE POLICY "Users can view available kit templates" ON kit_templates
    FOR SELECT USING (
        is_active = true AND (
            created_by IN (
                SELECT id FROM user_profiles 
                WHERE auth_user_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_profiles.auth_user_id = auth.uid() 
                AND user_profiles.role = 'global_admin'
            )
        )
    );

-- Company users can manage their own kits
CREATE POLICY "Company users manage their kits" ON company_kits
    FOR ALL USING (
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Company kits policies
CREATE POLICY "Company users manage their kits" ON company_kits
    FOR ALL USING (
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Company kit steps policies
CREATE POLICY "Company users manage their kit steps" ON company_kit_steps
    FOR ALL USING (
        kit_id IN (
            SELECT id FROM company_kits 
            WHERE company_name IN (
                SELECT company_name FROM user_profiles 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Onboarding sessions policies
CREATE POLICY "Company users manage their sessions" ON onboarding_sessions
    FOR ALL USING (
        kit_id IN (
            SELECT id FROM company_kits 
            WHERE company_name IN (
                SELECT company_name FROM user_profiles 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Step instances policies
CREATE POLICY "Users manage step instances" ON step_instances
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- Document templates policies
CREATE POLICY "Users can view document templates" ON document_templates
    FOR SELECT USING (
        is_global = true OR 
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

CREATE POLICY "Company users manage their document templates" ON document_templates
    FOR INSERT WITH CHECK (
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

-- Form templates policies
CREATE POLICY "Users can view form templates" ON form_templates
    FOR SELECT USING (
        is_global = true OR 
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

-- Form submissions policies
CREATE POLICY "Users manage form submissions" ON form_submissions
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- Document instances policies
CREATE POLICY "Users manage document instances" ON document_instances
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- File uploads policies
CREATE POLICY "Users manage file uploads" ON file_uploads
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- Payment requests policies
CREATE POLICY "Users manage payment requests" ON payment_requests
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- Notifications policies
CREATE POLICY "Users manage notifications" ON notifications
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- Company integrations policies
CREATE POLICY "Company users manage their integrations" ON company_integrations
    FOR ALL USING (
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Calendar events policies
CREATE POLICY "Users manage calendar events" ON calendar_events
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

-- AI analysis policies
CREATE POLICY "Users view AI analysis" ON ai_analysis
    FOR SELECT USING (
        document_instance_id IN (
            SELECT id FROM document_instances 
            WHERE session_id IN (
                SELECT id FROM onboarding_sessions 
                WHERE kit_id IN (
                    SELECT id FROM company_kits 
                    WHERE company_name IN (
                        SELECT company_name FROM user_profiles 
                        WHERE auth_user_id = auth.uid()
                    )
                )
            )
        )
    );