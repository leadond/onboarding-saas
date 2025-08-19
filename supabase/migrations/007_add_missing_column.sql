-- Add force_password_change column if it doesn't exist
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE;