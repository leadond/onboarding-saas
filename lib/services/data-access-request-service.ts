'use client';

import { createClient } from '@/lib/supabase/client';
import { 
  DataAccessRequest, 
  DataAccessRequestInsert, 
  DataAccessRequestWithUser,
  DataAccessRequestSummary,
  DataAccessRequestStatistics
} from '@/lib/types/data-access-request';

const supabase = createClient();

// Get all data access requests for a user
export async function getDataAccessRequests(userId: string): Promise<DataAccessRequest[]> {
  const { data, error } = await supabase
    .from('data_access_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DataAccessRequest[];
}

// Get data access request statistics
export async function getDataAccessRequestStatistics(): Promise<DataAccessRequestStatistics> {
  const { data, error } = await supabase
    .rpc('get_data_access_request_statistics');

  if (error) throw error;
  return data as DataAccessRequestStatistics;
}

// Get data access request summary
export async function getDataAccessRequestSummary(): Promise<DataAccessRequestSummary> {
  const { data, error } = await supabase
    .rpc('get_data_access_request_summary');

  if (error) throw error;
  return data as DataAccessRequestSummary;
}

// Get pending data access requests for approval (admin function)
export async function getPendingDataAccessRequestsForApproval(): Promise<DataAccessRequestWithUser[]> {
  const { data, error } = await supabase
    .rpc('get_pending_data_access_requests_for_approval');

  if (error) throw error;
  return data as DataAccessRequestWithUser[];
}

// Create a new data access request
export async function createDataAccessRequest(request: DataAccessRequestInsert): Promise<DataAccessRequest> {
  const { data, error } = await supabase
    .from('data_access_requests')
    .insert(request)
    .select()
    .single();

  if (error) throw error;
  return data as DataAccessRequest;
}

// Approve a data access request
export async function approveDataAccessRequest(requestId: string, adminUserId: string): Promise<DataAccessRequest> {
  const { data, error } = await supabase
    .rpc('approve_data_access_request', {
      request_id: requestId,
      admin_id: adminUserId
    })
    .select()
    .single();

  if (error) throw error;
  return data as DataAccessRequest;
}

// Reject a data access request
export async function rejectDataAccessRequest(
  requestId: string, 
  adminUserId: string, 
  reason: string
): Promise<DataAccessRequest> {
  const { data, error } = await supabase
    .rpc('reject_data_access_request', {
      request_id: requestId,
      admin_id: adminUserId,
      rejection_reason: reason
    })
    .select()
    .single();

  if (error) throw error;
  return data as DataAccessRequest;
}

// Get all data access requests for a specific user
export async function getDataAccessRequestsForUser(userId: string): Promise<DataAccessRequest[]> {
  const { data, error } = await supabase
    .from('data_access_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DataAccessRequest[];
}