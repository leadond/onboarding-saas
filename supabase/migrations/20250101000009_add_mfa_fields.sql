-- Add MFA fields to users table
ALTER TABLE users
ADD mfa_enabled BIT DEFAULT 0;

ALTER TABLE users
ADD mfa_secret NVARCHAR(MAX);