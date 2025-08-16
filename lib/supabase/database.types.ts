export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          subscription_tier: string
          trial_ends_at: string | null
          onboarding_completed_at: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          stripe_customer_id?: string | null
          subscription_tier?: string
          trial_ends_at?: string | null
          onboarding_completed_at?: string | null
          last_login_at?: string | null
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
          subscription_tier?: string
          trial_ends_at?: string | null
          onboarding_completed_at?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          industry: string | null
          company_size: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | null
          subscription_tier: 'free' | 'pro' | 'enterprise' | 'custom'
          subscription_status: 'active' | 'cancelled' | 'suspended' | 'trial'
          trial_ends_at: string | null
          billing_email: string | null
          settings: Json
          branding: Json
          max_users: number
          max_kits: number
          max_storage_gb: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          industry?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | null
          subscription_tier?: 'free' | 'pro' | 'enterprise' | 'custom'
          subscription_status?: 'active' | 'cancelled' | 'suspended' | 'trial'
          trial_ends_at?: string | null
          billing_email?: string | null
          settings?: Json
          branding?: Json
          max_users?: number
          max_kits?: number
          max_storage_gb?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          industry?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+' | null
          subscription_tier?: 'free' | 'pro' | 'enterprise' | 'custom'
          subscription_status?: 'active' | 'cancelled' | 'suspended' | 'trial'
          trial_ends_at?: string | null
          billing_email?: string | null
          settings?: Json
          branding?: Json
          max_users?: number
          max_kits?: number
          max_storage_gb?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organizations_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'manager' | 'editor' | 'viewer'
          status: 'active' | 'inactive' | 'pending' | 'suspended'
          invited_by: string | null
          invited_at: string | null
          joined_at: string | null
          custom_permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'manager' | 'editor' | 'viewer'
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          custom_permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'manager' | 'editor' | 'viewer'
          status?: 'active' | 'inactive' | 'pending' | 'suspended'
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string | null
          custom_permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_members_invited_by_fkey'
            columns: ['invited_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      teams: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          color: string
          settings: Json
          team_lead_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          color?: string
          settings?: Json
          team_lead_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          color?: string
          settings?: Json
          team_lead_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'teams_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teams_team_lead_id_fkey'
            columns: ['team_lead_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'teams_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'lead' | 'member'
          status: 'active' | 'inactive'
          added_by: string
          added_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'lead' | 'member'
          status?: 'active' | 'inactive'
          added_by: string
          added_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'lead' | 'member'
          status?: 'active' | 'inactive'
          added_by?: string
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey'
            columns: ['team_id']
            referencedRelation: 'teams'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_members_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'team_members_added_by_fkey'
            columns: ['added_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      kits: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          welcome_message: string | null
          brand_color: string
          logo_url: string | null
          status: 'draft' | 'published' | 'archived'
          is_template: boolean
          completion_redirect_url: string | null
          custom_domain: string | null
          seo_title: string | null
          seo_description: string | null
          analytics_enabled: boolean
          password_protected: boolean
          password_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          welcome_message?: string | null
          brand_color?: string
          logo_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_template?: boolean
          completion_redirect_url?: string | null
          custom_domain?: string | null
          seo_title?: string | null
          seo_description?: string | null
          analytics_enabled?: boolean
          password_protected?: boolean
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          welcome_message?: string | null
          brand_color?: string
          logo_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_template?: boolean
          completion_redirect_url?: string | null
          custom_domain?: string | null
          seo_title?: string | null
          seo_description?: string | null
          analytics_enabled?: boolean
          password_protected?: boolean
          password_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kits_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      kit_steps: {
        Row: {
          id: string
          kit_id: string
          step_order: number
          step_type:
            | 'welcome_message'
            | 'welcome_video'
            | 'intake_form'
            | 'file_upload'
            | 'contract_signing'
            | 'scheduling'
            | 'payment'
            | 'confirmation'
          title: string
          description: string | null
          content: Json
          is_required: boolean
          is_active: boolean
          settings: Json
          conditional_logic: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          step_order: number
          step_type:
            | 'welcome_message'
            | 'welcome_video'
            | 'intake_form'
            | 'file_upload'
            | 'contract_signing'
            | 'scheduling'
            | 'payment'
            | 'confirmation'
          title: string
          description?: string | null
          content?: Json
          is_required?: boolean
          is_active?: boolean
          settings?: Json
          conditional_logic?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          step_order?: number
          step_type?:
            | 'welcome_message'
            | 'welcome_video'
            | 'intake_form'
            | 'file_upload'
            | 'contract_signing'
            | 'scheduling'
            | 'payment'
            | 'confirmation'
          title?: string
          description?: string | null
          content?: Json
          is_required?: boolean
          is_active?: boolean
          settings?: Json
          conditional_logic?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'kit_steps_kit_id_fkey'
            columns: ['kit_id']
            referencedRelation: 'kits'
            referencedColumns: ['id']
          },
        ]
      }
      client_progress: {
        Row: {
          id: string
          kit_id: string
          client_identifier: string
          client_name: string | null
          client_email: string | null
          client_phone: string | null
          step_id: string
          status: string
          response_data: Json | null
          time_spent: number
          ip_address: string | null
          user_agent: string | null
          completed_at: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          client_identifier: string
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          step_id: string
          status?: string
          response_data?: Json | null
          time_spent?: number
          ip_address?: string | null
          user_agent?: string | null
          completed_at?: string | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          client_identifier?: string
          client_name?: string | null
          client_email?: string | null
          client_phone?: string | null
          step_id?: string
          status?: string
          response_data?: Json | null
          time_spent?: number
          ip_address?: string | null
          user_agent?: string | null
          completed_at?: string | null
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'client_progress_kit_id_fkey'
            columns: ['kit_id']
            referencedRelation: 'kits'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'client_progress_step_id_fkey'
            columns: ['step_id']
            referencedRelation: 'kit_steps'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          cancel_at: string | null
          canceled_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid'
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          resource_type: string
          resource_id: string | null
          usage_count: number
          usage_amount: number
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: string
          resource_id?: string | null
          usage_count?: number
          usage_amount?: number
          period_start: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: string
          resource_id?: string | null
          usage_count?: number
          usage_amount?: number
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'usage_tracking_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action:
            | 'create'
            | 'read'
            | 'update'
            | 'delete'
            | 'login'
            | 'logout'
            | 'export'
          resource_type: string
          resource_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          request_id: string | null
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action:
            | 'create'
            | 'read'
            | 'update'
            | 'delete'
            | 'login'
            | 'logout'
            | 'export'
          resource_type: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?:
            | 'create'
            | 'read'
            | 'update'
            | 'delete'
            | 'login'
            | 'logout'
            | 'export'
          resource_type?: string
          resource_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          session_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      kit_analytics: {
        Row: {
          id: string
          kit_id: string
          metric_name: string
          metric_value: Json
          recorded_at: string
          client_identifier: string | null
          session_id: string | null
          referrer: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
        }
        Insert: {
          id?: string
          kit_id: string
          metric_name: string
          metric_value: Json
          recorded_at?: string
          client_identifier?: string | null
          session_id?: string | null
          referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
        }
        Update: {
          id?: string
          kit_id?: string
          metric_name?: string
          metric_value?: Json
          recorded_at?: string
          client_identifier?: string | null
          session_id?: string | null
          referrer?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'kit_analytics_kit_id_fkey'
            columns: ['kit_id']
            referencedRelation: 'kits'
            referencedColumns: ['id']
          },
        ]
      }
      file_uploads: {
        Row: {
          id: string
          kit_id: string
          step_id: string
          client_identifier: string
          original_filename: string
          stored_filename: string
          file_path: string
          file_size: number | null
          file_type: string | null
          mime_type: string | null
          upload_status: string
          virus_scan_status: string
          virus_scan_result: Json | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          step_id: string
          client_identifier: string
          original_filename: string
          stored_filename: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          mime_type?: string | null
          upload_status?: string
          virus_scan_status?: string
          virus_scan_result?: Json | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          step_id?: string
          client_identifier?: string
          original_filename?: string
          stored_filename?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          mime_type?: string | null
          upload_status?: string
          virus_scan_status?: string
          virus_scan_result?: Json | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'file_uploads_kit_id_fkey'
            columns: ['kit_id']
            referencedRelation: 'kits'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'file_uploads_step_id_fkey'
            columns: ['step_id']
            referencedRelation: 'kit_steps'
            referencedColumns: ['id']
          },
        ]
      }
      webhook_events: {
        Row: {
          id: string
          source: string
          event_type: string
          event_id: string | null
          event_data: Json
          processed: boolean
          processed_at: string | null
          retry_count: number
          last_retry_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          event_id?: string | null
          event_data: Json
          processed?: boolean
          processed_at?: string | null
          retry_count?: number
          last_retry_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          event_type?: string
          event_id?: string | null
          event_data?: Json
          processed?: boolean
          processed_at?: string | null
          retry_count?: number
          last_retry_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      track_usage: {
        Args: {
          p_user_id: string
          p_resource_type: string
          p_resource_id?: string
          p_usage_count?: number
          p_usage_amount?: number
        }
        Returns: undefined
      }
      check_usage_limit: {
        Args: {
          p_user_id: string
          p_resource_type: string
          p_requested_amount?: number
        }
        Returns: boolean
      }
      track_kit_event: {
        Args: {
          p_kit_id: string
          p_event_name: string
          p_event_data?: Json
          p_client_identifier?: string
          p_session_id?: string
        }
        Returns: undefined
      }
      get_kit_metrics: {
        Args: {
          p_kit_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: Json
      }
      generate_unique_slug: {
        Args: {
          name: string
          table_name?: string
        }
        Returns: string
      }
      user_has_active_subscription: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_subscription_tier: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      user_within_kit_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid'
      step_type:
        | 'welcome_message'
        | 'welcome_video'
        | 'intake_form'
        | 'file_upload'
        | 'contract_signing'
        | 'scheduling'
        | 'payment'
        | 'confirmation'
      kit_status: 'draft' | 'published' | 'archived'
      audit_action:
        | 'create'
        | 'read'
        | 'update'
        | 'delete'
        | 'login'
        | 'logout'
        | 'export'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]
