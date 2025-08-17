'use client';

import { useState } from 'react';

export default function TestPage() {
  const [email, setEmail] = useState('leadond@gmail.com');
  const [password, setPassword] = useState('password123');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    setMessage('Signing in...');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Successfully signed in as ${data.user.email}`);
        // Redirect to dashboard or handle successful login
      } else {
        setMessage(`Sign in failed: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Sign In</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px' }}
        />
        <button 
          onClick={handleSignIn} 
          disabled={isLoading}
          style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
      {message && <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>{message}</p>}
    </div>
  );
}