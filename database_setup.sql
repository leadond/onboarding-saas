-- Onboard Hero Database Schema Setup
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE kit_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE client_status AS ENUM ('invited', 'active', 'completed', 'cancelled');
CREATE TYPE step_type AS ENUM ('form', 'upload', 'review', 'approval', 'custom');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'unpaid');

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TEAMS TABLE
-- =============================================
CREATE TABLE public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TEAM MEMBERS TABLE
-- =============================================
CREATE TABLE public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- =============================================
-- KITS TABLE (already exists, but ensuring proper structure)
-- =============================================
CREATE TABLE IF NOT EXISTS public.kits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status kit_status DEFAULT 'draft',
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    step_count INTEGER DEFAULT 0,
    estimated_duration INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- KIT STEPS TABLE
-- =============================================
CREATE TABLE public.kit_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    step_type step_type DEFAULT 'custom',
    step_order INTEGER NOT NULL,
    required BOOLEAN DEFAULT true,
    form_config JSONB, -- For form steps
    upload_config JSONB, -- For upload steps
    custom_config JSONB, -- For custom steps
    estimated_duration INTEGER DEFAULT 0, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(kit_id, step_order)
);

-- =============================================
-- CLIENTS TABLE
-- =============================================
CREATE TABLE public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    status client_status DEFAULT 'invited',
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CLIENT KIT ASSIGNMENTS TABLE
-- =============================================
CREATE TABLE public.client_kit_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, kit_id)
);

-- =============================================
-- CLIENT STEP PROGRESS TABLE
-- =============================================
CREATE TABLE public.client_step_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.client_kit_assignments(id) ON DELETE CASCADE NOT NULL,
    step_id UUID REFERENCES public.kit_steps(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    response_data JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, step_id)
);

-- =============================================
-- SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan_name TEXT NOT NULL,
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ACTIVITY LOGS TABLE
-- =============================================
CREATE TABLE public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Teams indexes
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- Kits indexes
CREATE INDEX idx_kits_owner_id ON public.kits(owner_id);
CREATE INDEX idx_kits_team_id ON public.kits(team_id);
CREATE INDEX idx_kits_status ON public.kits(status);

-- Kit steps indexes
CREATE INDEX idx_kit_steps_kit_id ON public.kit_steps(kit_id);
CREATE INDEX idx_kit_steps_order ON public.kit_steps(kit_id, step_order);

-- Clients indexes
CREATE INDEX idx_clients_owner_id ON public.clients(owner_id);
CREATE INDEX idx_clients_team_id ON public.clients(team_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_email ON public.clients(email);

-- Assignments indexes
CREATE INDEX idx_assignments_client_id ON public.client_kit_assignments(client_id);
CREATE INDEX idx_assignments_kit_id ON public.client_kit_assignments(kit_id);
CREATE INDEX idx_assignments_status ON public.client_kit_assignments(status);

-- Progress indexes
CREATE INDEX idx_progress_assignment_id ON public.client_step_progress(assignment_id);
CREATE INDEX idx_progress_step_id ON public.client_step_progress(step_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_kit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams policies
CREATE POLICY "Users can view teams they own or are members of" ON public.teams
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create teams" ON public.teams
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON public.teams
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON public.teams
    FOR DELETE USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team memberships for their teams" ON public.team_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    );

CREATE POLICY "Team owners can manage team members" ON public.team_members
    FOR ALL USING (
        team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
    );

-- Kits policies
CREATE POLICY "Users can view kits they own or team kits" ON public.kits
    FOR SELECT USING (
        owner_id = auth.uid() OR
        team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create kits" ON public.kits
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Kit owners can update their kits" ON public.kits
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Kit owners can delete their kits" ON public.kits
    FOR DELETE USING (owner_id = auth.uid());

-- Kit steps policies
CREATE POLICY "Users can view steps for accessible kits" ON public.kit_steps
    FOR SELECT USING (
        kit_id IN (
            SELECT id FROM public.kits WHERE 
            owner_id = auth.uid() OR
            team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can manage steps for their kits" ON public.kit_steps
    FOR ALL USING (
        kit_id IN (SELECT id FROM public.kits WHERE owner_id = auth.uid())
    );

-- Clients policies
CREATE POLICY "Users can view their clients" ON public.clients
    FOR SELECT USING (
        owner_id = auth.uid() OR
        team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create clients" ON public.clients
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their clients" ON public.clients
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their clients" ON public.clients
    FOR DELETE USING (owner_id = auth.uid());

-- Client kit assignments policies
CREATE POLICY "Users can view assignments for their clients/kits" ON public.client_kit_assignments
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid()) OR
        kit_id IN (SELECT id FROM public.kits WHERE owner_id = auth.uid())
    );

CREATE POLICY "Users can create assignments" ON public.client_kit_assignments
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid()) AND
        kit_id IN (SELECT id FROM public.kits WHERE owner_id = auth.uid())
    );

CREATE POLICY "Users can update their assignments" ON public.client_kit_assignments
    FOR UPDATE USING (
        client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid()) OR
        kit_id IN (SELECT id FROM public.kits WHERE owner_id = auth.uid())
    );

-- Client step progress policies
CREATE POLICY "Users can view progress for their assignments" ON public.client_step_progress
    FOR SELECT USING (
        assignment_id IN (
            SELECT id FROM public.client_kit_assignments WHERE
            client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid()) OR
            kit_id IN (SELECT id FROM public.kits WHERE owner_id = auth.uid())
        )
    );

CREATE POLICY "Users can update progress for their assignments" ON public.client_step_progress
    FOR ALL USING (
        assignment_id IN (
            SELECT id FROM public.client_kit_assignments WHERE
            client_id IN (SELECT id FROM public.clients WHERE owner_id = auth.uid()) OR
            kit_id IN (SELECT id FROM public.kits WHERE owner_id = auth.uid())
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
    FOR UPDATE USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Activity logs policies
CREATE POLICY "Users can view their own activity" ON public.activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update kit step count
CREATE OR REPLACE FUNCTION public.update_kit_step_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.kits SET step_count = (
            SELECT COUNT(*) FROM public.kit_steps WHERE kit_id = OLD.kit_id
        ) WHERE id = OLD.kit_id;
        RETURN OLD;
    ELSE
        UPDATE public.kits SET step_count = (
            SELECT COUNT(*) FROM public.kit_steps WHERE kit_id = NEW.kit_id
        ) WHERE id = NEW.kit_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_teams
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_kits
    BEFORE UPDATE ON public.kits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_kit_steps
    BEFORE UPDATE ON public.kit_steps
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_clients
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_assignments
    BEFORE UPDATE ON public.client_kit_assignments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_progress
    BEFORE UPDATE ON public.client_step_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_subscriptions
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for kit step count updates
CREATE TRIGGER update_kit_step_count_on_insert
    AFTER INSERT ON public.kit_steps
    FOR EACH ROW EXECUTE FUNCTION public.update_kit_step_count();

CREATE TRIGGER update_kit_step_count_on_delete
    AFTER DELETE ON public.kit_steps
    FOR EACH ROW EXECUTE FUNCTION public.update_kit_step_count();

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SAMPLE DATA (Optional - remove if not wanted)
-- =============================================

-- Insert sample data only if you want it for testing
-- You can remove this section if you prefer empty tables

-- Note: This will only work if you have an authenticated user
-- The user ID will need to match an actual auth.users record

-- =============================================
-- VIEWS FOR EASIER QUERYING
-- =============================================

-- View for kit statistics
CREATE OR REPLACE VIEW public.kit_stats AS
SELECT 
    k.id,
    k.name,
    k.status,
    k.step_count,
    COUNT(DISTINCT cka.client_id) as assigned_clients,
    COUNT(DISTINCT CASE WHEN cka.status = 'completed' THEN cka.client_id END) as completed_clients,
    CASE 
        WHEN COUNT(DISTINCT cka.client_id) > 0 
        THEN ROUND(COUNT(DISTINCT CASE WHEN cka.status = 'completed' THEN cka.client_id END) * 100.0 / COUNT(DISTINCT cka.client_id), 2)
        ELSE 0 
    END as completion_rate
FROM public.kits k
LEFT JOIN public.client_kit_assignments cka ON k.id = cka.kit_id
GROUP BY k.id, k.name, k.status, k.step_count;

-- View for client progress
CREATE OR REPLACE VIEW public.client_progress_view AS
SELECT 
    c.id as client_id,
    c.name as client_name,
    c.email,
    c.status as client_status,
    k.id as kit_id,
    k.name as kit_name,
    cka.status as assignment_status,
    cka.started_at,
    cka.completed_at,
    COUNT(ks.id) as total_steps,
    COUNT(CASE WHEN csp.status = 'completed' THEN 1 END) as completed_steps,
    CASE 
        WHEN COUNT(ks.id) > 0 
        THEN ROUND(COUNT(CASE WHEN csp.status = 'completed' THEN 1 END) * 100.0 / COUNT(ks.id), 2)
        ELSE 0 
    END as progress_percentage
FROM public.clients c
JOIN public.client_kit_assignments cka ON c.id = cka.client_id
JOIN public.kits k ON cka.kit_id = k.id
LEFT JOIN public.kit_steps ks ON k.id = ks.kit_id
LEFT JOIN public.client_step_progress csp ON cka.id = csp.assignment_id AND ks.id = csp.step_id
GROUP BY c.id, c.name, c.email, c.status, k.id, k.name, cka.status, cka.started_at, cka.completed_at;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant all privileges on all tables to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant select on tables to anonymous users (for public data if needed)
GRANT SELECT ON public.profiles TO anon;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Create a simple function to verify the setup
CREATE OR REPLACE FUNCTION public.verify_setup()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Onboard Hero database setup completed successfully! All tables, indexes, policies, and triggers have been created.';
END;
$$ LANGUAGE plpgsql;

-- Run verification
SELECT public.verify_setup();