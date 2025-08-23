-- Migration to add BETA tier and trial tracking fields to user_profiles table

ALTER TABLE user_profiles
ADD subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('beta', 'starter', 'professional', 'enterprise', 'enterprise_plus'));

ALTER TABLE user_profiles
ADD trial_start_date TIMESTAMPTZ;

ALTER TABLE user_profiles
ADD trial_end_date TIMESTAMPTZ;

ALTER TABLE user_profiles
ADD trial_active BOOLEAN DEFAULT false;

-- Add index on subscription_tier for query performance
CREATE INDEX idx_user_profiles_subscription_tier ON user_profiles(subscription_tier);

-- Add index on trial_active for query performance
CREATE INDEX idx_user_profiles_trial_active ON user_profiles(trial_active);