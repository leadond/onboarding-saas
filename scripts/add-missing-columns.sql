-- Add missing columns to existing tables
-- Run this in Supabase SQL Editor

-- Add all missing columns to kit_templates
ALTER TABLE kit_templates ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE kit_templates ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE kit_templates ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE kit_templates ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE kit_templates ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE kit_templates ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0.0';