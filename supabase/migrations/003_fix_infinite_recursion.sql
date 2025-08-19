-- Drop all existing policies to fix infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Global admin can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Global admin can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Global admin can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Global admin email can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Global admin email can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Global admin email can view all profiles" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Allow own profile access" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow global admin email full access" ON user_profiles
  FOR ALL USING (auth.email() = 'leadond@gmail.com');