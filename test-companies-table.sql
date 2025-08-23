-- Test if companies table exists and create it if not
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    description TEXT,
    website_url TEXT,
    industry VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Add simple policies
DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can manage companies" ON companies;

CREATE POLICY "Authenticated users can view companies" ON companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage companies" ON companies
  FOR ALL USING (auth.uid() IS NOT NULL);