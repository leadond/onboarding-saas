-- RLS FIX: Enable RLS only on tables that exist
-- Run this first to see what tables you have, then run the appropriate sections

-- STEP 1: Check what tables exist
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- STEP 2: Enable RLS on common tables (run only the ones that exist)

-- If you have a 'clients' table:
-- ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their clients" ON public.clients FOR ALL USING (owner_id = auth.uid());

-- If you have 'users' table:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view users" ON public.users FOR ALL USING (auth.uid() IS NOT NULL);

-- If you have 'organizations' table:
-- ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view organizations" ON public.organizations FOR ALL USING (auth.uid() IS NOT NULL);

-- If you have 'profiles' table:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their profile" ON public.profiles FOR ALL USING (id = auth.uid());

-- If you have 'teams' table:
-- ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view teams" ON public.teams FOR ALL USING (auth.uid() IS NOT NULL);

-- If you have 'kits' table:
-- ALTER TABLE public.kits ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view kits" ON public.kits FOR ALL USING (auth.uid() IS NOT NULL);

-- If you have 'subscriptions' table:
-- ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() IS NOT NULL);

-- If you have 'notifications' table:
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view notifications" ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);

-- If you have 'activity_logs' table:
-- ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view activity logs" ON public.activity_logs FOR ALL USING (auth.uid() IS NOT NULL);