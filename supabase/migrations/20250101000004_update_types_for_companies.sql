-- This migration ensures the TypeScript types are updated to include companies and company_representatives tables
-- Since we can't run the supabase CLI to regenerate types, we'll document what needs to be added to types/supabase.ts

-- The following tables need to be added to the Database interface in types/supabase.ts:

/*
companies: {
  Row: {
    id: string
    name: string
    legal_name: string | null
    description: string | null
    website_url: string | null
    logo_url: string | null
    industry: string | null
    company_size: string | null
    founded_year: number | null
    employee_count: number | null
    street_address: string | null
    city: string | null
    state_province: string | null
    postal_code: string | null
    country: string | null
    phone: string | null
    email: string | null
    support_email: string | null
    linkedin_url: string | null
    twitter_url: string | null
    facebook_url: string | null
    tax_id: string | null
    vat_number: string | null
    duns_number: string | null
    created_by: string | null
    created_at: string | null
    updated_at: string | null
    updated_by: string | null
  }
  Insert: {
    id?: string
    name: string
    legal_name?: string | null
    description?: string | null
    website_url?: string | null
    logo_url?: string | null
    industry?: string | null
    company_size?: string | null
    founded_year?: number | null
    employee_count?: number | null
    street_address?: string | null
    city?: string | null
    state_province?: string | null
    postal_code?: string | null
    country?: string | null
    phone?: string | null
    email?: string | null
    support_email?: string | null
    linkedin_url?: string | null
    twitter_url?: string | null
    facebook_url?: string | null
    tax_id?: string | null
    vat_number?: string | null
    duns_number?: string | null
    created_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    updated_by?: string | null
  }
  Update: {
    id?: string
    name?: string
    legal_name?: string | null
    description?: string | null
    website_url?: string | null
    logo_url?: string | null
    industry?: string | null
    company_size?: string | null
    founded_year?: number | null
    employee_count?: number | null
    street_address?: string | null
    city?: string | null
    state_province?: string | null
    postal_code?: string | null
    country?: string | null
    phone?: string | null
    email?: string | null
    support_email?: string | null
    linkedin_url?: string | null
    twitter_url?: string | null
    facebook_url?: string | null
    tax_id?: string | null
    vat_number?: string | null
    duns_number?: string | null
    created_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    updated_by?: string | null
  }
}

company_representatives: {
  Row: {
    id: string
    company_id: string
    user_id: string | null
    first_name: string | null
    last_name: string | null
    full_name: string | null
    email: string | null
    phone: string | null
    mobile_phone: string | null
    job_title: string | null
    department: string | null
    role: string | null
    preferred_contact_method: string | null
    timezone: string | null
    availability: string | null
    status: string | null
    is_primary: boolean | null
    can_approve: boolean | null
    can_view_pricing: boolean | null
    notes: string | null
    tags: string[] | null
    created_by: string | null
    created_at: string | null
    updated_at: string | null
    updated_by: string | null
  }
  Insert: {
    id?: string
    company_id: string
    user_id?: string | null
    first_name?: string | null
    last_name?: string | null
    full_name?: string | null
    email?: string | null
    phone?: string | null
    mobile_phone?: string | null
    job_title?: string | null
    department?: string | null
    role?: string | null
    preferred_contact_method?: string | null
    timezone?: string | null
    availability?: string | null
    status?: string | null
    is_primary?: boolean | null
    can_approve?: boolean | null
    can_view_pricing?: boolean | null
    notes?: string | null
    tags?: string[] | null
    created_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    updated_by?: string | null
  }
  Update: {
    id?: string
    company_id?: string
    user_id?: string | null
    first_name?: string | null
    last_name?: string | null
    full_name?: string | null
    email?: string | null
    phone?: string | null
    mobile_phone?: string | null
    job_title?: string | null
    department?: string | null
    role?: string | null
    preferred_contact_method?: string | null
    timezone?: string | null
    availability?: string | null
    status?: string | null
    is_primary?: boolean | null
    can_approve?: boolean | null
    can_view_pricing?: boolean | null
    notes?: string | null
    tags?: string[] | null
    created_by?: string | null
    created_at?: string | null
    updated_at?: string | null
    updated_by?: string | null
  }
}
*/