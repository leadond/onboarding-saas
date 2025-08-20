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

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'
import { useUser } from '@/lib/auth/hooks'

type Company = Database['public']['Tables']['companies']['Row']
type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type CompanyUpdate = Database['public']['Tables']['companies']['Update']

type Representative = Database['public']['Tables']['company_representatives']['Row']
type RepresentativeInsert = Database['public']['Tables']['company_representatives']['Insert']
type RepresentativeUpdate = Database['public']['Tables']['company_representatives']['Update']

export function useCompanies() {
  const { user } = useUser()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch companies for the current user
  useEffect(() => {
    if (!user) return

    const fetchCompanies = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setCompanies(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch companies')
        console.error('Error fetching companies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [user, supabase])

  // Create a new company
  const createCompany = async (companyData: CompanyInsert) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Add the new company to the state
      setCompanies(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating company:', err)
      throw err
    }
  }

  // Update a company
  const updateCompany = async (companyId: string, companyData: CompanyUpdate) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .update({
          ...companyData,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)
        .eq('created_by', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Update the company in the state
      setCompanies(prev => 
        prev.map(company => 
          company.id === companyId ? data : company
        )
      )
      return data
    } catch (err) {
      console.error('Error updating company:', err)
      throw err
    }
  }

  // Delete a company
  const deleteCompany = async (companyId: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)
        .eq('created_by', user.id)

      if (error) {
        throw new Error(error.message)
      }

      // Remove the company from the state
      setCompanies(prev => prev.filter(company => company.id !== companyId))
    } catch (err) {
      console.error('Error deleting company:', err)
      throw err
    }
  }

  return {
    companies,
    loading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
  }
}

export function useCompanyRepresentatives(companyId: string) {
  const { user } = useUser()
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch representatives for a company
  useEffect(() => {
    if (!user || !companyId) return

    const fetchRepresentatives = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('company_representatives')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setRepresentatives(data || [])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch representatives')
        console.error('Error fetching representatives:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRepresentatives()
  }, [user, companyId, supabase])

  // Create a new representative
  const createRepresentative = async (representativeData: RepresentativeInsert) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('company_representatives')
        .insert({
          ...representativeData,
          company_id: companyId,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Add the new representative to the state
      setRepresentatives(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error creating representative:', err)
      throw err
    }
  }

  // Update a representative
  const updateRepresentative = async (representativeId: string, representativeData: RepresentativeUpdate) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { data, error } = await supabase
        .from('company_representatives')
        .update({
          ...representativeData,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', representativeId)
        .eq('company_id', companyId)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      // Update the representative in the state
      setRepresentatives(prev => 
        prev.map(representative => 
          representative.id === representativeId ? data : representative
        )
      )
      return data
    } catch (err) {
      console.error('Error updating representative:', err)
      throw err
    }
  }

  // Delete a representative
  const deleteRepresentative = async (representativeId: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const { error } = await supabase
        .from('company_representatives')
        .delete()
        .eq('id', representativeId)
        .eq('company_id', companyId)

      if (error) {
        throw new Error(error.message)
      }

      // Remove the representative from the state
      setRepresentatives(prev => prev.filter(representative => representative.id !== representativeId))
    } catch (err) {
      console.error('Error deleting representative:', err)
      throw err
    }
  }

  return {
    representatives,
    loading,
    error,
    createRepresentative,
    updateRepresentative,
    deleteRepresentative,
  }
}