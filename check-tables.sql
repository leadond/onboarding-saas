-- Check what tables exist in your database
-- Copy and paste this into Supabase SQL Editor to see your actual tables

SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;