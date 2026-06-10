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
      device_models: {
        Row: {
          brand: string
          created_at: string
          description: string | null
          id: string
          model: string
          updated_at: string
        }
        Insert: {
          brand: string
          created_at?: string
          description?: string | null
          id?: string
          model: string
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          description?: string | null
          id?: string
          model?: string
          updated_at?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          archived_at: string | null
          battery_health: number | null
          blacklist_status: Database["public"]["Enums"]["blacklist_status"]
          carrier: string | null
          color: string | null
          condition_notes: string | null
          cost: number | null
          created_at: string
          grade: Database["public"]["Enums"]["device_grade"]
          id: string
          imei: string | null
          imei_checked_at: string | null
          is_local: boolean
          model_id: string
          price: number
          status: Database["public"]["Enums"]["device_status"]
          stock: number
          storage: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          battery_health?: number | null
          blacklist_status?: Database["public"]["Enums"]["blacklist_status"]
          carrier?: string | null
          color?: string | null
          condition_notes?: string | null
          cost?: number | null
          created_at?: string
          grade: Database["public"]["Enums"]["device_grade"]
          id?: string
          imei?: string | null
          imei_checked_at?: string | null
          is_local?: boolean
          model_id: string
          price: number
          status?: Database["public"]["Enums"]["device_status"]
          stock?: number
          storage?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          battery_health?: number | null
          blacklist_status?: Database["public"]["Enums"]["blacklist_status"]
          carrier?: string | null
          color?: string | null
          condition_notes?: string | null
          cost?: number | null
          created_at?: string
          grade?: Database["public"]["Enums"]["device_grade"]
          id?: string
          imei?: string | null
          imei_checked_at?: string | null
          is_local?: boolean
          model_id?: string
          price?: number
          status?: Database["public"]["Enums"]["device_status"]
          stock?: number
          storage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          device_brand: string
          device_id: string
          device_imei: string | null
          device_model: string
          id: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          device_brand: string
          device_id: string
          device_imei?: string | null
          device_model: string
          id?: string
          order_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          device_brand?: string
          device_id?: string
          device_imei?: string | null
          device_model?: string
          id?: string
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_fee: number
          denial_reason: string | null
          email_sent_at: string | null
          id: string
          idempotency_key: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_fee?: number
          denial_reason?: string | null
          email_sent_at?: string | null
          id?: string
          idempotency_key?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tax?: number
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          denial_reason?: string | null
          email_sent_at?: string | null
          id?: string
          idempotency_key?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_counters: {
        Row: {
          bucket: string
          count: number
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          window_start?: string
        }
        Update: {
          bucket?: string
          count?: number
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      devices_public: {
        Row: {
          battery_health: number | null
          brand: string | null
          carrier: string | null
          color: string | null
          condition_notes: string | null
          created_at: string | null
          grade: Database["public"]["Enums"]["device_grade"] | null
          id: string | null
          is_local: boolean | null
          model: string | null
          model_id: string | null
          price: number | null
          status: Database["public"]["Enums"]["device_status"] | null
          stock: number | null
          storage: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_order: {
        Args: { p_customer: Json; p_idempotency_key?: string; p_items: Json }
        Returns: Json
      }
      rl_hit: {
        Args: { p_bucket: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      blacklist_status: "unknown" | "clean" | "blacklisted"
      device_grade: "A+" | "A" | "B+" | "B" | "C"
      device_status: "available" | "reserved" | "sold"
      order_status:
        | "pending"
        | "approved"
        | "on_the_way"
        | "delivered"
        | "denied"
      payment_method: "cash" | "card"
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
      blacklist_status: ["unknown", "clean", "blacklisted"],
      device_grade: ["A+", "A", "B+", "B", "C"],
      device_status: ["available", "reserved", "sold"],
      order_status: [
        "pending",
        "approved",
        "on_the_way",
        "delivered",
        "denied",
      ],
      payment_method: ["cash", "card"],
    },
  },
} as const
