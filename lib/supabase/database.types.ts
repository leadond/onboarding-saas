export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          request_id: string | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          request_id?: string | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          request_id?: string | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      client_progress: {
        Row: {
          client_email: string | null
          client_identifier: string
          client_name: string | null
          client_phone: string | null
          completed_at: string | null
          id: string
          ip_address: unknown | null
          kit_id: string | null
          response_data: Json | null
          started_at: string | null
          status: string | null
          step_id: string | null
          time_spent: number | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          client_email?: string | null
          client_identifier: string
          client_name?: string | null
          client_phone?: string | null
          completed_at?: string | null
          id?: string
          ip_address?: unknown | null
          kit_id?: string | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          step_id?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          client_email?: string | null
          client_identifier?: string
          client_name?: string | null
          client_phone?: string | null
          completed_at?: string | null
          id?: string
          ip_address?: unknown | null
          kit_id?: string | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          step_id?: string | null
          time_spent?: number | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_progress_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "kit_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          client_identifier: string
          created_at: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          kit_id: string | null
          metadata: Json | null
          mime_type: string | null
          original_filename: string
          step_id: string | null
          stored_filename: string
          upload_status: string | null
          virus_scan_result: Json | null
          virus_scan_status: string | null
        }
        Insert: {
          client_identifier: string
          created_at?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          kit_id?: string | null
          metadata?: Json | null
          mime_type?: string | null
          original_filename: string
          step_id?: string | null
          stored_filename: string
          upload_status?: string | null
          virus_scan_result?: Json | null
          virus_scan_status?: string | null
        }
        Update: {
          client_identifier?: string
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          kit_id?: string | null
          metadata?: Json | null
          mime_type?: string | null
          original_filename?: string
          step_id?: string | null
          stored_filename?: string
          upload_status?: string | null
          virus_scan_result?: Json | null
          virus_scan_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_uploads_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "kit_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          config_schema: Json | null
          created_at: string | null
          description: string | null
          documentation_url: string | null
          features: string[] | null
          field_schema: Json | null
          id: string
          integration_type: string
          is_active: boolean | null
          is_beta: boolean | null
          logo_url: string | null
          name: string
          popularity_score: number | null
          pricing_info: string | null
          requires_approval: boolean | null
          setup_complexity: string | null
          supported_auth_methods: string[] | null
          supported_scopes: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          features?: string[] | null
          field_schema?: Json | null
          id: string
          integration_type: string
          is_active?: boolean | null
          is_beta?: boolean | null
          logo_url?: string | null
          name: string
          popularity_score?: number | null
          pricing_info?: string | null
          requires_approval?: boolean | null
          setup_complexity?: string | null
          supported_auth_methods?: string[] | null
          supported_scopes?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          documentation_url?: string | null
          features?: string[] | null
          field_schema?: Json | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          is_beta?: boolean | null
          logo_url?: string | null
          name?: string
          popularity_score?: number | null
          pricing_info?: string | null
          requires_approval?: boolean | null
          setup_complexity?: string | null
          supported_auth_methods?: string[] | null
          supported_scopes?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      integration_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_seconds: number | null
          errors: Json | null
          id: string
          integration_id: string
          metadata: Json | null
          records_failed: number | null
          records_processed: number | null
          records_successful: number | null
          started_at: string | null
          status: string
          sync_direction: string
          sync_type: string
          warnings: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          errors?: Json | null
          id?: string
          integration_id: string
          metadata?: Json | null
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          started_at?: string | null
          status: string
          sync_direction?: string
          sync_type: string
          warnings?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          errors?: Json | null
          id?: string
          integration_id?: string
          metadata?: Json | null
          records_failed?: number | null
          records_processed?: number | null
          records_successful?: number | null
          started_at?: string | null
          status?: string
          sync_direction?: string
          sync_type?: string
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "user_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_analytics: {
        Row: {
          client_identifier: string | null
          id: string
          kit_id: string | null
          metric_name: string
          metric_value: Json
          recorded_at: string | null
          referrer: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          client_identifier?: string | null
          id?: string
          kit_id?: string | null
          metric_name: string
          metric_value: Json
          recorded_at?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          client_identifier?: string | null
          id?: string
          kit_id?: string | null
          metric_name?: string
          metric_value?: Json
          recorded_at?: string | null
          referrer?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kit_analytics_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_steps: {
        Row: {
          conditional_logic: Json | null
          content: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          kit_id: string | null
          settings: Json | null
          step_order: number
          step_type: Database["public"]["Enums"]["step_type"]
          title: string
          updated_at: string | null
        }
        Insert: {
          conditional_logic?: Json | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          kit_id?: string | null
          settings?: Json | null
          step_order: number
          step_type: Database["public"]["Enums"]["step_type"]
          title: string
          updated_at?: string | null
        }
        Update: {
          conditional_logic?: Json | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          kit_id?: string | null
          settings?: Json | null
          step_order?: number
          step_type?: Database["public"]["Enums"]["step_type"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kit_steps_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          analytics_enabled: boolean | null
          brand_color: string | null
          completion_redirect_url: string | null
          created_at: string | null
          custom_domain: string | null
          description: string | null
          id: string
          is_template: boolean | null
          logo_url: string | null
          name: string
          password_hash: string | null
          password_protected: boolean | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["kit_status"] | null
          updated_at: string | null
          user_id: string | null
          welcome_message: string | null
        }
        Insert: {
          analytics_enabled?: boolean | null
          brand_color?: string | null
          completion_redirect_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          logo_url?: string | null
          name: string
          password_hash?: string | null
          password_protected?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["kit_status"] | null
          updated_at?: string | null
          user_id?: string | null
          welcome_message?: string | null
        }
        Update: {
          analytics_enabled?: boolean | null
          brand_color?: string | null
          completion_redirect_url?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          logo_url?: string | null
          name?: string
          password_hash?: string | null
          password_protected?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["kit_status"] | null
          updated_at?: string | null
          user_id?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string | null
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          ended_at?: string | null
          id?: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          resource_id: string | null
          resource_type: string
          updated_at: string | null
          usage_amount: number | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          resource_id?: string | null
          resource_type: string
          updated_at?: string | null
          usage_amount?: number | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          resource_id?: string | null
          resource_type?: string
          updated_at?: string | null
          usage_amount?: number | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_integrations: {
        Row: {
          auto_sync: boolean | null
          config: Json | null
          connected_at: string | null
          connection_data: Json | null
          created_at: string | null
          credentials: Json | null
          disconnected_at: string | null
          error_count: number | null
          field_mappings: Json | null
          id: string
          integration_type: string
          last_error_at: string | null
          last_error_message: string | null
          last_sync_at: string | null
          organization_id: string | null
          provider_id: string
          provider_name: string
          scopes: string[] | null
          status: string | null
          sync_frequency: string | null
          sync_settings: Json | null
          sync_stats: Json | null
          updated_at: string | null
          usage_stats: Json | null
          user_id: string
        }
        Insert: {
          auto_sync?: boolean | null
          config?: Json | null
          connected_at?: string | null
          connection_data?: Json | null
          created_at?: string | null
          credentials?: Json | null
          disconnected_at?: string | null
          error_count?: number | null
          field_mappings?: Json | null
          id?: string
          integration_type: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_sync_at?: string | null
          organization_id?: string | null
          provider_id: string
          provider_name: string
          scopes?: string[] | null
          status?: string | null
          sync_frequency?: string | null
          sync_settings?: Json | null
          sync_stats?: Json | null
          updated_at?: string | null
          usage_stats?: Json | null
          user_id: string
        }
        Update: {
          auto_sync?: boolean | null
          config?: Json | null
          connected_at?: string | null
          connection_data?: Json | null
          created_at?: string | null
          credentials?: Json | null
          disconnected_at?: string | null
          error_count?: number | null
          field_mappings?: Json | null
          id?: string
          integration_type?: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_sync_at?: string | null
          organization_id?: string | null
          provider_id?: string
          provider_name?: string
          scopes?: string[] | null
          status?: string | null
          sync_frequency?: string | null
          sync_settings?: Json | null
          sync_stats?: Json | null
          updated_at?: string | null
          usage_stats?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          onboarding_completed_at: string | null
          stripe_customer_id: string | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          onboarding_completed_at?: string | null
          stripe_customer_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          onboarding_completed_at?: string | null
          stripe_customer_id?: string | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_data: Json
          event_id: string | null
          event_type: string
          id: string
          last_retry_at: string | null
          processed: boolean | null
          processed_at: string | null
          retry_count: number | null
          source: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_data: Json
          event_id?: string | null
          event_type: string
          id?: string
          last_retry_at?: string | null
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
          source: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_data?: Json
          event_id?: string | null
          event_type?: string
          id?: string
          last_retry_at?: string | null
          processed?: boolean | null
          processed_at?: string | null
          retry_count?: number | null
          source?: string
        }
        Relationships: []
      }
      data_access_requests: {
        Row: {
          id: string
          user_id: string
          table_name: string
          record_id: string | null
          access_type: string
          reason: string | null
          status: Database["public"]["Enums"]["data_access_request_status"]
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
          status?: Database["public"]["Enums"]["data_access_request_status"]
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
          status?: Database["public"]["Enums"]["data_access_request_status"]
          approved_by?: string | null
          approved_at?: string | null
          rejected_by?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_usage_limit: {
        Args: {
          p_requested_amount?: number
          p_resource_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      generate_unique_slug: {
        Args: { name: string }
        Returns: string
      }
      get_file_url: {
        Args: { bucket_name: string; expires_in?: number; file_path: string }
        Returns: string
      }
      get_kit_metrics: {
        Args: { p_end_date?: string; p_kit_id: string; p_start_date?: string }
        Returns: Json
      }
      get_user_integrations: {
        Args: { integration_type_filter?: string; user_uuid: string }
        Returns: {
          config: Json
          id: string
          integration_type: string
          last_sync_at: string
          provider_id: string
          provider_name: string
          status: string
          sync_stats: Json
        }[]
      }
      log_integration_activity: {
        Args: {
          activity_details?: Json
          activity_type: string
          integration_uuid: string
        }
        Returns: string
      }
      track_kit_event: {
        Args: {
          p_client_identifier?: string
          p_event_data?: Json
          p_event_name: string
          p_kit_id: string
          p_session_id?: string
        }
        Returns: undefined
      }
      track_usage: {
        Args: {
          p_resource_id?: string
          p_resource_type: string
          p_usage_amount?: number
          p_usage_count?: number
          p_user_id: string
        }
        Returns: undefined
      }
      update_integration_sync_status: {
        Args: {
          error_message?: string
          integration_uuid: string
          records_processed?: number
          sync_successful: boolean
        }
        Returns: undefined
      }
      user_within_kit_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_file_upload: {
        Args: {
          bucket_name: string
          file_name: string
          file_size: number
          mime_type: string
        }
        Returns: boolean
      }
    }
    Enums: {
      audit_action:
        | "create"
        | "read"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "export"
      client_progress_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "abandoned"
      kit_status: "draft" | "published" | "archived"
      kit_step_type:
        | "welcome"
        | "form"
        | "file_upload"
        | "payment"
        | "scheduling"
        | "contract"
        | "video"
        | "confirmation"
        | "custom"
      payment_status:
        | "pending"
        | "succeeded"
        | "failed"
        | "cancelled"
        | "refunded"
      step_type:
        | "welcome_message"
        | "welcome_video"
        | "intake_form"
        | "file_upload"
        | "contract_signing"
        | "scheduling"
        | "payment"
        | "confirmation"
      subscription_status: "active" | "canceled" | "past_due" | "unpaid"
      data_access_request_status: "pending" | "approved" | "rejected" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_action: [
        "create",
        "read",
        "update",
        "delete",
        "login",
        "logout",
        "export",
      ],
      client_progress_status: [
        "not_started",
        "in_progress",
        "completed",
        "abandoned",
      ],
      kit_status: ["draft", "published", "archived"],
      kit_step_type: [
        "welcome",
        "form",
        "file_upload",
        "payment",
        "scheduling",
        "contract",
        "video",
        "confirmation",
        "custom",
      ],
      payment_status: [
        "pending",
        "succeeded",
        "failed",
        "cancelled",
        "refunded",
      ],
      step_type: [
        "welcome_message",
        "welcome_video",
        "intake_form",
        "file_upload",
        "contract_signing",
        "scheduling",
        "payment",
        "confirmation",
      ],
      subscription_status: ["active", "canceled", "past_due", "unpaid"],
      data_access_request_status: ["pending", "approved", "rejected", "completed"],
    },
  },
} as const
