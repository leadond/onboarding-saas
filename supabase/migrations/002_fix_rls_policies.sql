-- Drop existing policies
DROP POLICY IF EXISTS "Global admin can insert profiles" ON user_profiles;

-- Allow users to insert their own profile (for initial setup)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow global admin email to insert any profile
CREATE POLICY "Global admin email can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.email() = 'leadond@gmail.com'
  );

-- Allow global admin email to update any profile
CREATE POLICY "Global admin email can update all profiles" ON user_profiles
  FOR UPDATE USING (
    auth.email() = 'leadond@gmail.com'
  );

-- Allow global admin email to view all profiles  
CREATE POLICY "Global admin email can view all profiles" ON user_profiles
  FOR SELECT USING (
    auth.email() = 'leadond@gmail.com'
  );