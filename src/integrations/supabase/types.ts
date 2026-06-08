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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          address: string | null
          artists: string[] | null
          city: string | null
          created_at: string
          description: string | null
          dress_code: string | null
          end_time: string | null
          entry_difficulty: string | null
          entry_difficulty_reason: string | null
          event_date: string
          event_day: string | null
          event_name: string
          event_type: string | null
          id: string
          image_url: string | null
          info_reliability_score: number | null
          is_free: boolean | null
          is_paid: boolean | null
          last_updated: string
          latitude: number | null
          longitude: number | null
          main_style: string | null
          min_age: string | null
          neighborhood: string | null
          popularity_score: number | null
          price_max: number | null
          price_min: number | null
          secondary_styles: string[] | null
          sources: Json | null
          start_time: string | null
          status: string | null
          ticket_required: boolean | null
          ticket_url: string | null
          unique_key: string | null
          venue_name: string | null
        }
        Insert: {
          address?: string | null
          artists?: string[] | null
          city?: string | null
          created_at?: string
          description?: string | null
          dress_code?: string | null
          end_time?: string | null
          entry_difficulty?: string | null
          entry_difficulty_reason?: string | null
          event_date: string
          event_day?: string | null
          event_name: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          info_reliability_score?: number | null
          is_free?: boolean | null
          is_paid?: boolean | null
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          main_style?: string | null
          min_age?: string | null
          neighborhood?: string | null
          popularity_score?: number | null
          price_max?: number | null
          price_min?: number | null
          secondary_styles?: string[] | null
          sources?: Json | null
          start_time?: string | null
          status?: string | null
          ticket_required?: boolean | null
          ticket_url?: string | null
          unique_key?: string | null
          venue_name?: string | null
        }
        Update: {
          address?: string | null
          artists?: string[] | null
          city?: string | null
          created_at?: string
          description?: string | null
          dress_code?: string | null
          end_time?: string | null
          entry_difficulty?: string | null
          entry_difficulty_reason?: string | null
          event_date?: string
          event_day?: string | null
          event_name?: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          info_reliability_score?: number | null
          is_free?: boolean | null
          is_paid?: boolean | null
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          main_style?: string | null
          min_age?: string | null
          neighborhood?: string | null
          popularity_score?: number | null
          price_max?: number | null
          price_min?: number | null
          secondary_styles?: string[] | null
          sources?: Json | null
          start_time?: string | null
          status?: string | null
          ticket_required?: boolean | null
          ticket_url?: string | null
          unique_key?: string | null
          venue_name?: string | null
        }
        Relationships: []
      }
      ingestion_logs: {
        Row: {
          created_at: string
          duplicates_detected: number | null
          error_message: string | null
          events_created: number | null
          events_found: number | null
          events_updated: number | null
          id: string
          run_finished_at: string | null
          run_started_at: string | null
          source_name: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          duplicates_detected?: number | null
          error_message?: string | null
          events_created?: number | null
          events_found?: number | null
          events_updated?: number | null
          id?: string
          run_finished_at?: string | null
          run_started_at?: string | null
          source_name?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          duplicates_detected?: number | null
          error_message?: string | null
          events_created?: number | null
          events_found?: number | null
          events_updated?: number | null
          id?: string
          run_finished_at?: string | null
          run_started_at?: string | null
          source_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      saved_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          alternative_method: string | null
          api_available: boolean | null
          base_url: string | null
          created_at: string
          id: string
          legal_risk: string | null
          scraping_allowed: boolean | null
          source_name: string
          source_type: string | null
          technical_difficulty: string | null
          update_frequency: string | null
        }
        Insert: {
          alternative_method?: string | null
          api_available?: boolean | null
          base_url?: string | null
          created_at?: string
          id?: string
          legal_risk?: string | null
          scraping_allowed?: boolean | null
          source_name: string
          source_type?: string | null
          technical_difficulty?: string | null
          update_frequency?: string | null
        }
        Update: {
          alternative_method?: string | null
          api_available?: boolean | null
          base_url?: string | null
          created_at?: string
          id?: string
          legal_risk?: string | null
          scraping_allowed?: boolean | null
          source_name?: string
          source_type?: string | null
          technical_difficulty?: string | null
          update_frequency?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          instagram_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          source_notes: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          source_notes?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          instagram_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          source_notes?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
