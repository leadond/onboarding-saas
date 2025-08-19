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

export async function GET(request: Request) {
  try {
    // Mock data for now since we can't access the database table
    const mockStats = {
      total_requests: 42,
      pending_requests: 12,
      approved_requests: 25,
      rejected_requests: 5,
      avg_processing_time: 120 // in minutes
    };
    
    return NextResponse.json(mockStats);
  } catch (error: any) {
    console.error('Error fetching data access request statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data access request statistics' },
      { status: 500 }
    );
  }
}