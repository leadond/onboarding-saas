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

import { useState, useEffect } from 'react';

export default function TestClientPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleViewRequests = async () => {
    try {
      const response = await fetch('/api/v1/data-access-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Client Portal</h1>
        <p>You are not signed in.</p>
        <a href="/login" style={{ color: '#0070f3' }}>Sign in</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Client Portal</h1>
        <button 
          onClick={handleSignOut}
          style={{ padding: '10px', backgroundColor: '#ff0000', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Sign Out
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h2>Welcome, {user.fullName}</h2>
        <p>Email: {user.email}</p>
        <p>Subscription: {user.subscriptionTier}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Your Data Access Requests</h2>
        <button 
          onClick={handleViewRequests}
          style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          View Requests
        </button>
        
        {requests.length > 0 ? (
          <div style={{ marginTop: '10px' }}>
            {requests.map((request) => (
              <div key={request.id} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '10px' }}>
                <p><strong>Table:</strong> {request.table_name}</p>
                <p><strong>Access Type:</strong> {request.access_type}</p>
                <p><strong>Status:</strong> {request.status}</p>
                <p><strong>Reason:</strong> {request.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: '10px' }}>No requests found.</p>
        )}
      </div>
    </div>
  );
}