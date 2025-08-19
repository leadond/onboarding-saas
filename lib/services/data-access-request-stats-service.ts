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

'use client';

// Get data access request statistics
export async function getDataAccessRequestStatistics() {
  try {
    const response = await fetch('/api/v1/data-access-requests/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data access request statistics:', error);
    throw error;
  }
}

// Get data access request summary
export async function getDataAccessRequestSummary() {
  try {
    const response = await fetch('/api/v1/data-access-requests/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching data access request summary:', error);
    throw error;
  }
}