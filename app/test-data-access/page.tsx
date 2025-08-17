'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [message, setMessage] = useState('Loading...');
  
  useEffect(() => {
    // Simple test to verify the page loads
    setMessage('Data Access Requests Page is Working!');
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Page</h1>
      <p>{message}</p>
    </div>
  );
}