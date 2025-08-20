-- Create companies table for OnboardHero
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    industry VARCHAR(100),
    website_url TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for companies
CREATE POLICY "Users can manage their companies" ON companies
    FOR ALL USING (
        created_by = auth.uid()
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Add update trigger
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_companies_updated_at();

-- Insert sample companies from existing client data
INSERT INTO companies (name, legal_name, industry, created_by)
SELECT DISTINCT 
    COALESCE(company, 'Unknown Company') as name,
    COALESCE(company, 'Unknown Company') as legal_name,
    'General' as industry,
    owner_id as created_by
FROM clients 
WHERE company IS NOT NULL 
  AND company != ''
  AND NOT EXISTS (
    SELECT 1 FROM companies c WHERE c.name = clients.company
  )
ON CONFLICT DO NOTHING;

-- Show results
SELECT 'Companies table created and populated successfully!' as status;
SELECT COUNT(*) as total_companies FROM companies;
SELECT name, legal_name, industry, created_at FROM companies ORDER BY created_at;