export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          avatar_url: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          stripe_customer_id: string | null
          trial_ends_at: string | null
          subscription_tier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          subscription_tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          stripe_customer_id?: string | null
          trial_ends_at?: string | null
          subscription_tier?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      kits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      kit_steps: {
        Row: {
          id: string
          kit_id: string
          title: string
          description: string | null
          step_type: string
          content: any
          step_order: number
          is_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          title: string
          description?: string | null
          step_type: string
          content?: any
          step_order: number
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          title?: string
          description?: string | null
          step_type?: string
          content?: any
          step_order?: number
          is_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      client_progress: {
        Row: {
          id: string
          kit_id: string
          client_email: string
          current_step: number
          completed_steps: number[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          client_email: string
          current_step?: number
          completed_steps?: number[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          client_email?: string
          current_step?: number
          completed_steps?: number[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          resource_type: string
          resource_id: string
          action: string
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: string
          resource_id: string
          action: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: string
          resource_id?: string
          action?: string
          metadata?: any
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          metadata: any
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          metadata?: any
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          metadata?: any
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      kit_analytics: {
        Row: {
          id: string
          kit_id: string
          metric_name: string
          metric_value: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          metric_name: string
          metric_value: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          metric_name?: string
          metric_value?: number
          date?: string
          created_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          created_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          event_type: string
          payload: any
          processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          payload: any
          processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          payload?: any
          processed?: boolean
          created_at?: string
        }
      }
      // Additional tables for comprehensive coverage
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          permissions: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          permissions?: string[]
          created_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          resource: string
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          resource: string
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          resource?: string
          action?: string
          created_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type: string
          resource_id: string
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string
          resource_id?: string
          metadata?: any
          created_at?: string
        }
      }
      webhook_endpoints: {
        Row: {
          id: string
          user_id: string
          url: string
          events: string[]
          secret: string
          active: boolean
          last_failure_at: string | null
          failure_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          events: string[]
          secret: string
          active?: boolean
          last_failure_at?: string | null
          failure_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          events?: string[]
          secret?: string
          active?: boolean
          last_failure_at?: string | null
          failure_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      webhook_deliveries: {
        Row: {
          id: string
          webhook_endpoint_id: string
          event_id: string
          status: string
          response_status: number | null
          response_body: string | null
          attempts: number
          next_retry_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          webhook_endpoint_id: string
          event_id: string
          status: string
          response_status?: number | null
          response_body?: string | null
          attempts?: number
          next_retry_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          webhook_endpoint_id?: string
          event_id?: string
          status?: string
          response_status?: number | null
          response_body?: string | null
          attempts?: number
          next_retry_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_integrations: {
        Row: {
          id: string
          user_id: string
          integration_type: string
          provider_id: string
          access_token: string
          refresh_token: string | null
          expires_at: string | null
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          integration_type: string
          provider_id: string
          access_token: string
          refresh_token?: string | null
          expires_at?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          integration_type?: string
          provider_id?: string
          access_token?: string
          refresh_token?: string | null
          expires_at?: string | null
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          permissions: string[]
          last_used_at: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          permissions: string[]
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          permissions?: string[]
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      experiments: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: string
          variants: any
          traffic_allocation: number
          metrics: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status: string
          variants: any
          traffic_allocation: number
          metrics?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: string
          variants?: any
          traffic_allocation?: number
          metrics?: any
          created_at?: string
          updated_at?: string
        }
      }
      data_access_requests: {
        Row: {
          id: string
          user_id: string
          table_name: string
          record_id: string | null
          access_type: string
          reason: string | null
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          approved_by: string | null
          approved_at: string | null
          rejected_by: string | null
          rejected_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          table_name: string
          record_id?: string | null
          access_type: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          approved_by?: string | null
          approved_at?: string | null
          rejected_by?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          table_name?: string
          record_id?: string | null
          access_type?: string
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          approved_by?: string | null
          approved_at?: string | null
          rejected_by?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      track_usage: {
        Args: {
          user_id: string
          resource_type: string
          resource_id: string
          action: string
        }
        Returns: void
      }
      check_usage_limit: {
        Args: {
          user_id: string
          resource_type: string
        }
        Returns: boolean
      }
      track_kit_event: {
        Args: {
          kit_id: string
          event_type: string
          metadata: any
        }
        Returns: void
      }
      get_kit_metrics: {
        Args: {
          kit_id: string
          start_date: string
          end_date: string
        }
        Returns: any
      }
      generate_unique_slug: {
        Args: {
          base_slug: string
        }
        Returns: string
      }
      user_has_active_subscription: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      user_subscription_tier: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      user_within_kit_limit: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      increment: {
        Args: {
          x: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
