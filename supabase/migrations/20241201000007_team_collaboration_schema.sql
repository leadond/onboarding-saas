-- Team Collaboration & Role-Based Access Schema
-- Enables multi-tenant architecture with organizations, teams, roles, and permissions

-- Organizations table (multi-tenant root)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50) CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    
    -- Subscription and billing
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise', 'custom')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'suspended', 'trial')),
    trial_ends_at TIMESTAMPTZ,
    billing_email VARCHAR(255),
    
    -- Settings
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    
    -- Limits based on subscription
    max_users INTEGER DEFAULT 3,
    max_kits INTEGER DEFAULT 10,
    max_storage_gb INTEGER DEFAULT 1,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT organizations_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create indexes for organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subscription_tier ON organizations(subscription_tier);
CREATE INDEX idx_organizations_created_by ON organizations(created_by);

-- Organization members (users belonging to organizations)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role in organization
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'editor', 'viewer')),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    
    -- Invitation details
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    
    -- Permissions override (JSON array of permission strings)
    custom_permissions JSONB DEFAULT '[]',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organization_id, user_id)
);

-- Create indexes for organization_members
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_role ON organization_members(role);
CREATE INDEX idx_organization_members_status ON organization_members(status);

-- Teams within organizations
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0066cc', -- Hex color code
    
    -- Team settings
    settings JSONB DEFAULT '{}',
    
    -- Team lead
    team_lead_id UUID REFERENCES auth.users(id),
    
    -- Audit fields
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organization_id, name),
    CONSTRAINT teams_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT teams_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Create indexes for teams
CREATE INDEX idx_teams_organization_id ON teams(organization_id);
CREATE INDEX idx_teams_team_lead_id ON teams(team_lead_id);
CREATE INDEX idx_teams_created_by ON teams(created_by);

-- Team members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role in team
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    
    -- Audit fields
    added_by UUID NOT NULL REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(team_id, user_id)
);

-- Create indexes for team_members
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);

-- Permissions system
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    
    -- Permission details
    resource VARCHAR(100) NOT NULL, -- e.g., 'kits', 'analytics', 'users'
    action VARCHAR(50) NOT NULL,    -- e.g., 'read', 'write', 'delete', 'admin'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for permissions
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);

-- Role definitions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Role hierarchy level (higher = more permissions)
    level INTEGER NOT NULL DEFAULT 0,
    
    -- Built-in roles cannot be deleted
    is_system_role BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for roles
CREATE INDEX idx_roles_level ON roles(level);
CREATE INDEX idx_roles_is_system_role ON roles(is_system_role);

-- Role permissions mapping
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(role_id, permission_id)
);

-- Create indexes for role_permissions
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Activity logs for audit trails
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Actor (who performed the action)
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- Store email in case user is deleted
    user_name VARCHAR(255),
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- e.g., 'kit.created', 'user.invited', 'team.updated'
    resource_type VARCHAR(50) NOT NULL, -- e.g., 'kit', 'user', 'team', 'organization'
    resource_id UUID, -- ID of the affected resource
    resource_name VARCHAR(255), -- Name/title of the affected resource
    
    -- Additional context
    details JSONB DEFAULT '{}', -- Additional action details
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    tags TEXT[] DEFAULT '{}', -- Searchable tags
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for activity_logs
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX idx_activity_logs_resource_id ON activity_logs(resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_severity ON activity_logs(severity);
CREATE INDEX idx_activity_logs_tags ON activity_logs USING GIN(tags);

-- Kit team assignments (which teams can access which kits)
CREATE TABLE kit_team_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Access level
    access_level VARCHAR(50) NOT NULL DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
    
    -- Audit fields
    granted_by UUID NOT NULL REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(kit_id, team_id)
);

-- Create indexes for kit_team_access
CREATE INDEX idx_kit_team_access_kit_id ON kit_team_access(kit_id);
CREATE INDEX idx_kit_team_access_team_id ON kit_team_access(team_id);
CREATE INDEX idx_kit_team_access_access_level ON kit_team_access(access_level);

-- Collaborative editing sessions
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session details
    session_type VARCHAR(50) NOT NULL DEFAULT 'edit' CHECK (session_type IN ('edit', 'view', 'comment')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Real-time collaboration data
    cursor_position JSONB,
    selection_range JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(kit_id, user_id, session_type)
);

-- Create indexes for collaboration_sessions
CREATE INDEX idx_collaboration_sessions_kit_id ON collaboration_sessions(kit_id);
CREATE INDEX idx_collaboration_sessions_user_id ON collaboration_sessions(user_id);
CREATE INDEX idx_collaboration_sessions_is_active ON collaboration_sessions(is_active);
CREATE INDEX idx_collaboration_sessions_last_activity ON collaboration_sessions(last_activity_at DESC);

-- Insert default permissions
INSERT INTO permissions (name, description, category, resource, action) VALUES
-- Kit permissions
('kits:read', 'View kits and their content', 'kits', 'kits', 'read'),
('kits:write', 'Create and edit kits', 'kits', 'kits', 'write'),
('kits:delete', 'Delete kits', 'kits', 'kits', 'delete'),
('kits:admin', 'Full kit administration', 'kits', 'kits', 'admin'),

-- Analytics permissions
('analytics:read', 'View analytics and reports', 'analytics', 'analytics', 'read'),
('analytics:export', 'Export analytics data', 'analytics', 'analytics', 'export'),
('analytics:admin', 'Manage analytics settings', 'analytics', 'analytics', 'admin'),

-- User management permissions
('users:read', 'View organization users', 'users', 'users', 'read'),
('users:invite', 'Invite new users', 'users', 'users', 'invite'),
('users:manage', 'Manage user roles and permissions', 'users', 'users', 'manage'),
('users:admin', 'Full user administration', 'users', 'users', 'admin'),

-- Team permissions
('teams:read', 'View teams', 'teams', 'teams', 'read'),
('teams:write', 'Create and edit teams', 'teams', 'teams', 'write'),
('teams:manage', 'Manage team members', 'teams', 'teams', 'manage'),
('teams:admin', 'Full team administration', 'teams', 'teams', 'admin'),

-- Organization permissions
('organization:read', 'View organization details', 'organization', 'organization', 'read'),
('organization:write', 'Edit organization settings', 'organization', 'organization', 'write'),
('organization:billing', 'Manage billing and subscription', 'organization', 'organization', 'billing'),
('organization:admin', 'Full organization administration', 'organization', 'organization', 'admin'),

-- Integration permissions
('integrations:read', 'View integrations', 'integrations', 'integrations', 'read'),
('integrations:write', 'Manage integrations', 'integrations', 'integrations', 'write'),
('integrations:admin', 'Full integration administration', 'integrations', 'integrations', 'admin'),

-- API permissions
('api:read', 'Read-only API access', 'api', 'api', 'read'),
('api:write', 'Read-write API access', 'api', 'api', 'write'),
('api:admin', 'Full API administration', 'api', 'api', 'admin');

-- Insert default roles
INSERT INTO roles (name, description, level, is_system_role) VALUES
('viewer', 'Can view content but cannot make changes', 10, TRUE),
('editor', 'Can create and edit content', 20, TRUE),
('manager', 'Can manage teams and users', 30, TRUE),
('admin', 'Can manage organization settings', 40, TRUE),
('owner', 'Full access to everything', 50, TRUE);

-- Assign permissions to roles
WITH role_permission_mapping AS (
    SELECT 
        r.id as role_id,
        p.id as permission_id
    FROM roles r
    CROSS JOIN permissions p
    WHERE 
        -- Viewer permissions
        (r.name = 'viewer' AND p.action IN ('read')) OR
        
        -- Editor permissions (viewer + write)
        (r.name = 'editor' AND p.action IN ('read', 'write') AND p.resource IN ('kits', 'analytics')) OR
        
        -- Manager permissions (editor + team/user management)
        (r.name = 'manager' AND (
            p.action IN ('read', 'write', 'export') OR
            (p.resource IN ('teams', 'users') AND p.action IN ('read', 'write', 'invite', 'manage'))
        )) OR
        
        -- Admin permissions (manager + organization management)
        (r.name = 'admin' AND p.action != 'admin') OR
        
        -- Owner permissions (everything)
        (r.name = 'owner')
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT role_id, permission_id FROM role_permission_mapping;

-- Update kits table to include organization_id
ALTER TABLE kits ADD COLUMN organization_id UUID REFERENCES organizations(id);
CREATE INDEX idx_kits_organization_id ON kits(organization_id);

-- Update existing kits to belong to user's personal organization (will be handled in application logic)

-- Row Level Security (RLS) policies

-- Organizations RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Organization members RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their organizations" ON organization_members
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins can manage organization members" ON organization_members
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Teams RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view teams in their organizations" ON teams
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Managers can manage teams" ON teams
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager') AND status = 'active'
        )
    );

-- Team members RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members" ON team_members
    FOR SELECT USING (
        team_id IN (
            SELECT t.id 
            FROM teams t
            JOIN organization_members om ON t.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

-- Activity logs RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity logs for their organizations" ON activity_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Kit team access RLS
ALTER TABLE kit_team_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view kit team access for their teams" ON kit_team_access
    FOR SELECT USING (
        team_id IN (
            SELECT tm.team_id 
            FROM team_members tm
            WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        )
    );

-- Collaboration sessions RLS
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaboration sessions for accessible kits" ON collaboration_sessions
    FOR SELECT USING (
        kit_id IN (
            SELECT k.id 
            FROM kits k
            JOIN organization_members om ON k.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

-- Functions for common operations

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(user_uuid UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name VARCHAR(255),
    role VARCHAR(50),
    status VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.name,
        om.role,
        om.status
    FROM organizations o
    JOIN organization_members om ON o.id = om.organization_id
    WHERE om.user_id = user_uuid AND om.status = 'active'
    ORDER BY om.role DESC, o.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check user permissions
CREATE OR REPLACE FUNCTION user_has_permission(
    user_uuid UUID,
    org_id UUID,
    permission_name VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    -- Check if user has the permission through their role
    SELECT EXISTS (
        SELECT 1
        FROM organization_members om
        JOIN roles r ON r.name = om.role
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE om.user_id = user_uuid 
        AND om.organization_id = org_id 
        AND om.status = 'active'
        AND p.name = permission_name
    ) INTO has_permission;
    
    -- If not found through role, check custom permissions
    IF NOT has_permission THEN
        SELECT EXISTS (
            SELECT 1
            FROM organization_members om
            WHERE om.user_id = user_uuid 
            AND om.organization_id = org_id 
            AND om.status = 'active'
            AND om.custom_permissions ? permission_name
        ) INTO has_permission;
    END IF;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    org_id UUID,
    user_uuid UUID,
    action_name VARCHAR(100),
    resource_type_name VARCHAR(50),
    resource_id_param UUID DEFAULT NULL,
    resource_name_param VARCHAR(255) DEFAULT NULL,
    details_param JSONB DEFAULT '{}',
    severity_param VARCHAR(20) DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    user_email_val VARCHAR(255);
    user_name_val VARCHAR(255);
BEGIN
    -- Get user details
    SELECT email, COALESCE(raw_user_meta_data->>'full_name', email)
    INTO user_email_val, user_name_val
    FROM auth.users
    WHERE id = user_uuid;
    
    -- Insert activity log
    INSERT INTO activity_logs (
        organization_id,
        user_id,
        user_email,
        user_name,
        action,
        resource_type,
        resource_id,
        resource_name,
        details,
        severity
    ) VALUES (
        org_id,
        user_uuid,
        user_email_val,
        user_name_val,
        action_name,
        resource_type_name,
        resource_id_param,
        resource_name_param,
        details_param,
        severity_param
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic activity logging

-- Organization updates
CREATE OR REPLACE FUNCTION trigger_log_organization_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(
            NEW.id,
            NEW.created_by,
            'organization.created',
            'organization',
            NEW.id,
            NEW.name,
            jsonb_build_object('subscription_tier', NEW.subscription_tier)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_activity(
            NEW.id,
            auth.uid(),
            'organization.updated',
            'organization',
            NEW.id,
            NEW.name,
            jsonb_build_object(
                'changed_fields', (
                    SELECT jsonb_object_agg(key, value)
                    FROM jsonb_each(to_jsonb(NEW))
                    WHERE to_jsonb(NEW) -> key != to_jsonb(OLD) -> key
                )
            )
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER organization_activity_trigger
    AFTER INSERT OR UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION trigger_log_organization_activity();

-- Team activity logging
CREATE OR REPLACE FUNCTION trigger_log_team_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(
            NEW.organization_id,
            NEW.created_by,
            'team.created',
            'team',
            NEW.id,
            NEW.name
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_activity(
            NEW.organization_id,
            auth.uid(),
            'team.updated',
            'team',
            NEW.id,
            NEW.name
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(
            OLD.organization_id,
            auth.uid(),
            'team.deleted',
            'team',
            OLD.id,
            OLD.name
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER team_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON teams
    FOR EACH ROW EXECUTE FUNCTION trigger_log_team_activity();