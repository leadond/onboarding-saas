-- QUICK FIX: Enable RLS on all tables
-- Copy and paste this into Supabase SQL Editor

-- Enable RLS on all existing tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY;';
            RAISE NOTICE 'Enabled RLS on table: %', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not enable RLS on table: % - %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- Add basic policies for authenticated users
DO $$
DECLARE
    r RECORD;
    policy_name TEXT;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        BEGIN
            policy_name := 'Allow authenticated users - ' || r.tablename;
            EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (auth.uid() IS NOT NULL);', 
                          policy_name, r.tablename);
            RAISE NOTICE 'Created policy for table: %', r.tablename;
        EXCEPTION WHEN duplicate_object THEN
            RAISE NOTICE 'Policy already exists for table: %', r.tablename;
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not create policy for table: % - %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;