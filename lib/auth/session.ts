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

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const supabase = await createClient()
    
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