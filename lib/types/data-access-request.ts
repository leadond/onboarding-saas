/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

export type DataAccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface DataAccessRequest {
  id: string;
  user_id: string;
  table_name: string;
  record_id: string | null;
  access_type: string;
  reason: string | null;
  status: DataAccessRequestStatus;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataAccessRequestInsert {
  table_name: string;
  record_id?: string | null;
  access_type: string;
  reason?: string | null;
}

export interface DataAccessRequestUpdate {
  status: DataAccessRequestStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
}

export interface DataAccessRequestStatistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  avg_processing_time: string | null;
}

export interface DataAccessRequestSummary {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  avg_processing_time: string | null;
}

export interface DataAccessRequestWithUser {
  id: string;
  request_id: string;
  user_id: string;
  user_email: string;
  table_name: string;
  record_id: string | null;
  access_type: string;
  reason: string | null;
  status: DataAccessRequestStatus;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}