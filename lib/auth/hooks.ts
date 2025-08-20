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

'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabaseClient = await getSupabaseClient();
        setSupabase(supabaseClient);
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        setUser(session?.user ?? null);
        
        // Listen for auth state changes
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
          (_event, session) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return { user, isLoading };
}