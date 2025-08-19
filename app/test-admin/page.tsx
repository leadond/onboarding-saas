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

'use client';

import { useState, useEffect } from 'react';

export default function TestAdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [tableName, setTableName] = useState('users');
  const [accessType, setAccessType] = useState('read');
  const [reason, setReason] = useState('');
  const [creating, setCreating] = useState(false);

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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/v1/data-access-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_name: tableName,
          access_type: accessType,
          reason: reason,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequests([data, ...requests]);
        setReason('');
        alert('Request created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error creating request: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error creating request');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Admin Portal</h1>
        <p>You are not signed in.</p>
        <a href="/login" style={{ color: '#0070f3' }}>Sign in</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin Portal</h1>
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
        <h2>Create Data Access Request</h2>
        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
          <div>
            <label>Table Name:</label>
            <select 
              value={tableName} 
              onChange={(e) => setTableName(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="users">Users</option>
              <option value="organizations">Organizations</option>
              <option value="kits">Kits</option>
              <option value="kit_steps">Kit Steps</option>
              <option value="client_progress">Client Progress</option>
            </select>
          </div>
          
          <div>
            <label>Access Type:</label>
            <select 
              value={accessType} 
              onChange={(e) => setAccessType(e.target.value)}
              style={{ width: '100%', padding: '10px' }}
            >
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="export">Export</option>
            </select>
          </div>
          
          <div>
            <label>Reason:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for access"
              required
              style={{ width: '100%', padding: '10px', minHeight: '100px' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={creating}
            style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {creating ? 'Creating...' : 'Create Request'}
          </button>
        </form>
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