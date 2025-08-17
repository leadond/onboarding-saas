-- Create Companies and Representatives Tables
-- Enables comprehensive client management with detailed company information and representative tracking

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    founded_year INTEGER,
    employee_count INTEGER,
    
    -- Address information
    street_address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Contact information
    phone VARCHAR(50),
    email VARCHAR(255),
    support_email VARCHAR(255),
    
    -- Social media
    linkedin_url TEXT,
    twitter_url TEXT,
    facebook_url TEXT,
    
    -- Business information
    tax_id VARCHAR(50),
    vat_number VARCHAR(50),
    duns_number VARCHAR(50),
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT companies_name_length CHECK (char_length(name) >= 2)
);

-- Create indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);

-- Company Representatives table
CREATE TABLE IF NOT EXISTS public.company_representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- For internal users
    
    -- Personal information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    
    -- Job information
    job_title VARCHAR(150),
    department VARCHAR(100),
    role VARCHAR(100), -- e.g., 'Decision Maker', 'Technical Contact', 'Billing Contact'
    
    -- Communication preferences
    preferred_contact_method VARCHAR(50) CHECK (preferred_contact_method IN ('email', 'phone', 'mobile', 'video_call')),
    timezone VARCHAR(50),
    availability TEXT,
    
    -- Status and permissions
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    is_primary BOOLEAN DEFAULT FALSE,
    can_approve BOOLEAN DEFAULT FALSE, -- Can approve contracts, payments, etc.
    can_view_pricing BOOLEAN DEFAULT FALSE, -- Can view pricing information
    
    -- Notes and metadata
    notes TEXT,
    tags TEXT[],
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT company_representatives_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    UNIQUE(company_id, email)
);

-- Create indexes for company representatives
CREATE INDEX IF NOT EXISTS idx_company_representatives_company_id ON company_representatives(company_id);
CREATE INDEX IF NOT EXISTS idx_company_representatives_email ON company_representatives(email);
CREATE INDEX IF NOT EXISTS idx_company_representatives_user_id ON company_representatives(user_id);
CREATE INDEX IF NOT EXISTS idx_company_representatives_status ON company_representatives(status);
CREATE INDEX IF NOT EXISTS idx_company_representatives_is_primary ON company_representatives(is_primary);
CREATE INDEX IF NOT EXISTS idx_company_representatives_tags ON company_representatives USING GIN(tags);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_representatives ENABLE ROW LEVEL SECURITY;

-- Companies RLS Policies
-- Users can view companies in their organization
CREATE POLICY "Users can view companies in their organization" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organizations o
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid() 
            AND om.status = 'active'
        )
    );

-- Organization admins can manage companies
CREATE POLICY "Organization admins can manage companies" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organizations o
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid() 
            AND om.role IN ('owner', 'admin') 
            AND om.status = 'active'
        )
    );

-- Company representatives RLS Policies
-- Users can view representatives for companies they have access to
CREATE POLICY "Users can view company representatives" ON company_representatives
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM companies c
            JOIN organizations o ON TRUE  -- This will be refined when we have the client_relationships table
            JOIN organization_members om ON o.id = om.organization_id
            WHERE c.id = company_representatives.company_id
            AND om.user_id = auth.uid()
            AND om.status = 'active'
        )
    );

-- Organization admins can manage company representatives
CREATE POLICY "Organization admins can manage company representatives" ON company_representatives
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM companies c
            JOIN organizations o ON TRUE  -- This will be refined when we have the client_relationships table
            JOIN organization_members om ON o.id = om.organization_id
            WHERE c.id = company_representatives.company_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
    );

-- Add company_id to client_progress table
ALTER TABLE public.client_progress 
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Add representative_id to track which representative is working with the client
ALTER TABLE public.client_progress 
ADD COLUMN representative_id UUID REFERENCES company_representatives(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_progress_company_id ON client_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_representative_id ON client_progress(representative_id);

-- Add company_id to kits table for company-specific kits
ALTER TABLE public.kits 
ADD COLUMN company_id UUID REFERENCES companies(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_kits_company_id ON kits(company_id);

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_companies 
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_company_representatives 
    BEFORE UPDATE ON company_representatives
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();