-- Create tables for kit assignments
-- Run this in Supabase SQL Editor

-- Create company_kits table for kit assignments
CREATE TABLE IF NOT EXISTS company_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL,
    company_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_kits ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users manage their kit assignments" ON company_kits
    FOR ALL USING (assigned_by = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_company_kits_kit_id ON company_kits(kit_id);
CREATE INDEX IF NOT EXISTS idx_company_kits_company_id ON company_kits(company_id);
CREATE INDEX IF NOT EXISTS idx_company_kits_assigned_by ON company_kits(assigned_by);

-- Add metadata column to kits table if it doesn't exist
ALTER TABLE kits ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Verify tables
SELECT 'Assignment tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'company_kits', 'kits');