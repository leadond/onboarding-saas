-- Security logging and rate limiting tables
-- This migration adds tables for security monitoring and rate limiting

-- Create security_logs table for auditing security events
CREATE TABLE security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  path TEXT,
  method TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rate_limits table for rate limiting
CREATE TABLE rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  reset_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_event ON security_logs(event);
CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX idx_security_logs_ip_address ON security_logs(ip_address);
CREATE INDEX idx_rate_limits_key ON rate_limits(key);
CREATE INDEX idx_rate_limits_reset_time ON rate_limits(reset_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_security_logs_updated_at 
    BEFORE UPDATE ON security_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at 
    BEFORE UPDATE ON rate_limits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits 
    WHERE reset_time < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old security logs (optional, for data retention)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Keep logs for 90 days by default
    DELETE FROM security_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for security analytics
CREATE OR REPLACE VIEW security_events_summary AS
SELECT 
    event,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT ip_address) as unique_ips,
    MIN(timestamp) as first_occurrence,
    MAX(timestamp) as last_occurrence
FROM security_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY event
ORDER BY event_count DESC;

-- Create view for failed login attempts
CREATE OR REPLACE VIEW failed_login_attempts AS
SELECT 
    sl.*,
    u.email as user_email
FROM security_logs sl
LEFT JOIN auth.users u ON sl.user_id = u.id
WHERE sl.event = 'login_failed'
AND sl.timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY sl.timestamp DESC;

-- Create view for suspicious activity
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT 
    sl.*,
    u.email as user_email
FROM security_logs sl
LEFT JOIN auth.users u ON sl.user_id = u.id
WHERE sl.event IN ('login_failed', 'signup_failed', 'suspicious_request')
AND sl.timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY sl.timestamp DESC;

-- Add RLS (Row Level Security) policies
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for security_logs: Users can only see their own logs, admins can see all
CREATE POLICY "Users can view own security logs" ON security_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security logs" ON security_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "System can insert security logs" ON security_logs
    FOR INSERT WITH CHECK (true);

-- Policy for rate_limits: System can manage rate limits
CREATE POLICY "System can manage rate limits" ON rate_limits
    FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE security_logs IS 'Audit trail for security events and authentication attempts';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for preventing abuse';
COMMENT ON COLUMN security_logs.event IS 'Type of security event (e.g., login_success, login_failed, signup_success)';
COMMENT ON COLUMN security_logs.details IS 'Additional event data stored as JSON';
COMMENT ON COLUMN security_logs.ip_address IS 'Client IP address';
COMMENT ON COLUMN security_logs.user_agent IS 'Client user agent string';
COMMENT ON COLUMN rate_limits.key IS 'Rate limit key (typically IP:email combination)';
COMMENT ON COLUMN rate_limits.count IS 'Number of requests in current window';
COMMENT ON COLUMN rate_limits.reset_time IS 'When the rate limit window resets';

-- Grant permissions
GRANT ALL ON security_logs TO authenticated;
GRANT ALL ON rate_limits TO authenticated;
GRANT SELECT ON security_events_summary TO authenticated;
GRANT SELECT ON failed_login_attempts TO authenticated;
GRANT SELECT ON suspicious_activity TO authenticated;