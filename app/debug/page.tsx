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

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const supabase = createClient()
    
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
      console.log('Session:', session)
      console.log('Error:', error)
    }
    
    getSession()
  }, [])

  const testGoogleAuth = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('OAuth error:', error)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testGoogleAuth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Google Auth
        </button>
        
        <div>
          <h2 className="font-semibold">Status:</h2>
          <p>{session?.user ? '✅ Authenticated' : '❌ Not authenticated'}</p>
        </div>
        
        <div>
          <h2 className="font-semibold">Session:</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}