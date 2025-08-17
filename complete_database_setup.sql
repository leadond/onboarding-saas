CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due')),
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_id TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    billing_cycle_start TIMESTAMP WITH TIME ZONE,
    billing_cycle_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    permissions JSONB DEFAULT '[]',
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'completed', 'cancelled')),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kit_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB DEFAULT '{}',
    type TEXT DEFAULT 'content' CHECK (type IN ('content', 'form', 'upload', 'signature', 'payment')),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.client_kit_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    kit_id UUID REFERENCES public.kits(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, kit_id)
);

CREATE TABLE IF NOT EXISTS public.client_step_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.client_kit_assignments(id) ON DELETE CASCADE NOT NULL,
    step_id UUID REFERENCES public.kit_steps(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    data JSONB DEFAULT '{}',
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, step_id)
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'incomplete')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    branding_config JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    ui_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_owner ON public.clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_kit_steps_kit ON public.kit_steps(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_steps_order ON public.kit_steps(order_index);
CREATE INDEX IF NOT EXISTS idx_assignments_client ON public.client_kit_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_assignments_kit ON public.client_kit_assignments(kit_id);
CREATE INDEX IF NOT EXISTS idx_progress_assignment ON public.client_step_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_progress_client ON public.client_step_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_kit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
CREATE POLICY "Users can view their teams" ON public.teams FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can update their teams" ON public.teams;
CREATE POLICY "Users can update their teams" ON public.teams FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete their teams" ON public.teams;
CREATE POLICY "Users can delete their teams" ON public.teams FOR DELETE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Team members can view memberships" ON public.team_members;
CREATE POLICY "Team members can view memberships" ON public.team_members FOR SELECT USING (
    user_id = auth.uid() OR 
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Team owners can manage members" ON public.team_members;
CREATE POLICY "Team owners can manage members" ON public.team_members FOR ALL USING (
    team_id IN (SELECT id FROM public.teams WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their clients" ON public.clients;
CREATE POLICY "Users can view their clients" ON public.clients FOR SELECT USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can create clients" ON public.clients;
CREATE POLICY "Users can create clients" ON public.clients FOR INSERT WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can update their clients" ON public.clients;
CREATE POLICY "Users can update their clients" ON public.clients FOR UPDATE USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Users can delete their clients" ON public.clients;
CREATE POLICY "Users can delete their clients" ON public.clients FOR DELETE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can view kit steps" ON public.kit_steps;
CREATE POLICY "Users can view kit steps" ON public.kit_steps FOR SELECT USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Users can manage kit steps" ON public.kit_steps;
CREATE POLICY "Users can manage kit steps" ON public.kit_steps FOR ALL USING (
    kit_id IN (SELECT id FROM public.kits WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view assignments" ON public.client_kit_assignments;
CREATE POLICY "Users can view assignments" ON public.client_kit_assignments FOR SELECT USING (assigned_by = auth.uid());
DROP POLICY IF EXISTS "Users can manage assignments" ON public.client_kit_assignments;
CREATE POLICY "Users can manage assignments" ON public.client_kit_assignments FOR ALL USING (assigned_by = auth.uid());

DROP POLICY IF EXISTS "Users can view progress" ON public.client_step_progress;
CREATE POLICY "Users can view progress" ON public.client_step_progress FOR SELECT USING (
    assignment_id IN (SELECT id FROM public.client_kit_assignments WHERE assigned_by = auth.uid())
);
DROP POLICY IF EXISTS "Users can manage progress" ON public.client_step_progress;
CREATE POLICY "Users can manage progress" ON public.client_step_progress FOR ALL USING (
    assignment_id IN (SELECT id FROM public.client_kit_assignments WHERE assigned_by = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_logs;
CREATE POLICY "Users can insert own activity" ON public.activity_logs FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (user_id = auth.uid());

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.team_members TO authenticated;
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.kit_steps TO authenticated;
GRANT ALL ON public.client_kit_assignments TO authenticated;
GRANT ALL ON public.client_step_progress TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.activity_logs TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_kit_steps_updated_at ON public.kit_steps;
CREATE TRIGGER update_kit_steps_updated_at
    BEFORE UPDATE ON public.kit_steps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_assignments_updated_at ON public.client_kit_assignments;
CREATE TRIGGER update_assignments_updated_at
    BEFORE UPDATE ON public.client_kit_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_progress_updated_at ON public.client_step_progress;
CREATE TRIGGER update_progress_updated_at
    BEFORE UPDATE ON public.client_step_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();