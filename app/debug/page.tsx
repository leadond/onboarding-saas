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

'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default function DebugPage() {
  // Only allow access in development
  if (process.env.NODE_ENV === 'production') {
    redirect('/dashboard')
  }
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const initializeAuth = async () => {
      const supabase = await getSupabaseClient()
      
      const { data: { session }, error } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
      console.log('Session:', session)
      console.log('Error:', error)
    }
    
    initializeAuth()
  }, [])

  const testEmailAuth = async () => {
    const supabase = await getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword'
    })
    if (error) console.error('Email auth error:', error)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testEmailAuth}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Email Auth
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