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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          whatsapp?: string
        }
        Relationships: []
      }
      plan_changes: {
        Row: {
          changed_at: string
          id: string
          new_plan: string
          previous_plan: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          new_plan: string
          previous_plan?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          new_plan?: string
          previous_plan?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plan_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          type: string
          status: string
          proof_url: string | null
          proof_filename: string | null
          admin_notes: string | null
          avulsa_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          type?: string
          status?: string
          proof_url?: string | null
          proof_filename?: string | null
          admin_notes?: string | null
          avulsa_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: string
          type?: string
          status?: string
          proof_url?: string | null
          proof_filename?: string | null
          admin_notes?: string | null
          avulsa_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string
          created_at: string
          email: string
          id: string
          phone: string | null
          plan: Database["public"]["Enums"]["plan_type"] | null
          plan_status: string | null
          plan_expires_at: string | null
          monthly_quota: number
          recordings_used: number
          recordings_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          id?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          plan_status?: string | null
          plan_expires_at?: string | null
          monthly_quota?: number
          recordings_used?: number
          recordings_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_type"] | null
          plan_status?: string | null
          plan_expires_at?: string | null
          monthly_quota?: number
          recordings_used?: number
          recordings_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recording_orders: {
        Row: {
          company_name: string
          created_at: string
          duration: Database["public"]["Enums"]["duration_type"]
          id: string
          offer_text: string
          product_campaign: string
          recording_type: Database["public"]["Enums"]["recording_type"]
          status: string
          tone: Database["public"]["Enums"]["tone_type"]
          updated_at: string
          user_id: string
          audio_url: string | null
          audio_filename: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          duration: Database["public"]["Enums"]["duration_type"]
          id?: string
          offer_text: string
          product_campaign: string
          recording_type: Database["public"]["Enums"]["recording_type"]
          status?: string
          tone: Database["public"]["Enums"]["tone_type"]
          updated_at?: string
          user_id: string
          audio_url?: string | null
          audio_filename?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          duration?: Database["public"]["Enums"]["duration_type"]
          id?: string
          offer_text?: string
          product_campaign?: string
          recording_type?: Database["public"]["Enums"]["recording_type"]
          status?: string
          tone?: Database["public"]["Enums"]["tone_type"]
          updated_at?: string
          user_id?: string
          audio_url?: string | null
          audio_filename?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      register_first_admin: { Args: { _user_id: string }; Returns: boolean }
      approve_subscription: {
        Args: {
          p_subscription_id: string
          p_action: string
          p_admin_notes?: string | null
        }
        Returns: void
      }
    }
    Enums: {
      app_role: "admin" | "user"
      duration_type: "30s" | "45s" | "60s"
      plan_type: "bronze" | "prata" | "ouro"
      recording_type: "oferta" | "institucional" | "sazonal"
      tone_type: "serio" | "animado" | "promocional"
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
      app_role: ["admin", "user"],
      duration_type: ["30s", "45s", "60s"],
      plan_type: ["bronze", "prata", "ouro"],
      recording_type: ["oferta", "institucional", "sazonal"],
      tone_type: ["serio", "animado", "promocional"],
    },
  },
} as const
