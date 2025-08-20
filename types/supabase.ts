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
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string
          details: Json
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id: string
          details?: Json
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string
          details?: Json
          session_id?: string | null
          created_at?: string
        }
      }
      client_progress: {
        Row: {
          id: string
          kit_id: string
          client_email: string
          client_name: string | null
          current_step: number
          completed_steps: number[]
          status: string
          created_at: string
          updated_at: string
          started_at: string | null
          completed_at: string | null
          time_spent: number | null
          response_data: Json | null
        }
        Insert: {
          id?: string
          kit_id: string
          client_email: string
          client_name?: string | null
          current_step?: number
          completed_steps?: number[]
          status?: string
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          time_spent?: number | null
          response_data?: Json | null
        }
        Update: {
          id?: string
          kit_id?: string
          client_email?: string
          client_name?: string | null
          current_step?: number
          completed_steps?: number[]
          status?: string
          created_at?: string
          updated_at?: string
          started_at?: string | null
          completed_at?: string | null
          time_spent?: number | null
          response_data?: Json | null
        }
      }
      kits: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          brand_color: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          brand_color?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          brand_color?: string | null
          status?: string
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
          step_order: number
          content: Json
          is_required: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          title: string
          description?: string | null
          step_type: string
          step_order: number
          content?: Json
          is_required?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          title?: string
          description?: string | null
          step_type?: string
          step_order?: number
          content?: Json
          is_required?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          role: string
          provider: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          role?: string
          provider?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          role?: string
          provider?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          key: string
          count: number
          reset_time: number
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          count?: number
          reset_time: number
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          count?: number
          reset_time?: number
          updated_at?: string
        }
      }
      security_logs: {
        Row: {
          id: string
          event_type: string
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          source: string
          event_type: string
          event_id: string
          event_data: Json
          processed: boolean
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          event_type: string
          event_id: string
          event_data?: Json
          processed?: boolean
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          event_type?: string
          event_id?: string
          event_data?: Json
          processed?: boolean
          processed_at?: string | null
          created_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          domain: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      company_representatives: {
        Row: {
          id: string
          company_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          user_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      kit_analytics: {
        Row: {
          id: string
          kit_id: string
          metric_name: string
          metric_value: number
          recorded_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          metric_name: string
          metric_value: number
          recorded_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          metric_name?: string
          metric_value?: number
          recorded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Commonly used types
export type ClientProgress = Tables<'client_progress'>