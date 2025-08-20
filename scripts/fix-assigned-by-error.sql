-- Fix for "column assigned_by does not exist" error
-- Run this in your Supabase SQL Editor

-- First, check if the columns exist and add them if missing
DO $$
BEGIN
    -- Add assigned_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_kits' AND column_name = 'assigned_by'
    ) THEN
        ALTER TABLE company_kits ADD COLUMN assigned_by UUID REFERENCES user_profiles(id);
    END IF;

    -- Add assigned_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_kits' AND column_name = 'assigned_at'
    ) THEN
        ALTER TABLE company_kits ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add is_active column if it doesn't exist (it should already exist based on schema)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_kits' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE company_kits ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_company_kits_assigned_by ON company_kits(assigned_by);
CREATE INDEX IF NOT EXISTS idx_company_kits_assigned_at ON company_kits(assigned_at);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'company_kits' 
AND column_name IN ('assigned_by', 'assigned_at', 'is_active')
ORDER BY column_name;