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
      deal_messages: {
        Row: {
          body: string
          created_at: string
          cta_url: string | null
          deal_id: string
          id: string
          sender_id: string | null
          sender_role: string
        }
        Insert: {
          body: string
          created_at?: string
          cta_url?: string | null
          deal_id: string
          id?: string
          sender_id?: string | null
          sender_role: string
        }
        Update: {
          body?: string
          created_at?: string
          cta_url?: string | null
          deal_id?: string
          id?: string
          sender_id?: string | null
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_reviews: {
        Row: {
          comment: string | null
          created_at: string
          deal_id: string | null
          id: string
          reviewer_id: string
          stars: number
          subject_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          reviewer_id: string
          stars: number
          subject_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          deal_id?: string | null
          id?: string
          reviewer_id?: string
          stars?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_reviews_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          buyer_email: string
          buyer_id: string | null
          buyer_name: string | null
          counter: number | null
          created_at: string
          domain_id: string
          domain_name: string
          escrow_transaction_id: string | null
          id: string
          offer: number
          seller_id: string
          stage: string
          updated_at: string
        }
        Insert: {
          buyer_email: string
          buyer_id?: string | null
          buyer_name?: string | null
          counter?: number | null
          created_at?: string
          domain_id: string
          domain_name: string
          escrow_transaction_id?: string | null
          id?: string
          offer?: number
          seller_id: string
          stage?: string
          updated_at?: string
        }
        Update: {
          buyer_email?: string
          buyer_id?: string | null
          buyer_name?: string | null
          counter?: number | null
          created_at?: string
          domain_id?: string
          domain_name?: string
          escrow_transaction_id?: string | null
          id?: string
          offer?: number
          seller_id?: string
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          appraised_value: number | null
          created_at: string
          domain_name: string
          expiry_date: string
          id: string
          price: number | null
          registrar: string
          selected_lander: string
          status: string
          updated_at: string
          user_id: string
          visitor_count: number
        }
        Insert: {
          appraised_value?: number | null
          created_at?: string
          domain_name: string
          expiry_date: string
          id?: string
          price?: number | null
          registrar: string
          selected_lander?: string
          status?: string
          updated_at?: string
          user_id: string
          visitor_count?: number
        }
        Update: {
          appraised_value?: number | null
          created_at?: string
          domain_name?: string
          expiry_date?: string
          id?: string
          price?: number | null
          registrar?: string
          selected_lander?: string
          status?: string
          updated_at?: string
          user_id?: string
          visitor_count?: number
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          broker_tip_bps: number
          buyer_email: string
          created_at: string
          currency: string
          deal_id: string | null
          domain_id: string | null
          domain_name: string
          fee_allocation: string
          id: string
          landing_url: string | null
          payment_url: string | null
          raw: Json | null
          seller_email: string
          seller_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          broker_tip_bps?: number
          buyer_email: string
          created_at?: string
          currency?: string
          deal_id?: string | null
          domain_id?: string | null
          domain_name: string
          fee_allocation?: string
          id?: string
          landing_url?: string | null
          payment_url?: string | null
          raw?: Json | null
          seller_email: string
          seller_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          broker_tip_bps?: number
          buyer_email?: string
          created_at?: string
          currency?: string
          deal_id?: string | null
          domain_id?: string | null
          domain_name?: string
          fee_allocation?: string
          id?: string
          landing_url?: string | null
          payment_url?: string | null
          raw?: Json | null
          seller_email?: string
          seller_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_webhook_logs: {
        Row: {
          created_at: string
          error: string | null
          headers: Json | null
          id: string
          matched_record_id: string | null
          raw: Json | null
          signature_valid: boolean
          status: string | null
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          headers?: Json | null
          id?: string
          matched_record_id?: string | null
          raw?: Json | null
          signature_valid?: boolean
          status?: string | null
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          headers?: Json | null
          id?: string
          matched_record_id?: string | null
          raw?: Json | null
          signature_valid?: boolean
          status?: string | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          handle: string | null
          id: string
          updated_at: string
          verification: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id: string
          updated_at?: string
          verification?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id?: string
          updated_at?: string
          verification?: string
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
      visits: {
        Row: {
          city: string | null
          country: string | null
          domain_id: string
          id: string
          lat: number | null
          lon: number | null
          referrer: string | null
          region: string | null
          ts: string
          ua_hash: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          domain_id: string
          id?: string
          lat?: number | null
          lon?: number | null
          referrer?: string | null
          region?: string | null
          ts?: string
          ua_hash?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          domain_id?: string
          id?: string
          lat?: number | null
          lon?: number | null
          referrer?: string | null
          region?: string | null
          ts?: string
          ua_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          created_at: string
          domain_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
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
      is_deal_participant: { Args: { _deal_id: string }; Returns: boolean }
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
