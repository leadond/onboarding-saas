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