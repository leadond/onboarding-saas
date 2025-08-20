-- Add missing assigned_by column to company_kits table
-- This fixes the "column assigned_by does not exist" error

ALTER TABLE company_kits ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES user_profiles(id);
ALTER TABLE company_kits ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE company_kits ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_company_kits_assigned_by ON company_kits(assigned_by);
CREATE INDEX IF NOT EXISTS idx_company_kits_assigned_at ON company_kits(assigned_at);