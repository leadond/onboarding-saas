-- Migration to set force_password_change flag for owner account

UPDATE user_profiles
SET force_password_change = TRUE,
    updated_at = NOW()
WHERE email = 'leadond@gmail.com';