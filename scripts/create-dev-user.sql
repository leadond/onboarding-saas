-- Development script to create a user with Pro subscription tier
-- Run this after database reset to fix the kit limit issue

-- First, let's ensure we have a development user in Supabase Auth
-- This user ID should match a real authenticated user in your Supabase project

-- Option 1: Create/Update user with Pro tier (25 kit limit)
INSERT INTO public.users (
  id,
  email,
  full_name,
  company_name,
  subscription_status,
  subscription_tier,
  created_at,
  updated_at
) VALUES (
  -- Replace this UUID with your actual authenticated user ID from Supabase Auth
  -- You can get this from: SELECT auth.uid() when logged in
  '00000000-0000-0000-0000-000000000001'::uuid,
  'dev@onboardkit.com',
  'Development User',
  'OnboardKit Development',
  'active',
  'pro',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  subscription_status = 'active',
  subscription_tier = 'pro',
  updated_at = NOW();

-- Option 2: Alternative - Create Enterprise tier (unlimited kits)
-- INSERT INTO public.users (
--   id,
--   email,
--   full_name,
--   company_name,
--   subscription_status,
--   subscription_tier,
--   created_at,
--   updated_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000001'::uuid,
--   'dev@onboardkit.com',
--   'Development User',
--   'OnboardKit Development',
--   'active',
--   'enterprise',
--   NOW(),
--   NOW()
-- ) ON CONFLICT (id) DO UPDATE SET
--   subscription_status = 'active',
--   subscription_tier = 'enterprise',
--   updated_at = NOW();

-- Verify the user was created/updated
SELECT 
  id,
  email,
  subscription_status,
  subscription_tier,
  created_at
FROM public.users 
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

-- Test the kit limit function
SELECT auth.user_within_kit_limit() as can_create_kits;

-- Check current kit count
SELECT COUNT(*) as current_kits
FROM public.kits 
WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid
AND status != 'archived';