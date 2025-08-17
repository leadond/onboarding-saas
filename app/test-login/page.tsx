'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const [email, setEmail] = useState('leadond@gmail.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

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
        setMessage('Login successful!');
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setMessage(`Login failed: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Test Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ padding: '10px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          {message}
        </div>
      )}
    </div>
  );
}