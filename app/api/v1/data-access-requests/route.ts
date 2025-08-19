/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all data access requests for the user
    const { data, error } = await supabase
      .from('data_access_requests')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching data access requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data access requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['table_name', 'record_id', 'access_type', 'reason'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create a new data access request
    const { data, error } = await supabase
      .from('data_access_requests')
      .insert({
        user_id: session.user.id,
        table_name: body.table_name,
        record_id: body.record_id,
        access_type: body.access_type,
        reason: body.reason,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating data access request:', error);
    return NextResponse.json(
      { error: 'Failed to create data access request' },
      { status: 500 }
    );
  }
}