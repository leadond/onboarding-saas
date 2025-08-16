# Supabase Setup Guide for OnboardKit

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Choose a name: `onboardkit-production`
4. Set password and region
5. Wait for project to be ready

### 2. Get Your Credentials
From your Supabase dashboard:

**Project Settings → API:**
- `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role secret` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

### 3. Basic Database Setup (Optional)
Run this SQL in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a simple users table (optional - app works without it)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free',
  subscription_tier TEXT DEFAULT 'free',
  trial_ends_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read/write their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4. Authentication Settings
In Supabase Dashboard:

**Authentication → Settings:**
- Site URL: `https://onboard.devapphero.com`
- Redirect URLs: 
  - `https://onboard.devapphero.com/api/auth/callback`
  - `https://onboarding-saas-cvrsg4zuv-derrick-ls-projects.vercel.app/api/auth/callback`

**Authentication → Providers:**
- Enable Email (already enabled)
- For Google OAuth: Add your Google Client ID/Secret
- For Microsoft OAuth: Add your Microsoft Client ID/Secret

### 5. Test Authentication
Once configured, your app will support:
- ✅ Email/Password signup and login
- ✅ Email verification
- ✅ Password reset
- ✅ Google OAuth (if configured)
- ✅ Microsoft OAuth (if configured)

## Minimal Working Setup
The app will work with just these 3 environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

OAuth providers are optional and can be added later.