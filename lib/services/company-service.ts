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
import { Database } from '@/types/supabase'

type Company = Database['public']['Tables']['companies']['Row']
type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type CompanyUpdate = Database['public']['Tables']['companies']['Update']

type Representative = Database['public']['Tables']['company_representatives']['Row']
type RepresentativeInsert = Database['public']['Tables']['company_representatives']['Insert']
type RepresentativeUpdate = Database['public']['Tables']['company_representatives']['Update']

export class CompanyService {
  private supabase: any = null

  // Get all companies for a user
  async getCompanies(userId: string, limit: number = 100, offset: number = 0): Promise<Company[]> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('created_by', userId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching companies:', error)
      throw new Error('Failed to fetch companies')
    }
    
    return data || []
  }

  // Get a company by ID
  async getCompanyById(companyId: string, userId: string): Promise<Company | null> {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('created_by', userId)
      .single()
    
    if (error) {
      console.error('Error fetching company:', error)
      throw new Error('Failed to fetch company')
    }
    
    return data || null
  }

  // Create a new company
  async createCompany(companyData: CompanyInsert, userId: string): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .insert({
        ...companyData,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating company:', error)
      throw new Error('Failed to create company')
    }
    
    return data
  }

  // Update a company
  async updateCompany(companyId: string, companyData: CompanyUpdate, userId: string): Promise<Company> {
    const { data, error } = await this.supabase
      .from('companies')
      .update({
        ...companyData,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .eq('created_by', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating company:', error)
      throw new Error('Failed to update company')
    }
    
    return data
  }

  // Delete a company
  async deleteCompany(companyId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
      .eq('created_by', userId)
    
    if (error) {
      console.error('Error deleting company:', error)
      throw new Error('Failed to delete company')
    }
  }

  // Get representatives for a company
  async getRepresentatives(companyId: string, userId: string, limit: number = 100, offset: number = 0): Promise<Representative[]> {
    // Verify user has access to the company
    const company = await this.getCompanyById(companyId, userId)
    if (!company) {
      throw new Error('Company not found')
    }
    
    const { data, error } = await this.supabase
      .from('company_representatives')
      .select('*')
      .eq('company_id', companyId)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching representatives:', error)
      throw new Error('Failed to fetch representatives')
    }
    
    return data || []
  }

  // Get a representative by ID
  async getRepresentativeById(representativeId: string, companyId: string, userId: string): Promise<Representative | null> {
    // Verify user has access to the company
    const company = await this.getCompanyById(companyId, userId)
    if (!company) {
      throw new Error('Company not found')
    }
    
    const { data, error } = await this.supabase
      .from('company_representatives')
      .select('*')
      .eq('id', representativeId)
      .eq('company_id', companyId)
      .single()
    
    if (error) {
      console.error('Error fetching representative:', error)
      throw new Error('Failed to fetch representative')
    }
    
    return data || null
  }

  // Create a new representative
  async createRepresentative(representativeData: RepresentativeInsert, companyId: string, userId: string): Promise<Representative> {
    // Verify user has access to the company
    const company = await this.getCompanyById(companyId, userId)
    if (!company) {
      throw new Error('Company not found')
    }
    
    const { data, error } = await this.supabase
      .from('company_representatives')
      .insert({
        ...representativeData,
        company_id: companyId,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating representative:', error)
      throw new Error('Failed to create representative')
    }
    
    return data
  }

  // Update a representative
  async updateRepresentative(representativeId: string, representativeData: RepresentativeUpdate, companyId: string, userId: string): Promise<Representative> {
    // Verify user has access to the company
    const company = await this.getCompanyById(companyId, userId)
    if (!company) {
      throw new Error('Company not found')
    }
    
    const { data, error } = await this.supabase
      .from('company_representatives')
      .update({
        ...representativeData,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', representativeId)
      .eq('company_id', companyId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating representative:', error)
      throw new Error('Failed to update representative')
    }
    
    return data
  }

  // Delete a representative
  async deleteRepresentative(representativeId: string, companyId: string, userId: string): Promise<void> {
    // Verify user has access to the company
    const company = await this.getCompanyById(companyId, userId)
    if (!company) {
      throw new Error('Company not found')
    }
    
    const { error } = await this.supabase
      .from('company_representatives')
      .delete()
      .eq('id', representativeId)
      .eq('company_id', companyId)
    
    if (error) {
      console.error('Error deleting representative:', error)
      throw new Error('Failed to delete representative')
    }
  }
}

export const companyService = new CompanyService()