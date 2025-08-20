-- MANUAL RLS FIX: Run each section separately
-- Copy and paste each section one at a time into Supabase SQL Editor

-- SECTION 1: Enable RLS on core tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_completions ENABLE ROW LEVEL SECURITY;

-- SECTION 2: Enable RLS on additional tables (if they exist)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- SECTION 3: Create basic policies for core tables
CREATE POLICY "Allow authenticated users" ON public.organizations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.users FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.onboarding_kits FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.client_sessions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.step_completions FOR ALL USING (auth.uid() IS NOT NULL);

-- SECTION 4: Create policies for additional tables
CREATE POLICY "Allow authenticated users" ON public.teams FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.team_members FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.workflows FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.workflow_executions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.files FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated users" ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);