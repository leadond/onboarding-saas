'use client';

import { useEffect, useState } from 'react';

export default function TestEnvPage() {
  const [envVars, setEnvVars] = useState<any>(null);

  useEffect(() => {
    // Client-side check
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Environment Variables Test</h1>
      <div>
        <h2>Client-side check:</h2>
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
    </div>
  );
}