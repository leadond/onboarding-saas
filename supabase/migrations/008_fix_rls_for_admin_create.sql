-- Allow admins to create user profiles
CREATE POLICY "Admins can create user profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles admin_profile 
      WHERE admin_profile.auth_user_id = auth.uid() 
      AND admin_profile.role IN ('admin', 'super_admin', 'global_admin')
    )
    OR auth.email() = 'leadond@gmail.com'
  );