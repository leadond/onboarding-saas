-- Safe schema update - only creates tables that don't exist
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kit Templates
CREATE TABLE IF NOT EXISTS kit_templates (
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

-- Kit Template Steps
CREATE TABLE IF NOT EXISTS kit_template_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES kit_templates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL,
    responsibility VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    estimated_duration_hours INTEGER DEFAULT 1,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Kits
CREATE TABLE IF NOT EXISTS company_kits (
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

-- Company Kit Steps
CREATE TABLE IF NOT EXISTS company_kit_steps (
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

-- Onboarding Sessions
CREATE TABLE IF NOT EXISTS onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kit_id UUID REFERENCES company_kits(id),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    assigned_user_id UUID REFERENCES user_profiles(id),
    status VARCHAR(50) DEFAULT 'active',
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step Instances
CREATE TABLE IF NOT EXISTS step_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES company_kit_steps(id),
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to VARCHAR(50),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    completion_data JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100),
    industry VARCHAR(100),
    content TEXT NOT NULL,
    is_global BOOLEAN DEFAULT false,
    company_name VARCHAR(255),
    created_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Templates
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_type VARCHAR(100),
    industry VARCHAR(100),
    fields JSONB NOT NULL,
    is_global BOOLEAN DEFAULT false,
    company_name VARCHAR(255),
    created_by UUID REFERENCES user_profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_instance_id UUID REFERENCES step_instances(id),
    form_template_id UUID REFERENCES form_templates(id),
    session_id UUID REFERENCES onboarding_sessions(id),
    submitted_by VARCHAR(50),
    submission_data JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Instances
CREATE TABLE IF NOT EXISTS document_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_instance_id UUID REFERENCES step_instances(id),
    template_id UUID REFERENCES document_templates(id),
    session_id UUID REFERENCES onboarding_sessions(id),
    document_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_url VARCHAR(500),
    signature_request_id VARCHAR(255),
    signature_status VARCHAR(50) DEFAULT 'pending',
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Requests
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_instance_id UUID REFERENCES step_instances(id),
    session_id UUID REFERENCES onboarding_sessions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Integrations
CREATE TABLE IF NOT EXISTS company_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    integration_type VARCHAR(100) NOT NULL,
    api_key_encrypted TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_name, integration_type)
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES onboarding_sessions(id),
    step_instance_id UUID REFERENCES step_instances(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(50),
    attendees JSONB DEFAULT '[]'::jsonb,
    calendar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analysis
CREATE TABLE IF NOT EXISTS ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_instance_id UUID REFERENCES document_instances(id),
    analysis_type VARCHAR(100),
    analysis_result JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
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
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies will be created in a separate script