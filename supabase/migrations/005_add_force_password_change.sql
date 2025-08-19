-- Add force_password_change column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;