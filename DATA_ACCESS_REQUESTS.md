# Data Access Requests System

This document describes the implementation of the Data Access Requests system for the Onboard Hero platform. This system allows users to request access to specific data within the application, with approval workflows for administrators.

## Features Implemented

### 1. Backend Database Structure
- Created `data_access_requests` table with the following fields:
  - `id`: UUID primary key
  - `user_id`: Reference to the requesting user
  - `table_name`: The database table being requested
  - `record_id`: Optional specific record ID
  - `access_type`: Type of access requested (read, update, delete, export)
  - `reason`: Justification for the request
  - `status`: Current status (pending, approved, rejected, completed)
  - `approved_by`: Admin who approved the request
  - `approved_at`: Timestamp of approval
  - `rejected_by`: Admin who rejected the request
  - `rejected_at`: Timestamp of rejection
  - `rejection_reason`: Reason for rejection
  - `created_at`: Timestamp of creation
  - `updated_at`: Timestamp of last update

### 2. API Endpoints
- `GET /api/v1/data-access-requests`: Fetch all requests for the current user
- `POST /api/v1/data-access-requests`: Create a new data access request
- `GET /api/v1/data-access-requests/stats`: Get statistics about requests

### 3. Frontend Components

#### Admin Components
- `DataAccessRequestTable`: Table view of data access requests with approval/rejection actions
- `EnhancedDataAccessRequestTable`: Enhanced table with additional features
- `DataAccessRequestForm`: Form for creating new requests
- `DataAccessRequestSearch`: Advanced search and filtering component
- `DataAccessRequestStats`: Data visualization dashboard with charts and metrics

#### User Components
- `DataAccessRequestTable`: Table view of user's own requests
- `DataAccessRequestForm`: Form for creating new requests
- `DataAccessRequestSearch`: Search component for user's requests

### 4. Services
- `data-access-request-service.ts`: Service for interacting with data access requests
- `data-access-request-stats-service.ts`: Service for fetching statistics

### 5. Pages
- Admin dashboard: `/dashboard/admin/data-access-requests`
- User dashboard: `/dashboard/data-access-requests`

## Implementation Details

### Database Migration
The system includes a migration file that creates the necessary database table and indexes:

-- Enable required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Strong typing for status and access type
DO $ BEGIN
  CREATE TYPE public.data_access_request_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $;

DO $ BEGIN
  CREATE TYPE public.data_access_type AS ENUM ('read', 'update', 'delete', 'export');
EXCEPTION WHEN duplicate_object THEN NULL;
END $;

-- Add data access requests table
CREATE TABLE IF NOT EXISTS public.data_access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID,
  access_type public.data_access_type NOT NULL,
  reason TEXT,
  status public.data_access_request_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Enforce coherent status/approval/rejection fields
  CONSTRAINT dar_pending_clean CHECK (
    status <> 'pending' OR (
      approved_by IS NULL AND approved_at IS NULL AND
      rejected_by IS NULL AND rejected_at IS NULL AND
      rejection_reason IS NULL
    )
  ),
  CONSTRAINT dar_approved_fields CHECK (
    status <> 'approved' OR (
      approved_by IS NOT NULL AND approved_at IS NOT NULL AND
      rejected_by IS NULL AND rejected_at IS NULL AND
      rejection_reason IS NULL
    )
  ),
  CONSTRAINT dar_rejected_fields CHECK (
    status <> 'rejected' OR (
      rejected_by IS NOT NULL AND rejected_at IS NOT NULL
    )
  )
);

-- Keep this table fast to query
CREATE INDEX IF NOT EXISTS idx_dar_user_id_created_at ON public.data_access_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dar_status_created_at ON public.data_access_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dar_table_record ON public.data_access_requests (table_name, record_id);

-- Prevent duplicate concurrent pending requests for the same target by the same user
CREATE UNIQUE INDEX IF NOT EXISTS uniq_dar_pending
  ON public.data_access_requests (user_id, table_name, record_id, access_type)
  WHERE status = 'pending';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END $;

DROP TRIGGER IF EXISTS trg_dar_set_updated_at ON public.data_access_requests;
CREATE TRIGGER trg_dar_set_updated_at
BEFORE UPDATE ON public.data_access_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS (policies defined below)
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;

### Security Features
- Row Level Security (RLS) policies to ensure users can only see their own requests
- Admins can view and manage all requests
- All requests require authentication
- Approval workflow with audit trail

### UI/UX Features
- Tabbed interface for different views (requests, analytics, create, search)
- Advanced filtering and search capabilities
- Data visualization with charts and graphs
- Responsive design for all device sizes
- Loading states and error handling
- Toast notifications for user feedback

## Future Enhancements
- Integration with email notifications for request status changes
- Automated approval rules based on request type and user role
- Export functionality for audit reports
- Integration with third-party compliance tools
- Advanced analytics with trend analysis
- Customizable approval workflows

## Usage

### For Users
1. Navigate to `/dashboard/data-access-requests`
2. Click "New Request" tab
3. Fill out the form with the table, access type, and reason
4. Submit the request
5. View request status in the "My Requests" tab

### For Admins
1. Navigate to `/dashboard/admin/data-access-requests`
2. View pending requests in the "Requests" tab
3. Approve or reject requests with optional rejection reasons
4. View analytics in the "Analytics" tab
5. Search and filter requests using advanced search

## Technical Notes
- All components are built with TypeScript and React
- Uses Supabase for database operations
- Implements proper error handling and loading states
- Follows accessibility best practices
- Mobile-responsive design
- Uses Recharts for data visualization
- Implements proper type safety with TypeScript interfaces

## Files Created
- `components/admin/data-access-request-table.tsx`
- `components/admin/enhanced-data-access-request-table.tsx`
- `components/admin/data-access-request-form.tsx`
- `components/admin/data-access-request-search.tsx`
- `components/admin/data-access-request-stats.tsx`
- `lib/services/data-access-request-service.ts`
- `lib/services/data-access-request-stats-service.ts`
- `lib/types/data-access-request.ts`
- `app/api/v1/data-access-requests/route.ts`
- `app/api/v1/data-access-requests/stats/route.ts`
- `app/(protected)/dashboard/admin/data-access-requests/page.tsx`
- `app/(protected)/dashboard/data-access-requests/page.tsx`
- `supabase/migrations/20250101000002_add_data_access_requests.sql`