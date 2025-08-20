-- RLS Policies Setup - Run AFTER creating tables
-- Run this in Supabase SQL Editor AFTER running update-schema-safe.sql

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Global admin full access to kit templates" ON kit_templates;
DROP POLICY IF EXISTS "Users can view available kit templates" ON kit_templates;
DROP POLICY IF EXISTS "Company users manage their kits" ON company_kits;
DROP POLICY IF EXISTS "Company users manage their kit steps" ON company_kit_steps;
DROP POLICY IF EXISTS "Company users manage their sessions" ON onboarding_sessions;
DROP POLICY IF EXISTS "Users manage step instances" ON step_instances;
DROP POLICY IF EXISTS "Users can view document templates" ON document_templates;
DROP POLICY IF EXISTS "Company users manage their document templates" ON document_templates;
DROP POLICY IF EXISTS "Users can view form templates" ON form_templates;
DROP POLICY IF EXISTS "Users manage form submissions" ON form_submissions;
DROP POLICY IF EXISTS "Users manage document instances" ON document_instances;
DROP POLICY IF EXISTS "Users manage payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Company users manage their integrations" ON company_integrations;
DROP POLICY IF EXISTS "Users manage calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users view AI analysis" ON ai_analysis;

-- Create new policies
CREATE POLICY "Global admin full access to kit templates" ON kit_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

CREATE POLICY "Users can view available kit templates" ON kit_templates
    FOR SELECT USING (
        is_active = true AND (
            created_by IN (
                SELECT id FROM user_profiles 
                WHERE auth_user_id = auth.uid()
            ) OR
            EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE user_profiles.auth_user_id = auth.uid() 
                AND user_profiles.role = 'global_admin'
            )
        )
    );

CREATE POLICY "Company users manage their kits" ON company_kits
    FOR ALL USING (
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Company users manage their kit steps" ON company_kit_steps
    FOR ALL USING (
        kit_id IN (
            SELECT id FROM company_kits 
            WHERE company_name IN (
                SELECT company_name FROM user_profiles 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Company users manage their sessions" ON onboarding_sessions
    FOR ALL USING (
        kit_id IN (
            SELECT id FROM company_kits 
            WHERE company_name IN (
                SELECT company_name FROM user_profiles 
                WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users manage step instances" ON step_instances
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can view document templates" ON document_templates
    FOR SELECT USING (
        is_global = true OR 
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

CREATE POLICY "Company users manage their document templates" ON document_templates
    FOR INSERT WITH CHECK (
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

CREATE POLICY "Users can view form templates" ON form_templates
    FOR SELECT USING (
        is_global = true OR 
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.auth_user_id = auth.uid() 
            AND user_profiles.role = 'global_admin'
        )
    );

CREATE POLICY "Users manage form submissions" ON form_submissions
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users manage document instances" ON document_instances
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users manage payment requests" ON payment_requests
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Company users manage their integrations" ON company_integrations
    FOR ALL USING (
        company_name IN (
            SELECT company_name FROM user_profiles 
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users manage calendar events" ON calendar_events
    FOR ALL USING (
        session_id IN (
            SELECT id FROM onboarding_sessions 
            WHERE kit_id IN (
                SELECT id FROM company_kits 
                WHERE company_name IN (
                    SELECT company_name FROM user_profiles 
                    WHERE auth_user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users view AI analysis" ON ai_analysis
    FOR SELECT USING (
        document_instance_id IN (
            SELECT id FROM document_instances 
            WHERE session_id IN (
                SELECT id FROM onboarding_sessions 
                WHERE kit_id IN (
                    SELECT id FROM company_kits 
                    WHERE company_name IN (
                        SELECT company_name FROM user_profiles 
                        WHERE auth_user_id = auth.uid()
                    )
                )
            )
        )
    );