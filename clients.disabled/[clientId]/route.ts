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

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;

    const supabase = await getSupabaseClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Fetch specific client from the database
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          kit_assignments (
            kit_id,
            progress,
            status,
            kits (
              id,
              name
            )
          )
        `)
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error('Database error:', clientError);
        // Fall back to mock data if database query fails
        return getMockClient(clientId);
      }

      return NextResponse.json({ client });

    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Fall back to mock data if database is not available
      return getMockClient(clientId);
    }

  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getMockClient(clientId: string) {
  const mockClients: Record<string, any> = {
    '1': {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Solutions',
      status: 'active',
      invited_at: '2024-01-15T10:30:00Z',
      activated_at: '2024-01-15T12:00:00Z',
      progress: 75,
      current_step: 'Document Upload',
      kit_id: '1',
      kit_name: 'Enterprise Client Onboarding'
    },
    '2': {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@globaldynamics.com',
      phone: '+1 (555) 234-5678',
      company: 'Global Dynamics',
      status: 'completed',
      invited_at: '2024-01-16T09:00:00Z',
      activated_at: '2024-01-16T11:15:00Z',
      completed_at: '2024-01-18T16:45:00Z',
      progress: 100,
      current_step: 'Completed',
      kit_id: '1',
      kit_name: 'Enterprise Client Onboarding'
    },
    '3': {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@innovatesolutions.com',
      phone: '+1 (555) 345-6789',
      company: 'Innovate Solutions',
      status: 'active',
      invited_at: '2024-01-17T08:30:00Z',
      activated_at: '2024-01-17T10:00:00Z',
      progress: 45,
      current_step: 'Feature Walkthrough',
      kit_id: '2',
      kit_name: 'SaaS Product Onboarding'
    },
    '4': {
      id: '4',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@techstart.com',
      phone: '+1 (555) 456-7890',
      company: 'TechStart Inc',
      status: 'invited',
      invited_at: '2024-01-19T15:20:00Z',
      progress: 0,
      current_step: 'Invitation Sent',
      kit_id: '2',
      kit_name: 'SaaS Product Onboarding'
    },
    '5': {
      id: '5',
      name: 'David Wilson',
      email: 'david.wilson@enterprisecorp.com',
      phone: '+1 (555) 567-8901',
      company: 'Enterprise Corp',
      status: 'active',
      invited_at: '2024-01-18T12:00:00Z',
      activated_at: '2024-01-18T14:30:00Z',
      progress: 20,
      current_step: 'Company Information',
      kit_id: '1',
      kit_name: 'Enterprise Client Onboarding'
    },
    '6': {
      id: '6',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@acmecorp.com',
      phone: '+1 (555) 678-9012',
      company: 'Acme Corporation',
      status: 'active',
      invited_at: '2024-01-19T08:45:00Z',
      activated_at: '2024-01-19T10:15:00Z',
      progress: 60,
      current_step: 'Integration Setup',
      kit_id: '2',
      kit_name: 'SaaS Product Onboarding'
    }
  };

  const client = mockClients[clientId];
  
  if (!client) {
    return NextResponse.json(
      { error: 'Client not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ client });
}