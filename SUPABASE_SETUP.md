# Onboard Hero Supabase Database Setup Guide

This guide will walk you through setting up the complete Supabase database configuration for Onboard Hero, including schema creation, Row Level Security policies, storage buckets, and all necessary configurations for a production-ready multi-tenant SaaS application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Schema Setup](#database-schema-setup)
4. [Authentication Configuration](#authentication-configuration)
5. [Storage Configuration](#storage-configuration)
6. [Environment Configuration](#environment-configuration)
7. [Local Development](#local-development)
8. [Production Deployment](#production-deployment)
9. [Testing and Verification](#testing-and-verification)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18.0 or later
- npm or yarn package manager
- A Supabase account (free tier is sufficient for development)
- Basic knowledge of PostgreSQL and SQL

## Project Setup

### 1. Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `Onboard Hero`
   - **Database Password**: Generate a secure password (save this!)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

Once your project is created, navigate to **Settings > API** and note down:

- **Project URL** (e.g., `https://your-project-ref.supabase.co`)
- **anon/public key** (for client-side usage)
- **service_role/secret key** (for server-side/admin usage)

## Database Schema Setup

### 1. Run Database Migrations

The database schema is organized into sequential migration files. Execute them in order:

#### Migration 1: Core Schema

```sql
-- Run: supabase/migrations/20240101000001_create_initial_schema.sql
```

This creates:

- ✅ **7 core tables**: [`users`](supabase/migrations/20240101000001_create_initial_schema.sql:23-36), [`kits`](supabase/migrations/20240101000001_create_initial_schema.sql:38-58), [`kit_steps`](supabase/migrations/20240101000001_create_initial_schema.sql:61-76), [`client_progress`](supabase/migrations/20240101000001_create_initial_schema.sql:79-97), [`subscriptions`](supabase/migrations/20240101000001_create_initial_schema.sql:100-117), [`usage_tracking`](supabase/migrations/20240101000001_create_initial_schema.sql:119-130), [`audit_logs`](supabase/migrations/20240101000001_create_initial_schema.sql:133-145)
- ✅ **Custom types**: `subscription_status`, `step_type`, `kit_status`, `audit_action`
- ✅ **Trigger functions**: [`update_updated_at_column()`](supabase/migrations/20240101000001_create_initial_schema.sql:196-201)
- ✅ **Utility functions**: [`generate_unique_slug()`](supabase/migrations/20240101000001_create_initial_schema.sql:227-244)

#### Migration 2: Row Level Security

```sql
-- Run: supabase/migrations/20240101000002_create_rls_policies.sql
```

This implements:

- ✅ **Multi-tenant RLS policies** for complete data isolation
- ✅ **Authentication-based access control**
- ✅ **Public access policies** for client onboarding flows
- ✅ **Helper functions** for subscription validation

#### Migration 3: Functions & Triggers

```sql
-- Run: supabase/migrations/20240101000003_create_functions_triggers.sql
```

This adds:

- ✅ **Audit logging system** with automatic trigger-based logging
- ✅ **Usage tracking functions** for subscription limits enforcement
- ✅ **Analytics functions** for conversion metrics and reporting
- ✅ **Automated triggers** for resource usage monitoring

#### Migration 4: Performance Indexes

```sql
-- Run: supabase/migrations/20240101000004_create_indexes.sql
```

This creates:

- ✅ **126 performance indexes** optimized for SaaS query patterns
- ✅ **Composite indexes** for complex dashboard queries
- ✅ **Partial indexes** for frequently filtered data
- ✅ **JSON indexes** for flexible content storage
- ✅ **Full-text search indexes** for kit and step search

#### Migration 5: Storage Buckets

```sql
-- Run: supabase/migrations/20240101000005_create_storage_buckets.sql
```

This sets up:

- ✅ **4 storage buckets**: `kit-logos`, `kit-files`, `user-avatars`, `kit-assets`
- ✅ **Bucket-specific policies** with proper access control
- ✅ **File validation functions** with security checks
- ✅ **Size limits and MIME type restrictions**

### 2. Execute Migrations via Supabase Dashboard

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste each migration file content
3. Click "Run" for each migration
4. Verify each migration completed successfully

### 3. Load Sample Data (Development Only)

```sql
-- Run: supabase/seed.sql
SELECT create_sample_data();
```

This creates sample data for development and testing.

## Authentication Configuration

### 1. Configure Authentication Settings

In your Supabase dashboard, go to **Authentication > Settings**:

#### General Settings

- ✅ **Site URL**: `http://localhost:3000` (development) or your production URL
- ✅ **JWT Expiry**: `3600` seconds (1 hour)
- ✅ **Enable email confirmations**: `false` for development, `true` for production
- ✅ **Enable signup**: `true`

#### Email Templates (Optional)

Configure custom email templates in **Authentication > Templates**:

- Welcome email
- Password reset
- Email confirmation

#### OAuth Providers (Optional)

Enable OAuth providers in **Authentication > Providers**:

- Google OAuth
- GitHub OAuth

### 2. Set Redirect URLs

Add these URLs to **Authentication > URL Configuration**:

**Development:**

```
http://localhost:3000
http://localhost:3000/auth/callback
http://127.0.0.1:3000
```

**Production:**

```
https://yourdomain.com
https://yourdomain.com/auth/callback
```

## Storage Configuration

### 1. Verify Storage Buckets

Go to **Storage** in your Supabase dashboard and verify these buckets exist:

- **kit-logos** (public) - 5MB limit
- **kit-files** (private) - 50MB limit
- **user-avatars** (public) - 2MB limit
- **kit-assets** (public) - 10MB limit

### 2. Configure Bucket Policies

The migration scripts automatically set up RLS policies, but verify in **Storage > Policies**:

- ✅ Users can manage their own avatars
- ✅ Kit owners can manage their kit assets
- ✅ Clients can upload files to published kits
- ✅ Public read access where appropriate

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_PROJECT_REF=your-project-ref

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Additional service configurations...
```

## Local Development

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts
```

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
```

### 4. Verify Database Connection

Visit `http://localhost:3000` and check:

- ✅ Authentication works
- ✅ Database queries execute
- ✅ File uploads function
- ✅ No console errors

## Production Deployment

### 1. Set Production Environment Variables

In your deployment platform (Vercel, Netlify, etc.), set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# ... other production variables
```

### 2. Update Supabase Settings

1. **Authentication > Settings**:
   - Update Site URL to your production domain
   - Add production redirect URLs

2. **API > Settings**:
   - Configure CORS origins for your domain

### 3. Database Optimization

For production, consider:

- ✅ Connection pooling (included in Supabase Pro)
- ✅ Read replicas for high traffic
- ✅ Database backups (automatic in Supabase)

## Testing and Verification

### 1. Database Schema Validation

Run these queries to verify your setup:

```sql
-- Verify all tables exist
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 2. Authentication Testing

1. ✅ Test user registration
2. ✅ Test user login
3. ✅ Test password reset
4. ✅ Test OAuth providers (if configured)

### 3. Storage Testing

1. ✅ Test file uploads to each bucket
2. ✅ Test file access permissions
3. ✅ Test file size limits
4. ✅ Test MIME type restrictions

### 4. API Testing

Test key endpoints:

- `/api/kits` - Kit CRUD operations
- `/api/auth/callback` - Authentication callback
- `/api/webhooks/stripe` - Webhook handling

## Troubleshooting

### Common Issues

#### Migration Errors

**Issue**: "Function already exists"

```sql
-- Solution: Drop function first
DROP FUNCTION IF EXISTS function_name CASCADE;
```

**Issue**: "Permission denied for schema public"

```sql
-- Solution: Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
```

#### RLS Policy Issues

**Issue**: "Row level security policy violation"

- Verify user authentication
- Check policy conditions match your use case
- Test with service role key for debugging

#### Storage Issues

**Issue**: "Access denied" for file uploads

- Verify bucket policies
- Check authentication state
- Confirm file type/size limits

### Debug Queries

```sql
-- Check active RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- View current user context
SELECT auth.uid(), auth.role();

-- Monitor query performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC;
```

### Getting Help

1. **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
2. **Community Discord**: [discord.supabase.com](https://discord.supabase.com)
3. **GitHub Issues**: Create an issue in your repository

---

## Summary

You now have a complete Supabase setup for Onboard Hero with:

✅ **7 core database tables** with proper relationships and constraints
✅ **Comprehensive RLS policies** for multi-tenant security
✅ **Automated functions and triggers** for usage tracking and auditing
✅ **126 performance indexes** optimized for SaaS workloads
✅ **4 storage buckets** with security policies
✅ **Authentication configuration** with social login support
✅ **TypeScript types** for full type safety

Your Onboard Hero application is now ready for development and can scale to handle thousands of users with proper multi-tenant data isolation and security.

For ongoing maintenance, monitor your database performance via the Supabase dashboard and adjust indexes as needed based on query patterns.
