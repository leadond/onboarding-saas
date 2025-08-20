-- Migrate existing company data to companies table
-- This script extracts unique companies from clients and creates company records

-- First, create companies table if it doesn't exist
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

-- Insert unique companies from clients table
INSERT INTO companies (name, created_by, created_at)
SELECT DISTINCT 
    COALESCE(company, 'Unknown Company') as name,
    owner_id as created_by,
    MIN(created_at) as created_at
FROM clients 
WHERE company IS NOT NULL 
  AND company != ''
  AND NOT EXISTS (
    SELECT 1 FROM companies c WHERE c.name = clients.company
  )
GROUP BY company, owner_id;

-- Update clients to reference company IDs (if needed for future use)
-- This would require adding a company_id column to clients table first
-- ALTER TABLE clients ADD COLUMN company_id UUID REFERENCES companies(id);

-- Show results
SELECT 'Migration completed. Companies created:' as status;
SELECT COUNT(*) as total_companies FROM companies;
SELECT name, created_at FROM companies ORDER BY created_at;