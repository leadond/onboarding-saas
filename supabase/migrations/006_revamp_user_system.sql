-- Add google_id column to link Google auth to existing accounts
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Create index for google_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id ON user_profiles(google_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- Update RLS policies to handle both email/password and Google auth
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- New policies that work with both auth methods
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (
    auth.uid() = auth_user_id OR 
    auth.email() = email
  );

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = auth_user_id OR 
    auth.email() = email
  );