-- Fix Companies Table RLS Policies
-- This script adds proper RLS policies for the companies table

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view companies in their organization" ON companies;
DROP POLICY IF EXISTS "Organization admins can manage companies" ON companies;

-- Add simple authenticated user policies for companies
CREATE POLICY "Authenticated users can view companies" ON companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage companies" ON companies
  FOR ALL USING (auth.uid() IS NOT NULL);