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

import { getSupabaseClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const supabase = await getSupabaseClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    
    return session?.user || null
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}