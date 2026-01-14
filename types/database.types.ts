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
      activity_logs: {
        Row: {
          action_type: string
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          from_folder_id: string | null
          from_folder_name: string | null
          id: string
          ip_address: unknown
          quantity_after: number | null
          quantity_before: number | null
          quantity_delta: number | null
          tenant_id: string
          to_folder_id: string | null
          to_folder_name: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action_type: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          from_folder_id?: string | null
          from_folder_name?: string | null
          id?: string
          ip_address?: unknown
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_delta?: number | null
          tenant_id: string
          to_folder_id?: string | null
          to_folder_name?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action_type?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          from_folder_id?: string | null
          from_folder_name?: string | null
          id?: string
          ip_address?: unknown
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_delta?: number | null
          tenant_id?: string
          to_folder_id?: string | null
          to_folder_name?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_from_folder_id_fkey"
            columns: ["from_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "activity_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_to_folder_id_fkey"
            columns: ["to_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs_archive: {
        Row: {
          action_type: string
          archived_at: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          from_folder_id: string | null
          from_folder_name: string | null
          id: string
          ip_address: unknown
          quantity_after: number | null
          quantity_before: number | null
          quantity_delta: number | null
          tenant_id: string
          to_folder_id: string | null
          to_folder_name: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action_type: string
          archived_at?: string | null
          changes?: Json | null
          created_at: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          from_folder_id?: string | null
          from_folder_name?: string | null
          id: string
          ip_address?: unknown
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_delta?: number | null
          tenant_id: string
          to_folder_id?: string | null
          to_folder_name?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action_type?: string
          archived_at?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          from_folder_id?: string | null
          from_folder_name?: string | null
          id?: string
          ip_address?: unknown
          quantity_after?: number | null
          quantity_before?: number | null
          quantity_delta?: number | null
          tenant_id?: string
          to_folder_id?: string | null
          to_folder_name?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string | null
          id: string
          is_default_billing: boolean | null
          is_default_primary: boolean | null
          is_default_shipping: boolean | null
          name: string
          postal_code: string | null
          state: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country: string
          created_at?: string | null
          id?: string
          is_default_billing?: boolean | null
          is_default_primary?: boolean | null
          is_default_shipping?: boolean | null
          name: string
          postal_code?: string | null
          state?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default_billing?: boolean | null
          is_default_primary?: boolean | null
          is_default_shipping?: boolean | null
          name?: string
          postal_code?: string | null
          state?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "addresses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action_category: string
          action_type: string
          admin_email: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: unknown
          reason: string | null
          request_id: string | null
          state_after: Json | null
          state_before: Json | null
          target_id: string | null
          target_tenant_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_category: string
          action_type: string
          admin_email: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          reason?: string | null
          request_id?: string | null
          state_after?: Json | null
          state_before?: Json | null
          target_id?: string | null
          target_tenant_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_category?: string
          action_type?: string
          admin_email?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          reason?: string | null
          request_id?: string | null
          state_after?: Json | null
          state_before?: Json | null
          target_id?: string | null
          target_tenant_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "admin_audit_logs_target_tenant_id_fkey"
            columns: ["target_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          flag_name: string
          id: string
          is_enabled: boolean | null
          scope: string | null
          surfaces: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flag_name: string
          id?: string
          is_enabled?: boolean | null
          scope?: string | null
          surfaces?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flag_name?: string
          id?: string
          is_enabled?: boolean | null
          scope?: string | null
          surfaces?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          admin_user_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_revoked: boolean | null
          revoked_at: string | null
          revoked_reason: string | null
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          admin_user_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_revoked?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          admin_user_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_revoked?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          allowed_ips: unknown[] | null
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          require_2fa: boolean | null
          role: string
          session_timeout_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allowed_ips?: unknown[] | null
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          require_2fa?: boolean | null
          role?: string
          session_timeout_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allowed_ips?: unknown[] | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          require_2fa?: boolean | null
          role?: string
          session_timeout_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          notify_email: boolean | null
          notify_push: boolean | null
          target_id: string
          target_type: string
          tenant_id: string
          threshold: number | null
          threshold_date: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          notify_email?: boolean | null
          notify_push?: boolean | null
          target_id: string
          target_type: string
          tenant_id: string
          threshold?: number | null
          threshold_date?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          notify_email?: boolean | null
          notify_push?: boolean | null
          target_id?: string
          target_type?: string
          tenant_id?: string
          threshold?: number | null
          threshold_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chatter_mentions: {
        Row: {
          created_at: string | null
          id: string
          mentioned_user_id: string
          message_id: string
          read_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mentioned_user_id: string
          message_id: string
          read_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mentioned_user_id?: string
          message_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatter_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatter_mentions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chatter_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chatter_messages: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["chatter_entity_type"]
          id: string
          is_system_message: boolean | null
          parent_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["chatter_entity_type"]
          id?: string
          is_system_message?: boolean | null
          parent_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["chatter_entity_type"]
          id?: string
          is_system_message?: boolean | null
          parent_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatter_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatter_messages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chatter_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatter_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "chatter_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_serials: {
        Row: {
          checkout_id: string
          created_at: string | null
          id: string
          return_condition: Database["public"]["Enums"]["item_condition"] | null
          serial_id: string
        }
        Insert: {
          checkout_id: string
          created_at?: string | null
          id?: string
          return_condition?:
            | Database["public"]["Enums"]["item_condition"]
            | null
          serial_id: string
        }
        Update: {
          checkout_id?: string
          created_at?: string | null
          id?: string
          return_condition?:
            | Database["public"]["Enums"]["item_condition"]
            | null
          serial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_serials_checkout_id_fkey"
            columns: ["checkout_id"]
            isOneToOne: false
            referencedRelation: "checkouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_serials_serial_id_fkey"
            columns: ["serial_id"]
            isOneToOne: false
            referencedRelation: "serial_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      checkouts: {
        Row: {
          assignee_id: string | null
          assignee_name: string | null
          assignee_type: Database["public"]["Enums"]["checkout_assignee_type"]
          checked_out_at: string
          checked_out_by: string | null
          created_at: string | null
          due_date: string | null
          id: string
          item_id: string
          notes: string | null
          quantity: number
          return_condition: Database["public"]["Enums"]["item_condition"] | null
          return_notes: string | null
          returned_at: string | null
          returned_by: string | null
          status: Database["public"]["Enums"]["checkout_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          assignee_name?: string | null
          assignee_type: Database["public"]["Enums"]["checkout_assignee_type"]
          checked_out_at?: string
          checked_out_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          item_id: string
          notes?: string | null
          quantity?: number
          return_condition?:
            | Database["public"]["Enums"]["item_condition"]
            | null
          return_notes?: string | null
          returned_at?: string | null
          returned_by?: string | null
          status?: Database["public"]["Enums"]["checkout_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          assignee_name?: string | null
          assignee_type?: Database["public"]["Enums"]["checkout_assignee_type"]
          checked_out_at?: string
          checked_out_by?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          return_condition?:
            | Database["public"]["Enums"]["item_condition"]
            | null
          return_notes?: string | null
          returned_at?: string | null
          returned_by?: string | null
          status?: Database["public"]["Enums"]["checkout_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkouts_checked_out_by_fkey"
            columns: ["checked_out_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_returned_by_fkey"
            columns: ["returned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkouts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "checkouts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          field_type: string
          id: string
          name: string
          options: Json | null
          required: boolean | null
          sort_order: number | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          field_type: string
          id?: string
          name: string
          options?: Json | null
          required?: boolean | null
          sort_order?: number | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          field_type?: string
          id?: string
          name?: string
          options?: Json | null
          required?: boolean | null
          sort_order?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "custom_field_definitions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_folders: {
        Row: {
          created_at: string | null
          custom_field_id: string
          folder_id: string
          id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          custom_field_id: string
          folder_id: string
          id?: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          custom_field_id?: string
          folder_id?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_folders_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_field_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_folders_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_field_folders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "custom_field_folders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_followers: {
        Row: {
          entity_id: string
          entity_type: Database["public"]["Enums"]["chatter_entity_type"]
          followed_at: string | null
          id: string
          notify_email: boolean | null
          notify_in_app: boolean | null
          notify_push: boolean | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          entity_id: string
          entity_type: Database["public"]["Enums"]["chatter_entity_type"]
          followed_at?: string | null
          id?: string
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_push?: boolean | null
          tenant_id: string
          user_id: string
        }
        Update: {
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["chatter_entity_type"]
          followed_at?: string | null
          id?: string
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_push?: boolean | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_followers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "entity_followers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_sequence_counters: {
        Row: {
          created_at: string | null
          current_value: number
          entity_type: string
          id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number
          entity_type: string
          id?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number
          entity_type?: string
          id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_sequence_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "entity_sequence_counters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_reminders: {
        Row: {
          comparison_operator:
            | Database["public"]["Enums"]["comparison_operator_enum"]
            | null
          created_at: string | null
          created_by: string
          days_before_expiry: number | null
          folder_id: string
          id: string
          last_triggered_at: string | null
          message: string | null
          next_trigger_at: string | null
          notify_email: boolean | null
          notify_in_app: boolean | null
          notify_user_ids: string[] | null
          recurrence:
            | Database["public"]["Enums"]["reminder_recurrence_enum"]
            | null
          recurrence_end_date: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type_enum"]
          scheduled_at: string | null
          status: Database["public"]["Enums"]["reminder_status_enum"] | null
          tenant_id: string
          threshold: number | null
          title: string | null
          trigger_count: number | null
          updated_at: string | null
        }
        Insert: {
          comparison_operator?:
            | Database["public"]["Enums"]["comparison_operator_enum"]
            | null
          created_at?: string | null
          created_by: string
          days_before_expiry?: number | null
          folder_id: string
          id?: string
          last_triggered_at?: string | null
          message?: string | null
          next_trigger_at?: string | null
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_user_ids?: string[] | null
          recurrence?:
            | Database["public"]["Enums"]["reminder_recurrence_enum"]
            | null
          recurrence_end_date?: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type_enum"]
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status_enum"] | null
          tenant_id: string
          threshold?: number | null
          title?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Update: {
          comparison_operator?:
            | Database["public"]["Enums"]["comparison_operator_enum"]
            | null
          created_at?: string | null
          created_by?: string
          days_before_expiry?: number | null
          folder_id?: string
          id?: string
          last_triggered_at?: string | null
          message?: string | null
          next_trigger_at?: string | null
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_user_ids?: string[] | null
          recurrence?:
            | Database["public"]["Enums"]["reminder_recurrence_enum"]
            | null
          recurrence_end_date?: string | null
          reminder_type?: Database["public"]["Enums"]["reminder_type_enum"]
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status_enum"] | null
          tenant_id?: string
          threshold?: number | null
          title?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folder_reminders_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_reminders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "folder_reminders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          depth: number | null
          display_id: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          path: string[] | null
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          depth?: number | null
          display_id?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          path?: string[] | null
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          depth?: number | null
          display_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          path?: string[] | null
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "folders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          barcode: string | null
          cost_price: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deleted_at: string | null
          description: string | null
          dimension_unit: string | null
          display_id: string | null
          embedding: string | null
          embedding_updated_at: string | null
          folder_id: string | null
          height: number | null
          id: string
          image_urls: string[] | null
          last_modified_by: string | null
          length: number | null
          location: string | null
          min_quantity: number | null
          name: string
          notes: string | null
          price: number | null
          qr_code: string | null
          quantity: number
          reorder_point: number | null
          reorder_quantity: number | null
          search_vector: unknown
          serial_number: string | null
          sku: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          tracking_mode: string | null
          unit: string | null
          updated_at: string | null
          weight: number | null
          weight_unit: string | null
          width: number | null
        }
        Insert: {
          barcode?: string | null
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          dimension_unit?: string | null
          display_id?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          folder_id?: string | null
          height?: number | null
          id?: string
          image_urls?: string[] | null
          last_modified_by?: string | null
          length?: number | null
          location?: string | null
          min_quantity?: number | null
          name: string
          notes?: string | null
          price?: number | null
          qr_code?: string | null
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          search_vector?: unknown
          serial_number?: string | null
          sku?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          tracking_mode?: string | null
          unit?: string | null
          updated_at?: string | null
          weight?: number | null
          weight_unit?: string | null
          width?: number | null
        }
        Update: {
          barcode?: string | null
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          dimension_unit?: string | null
          display_id?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          folder_id?: string | null
          height?: number | null
          id?: string
          image_urls?: string[] | null
          last_modified_by?: string | null
          length?: number | null
          location?: string | null
          min_quantity?: number | null
          name?: string
          notes?: string | null
          price?: number | null
          qr_code?: string | null
          quantity?: number
          reorder_point?: number | null
          reorder_quantity?: number | null
          search_vector?: unknown
          serial_number?: string | null
          sku?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          tracking_mode?: string | null
          unit?: string | null
          updated_at?: string | null
          weight?: number | null
          weight_unit?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      item_reminders: {
        Row: {
          comparison_operator:
            | Database["public"]["Enums"]["comparison_operator_enum"]
            | null
          created_at: string | null
          created_by: string | null
          days_before_expiry: number | null
          id: string
          item_id: string
          last_triggered_at: string | null
          message: string | null
          next_trigger_at: string | null
          notify_email: boolean | null
          notify_in_app: boolean | null
          notify_user_ids: string[] | null
          recurrence:
            | Database["public"]["Enums"]["reminder_recurrence_enum"]
            | null
          recurrence_end_date: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type_enum"]
          scheduled_at: string | null
          status: Database["public"]["Enums"]["reminder_status_enum"] | null
          tenant_id: string
          threshold: number | null
          title: string | null
          trigger_count: number | null
          updated_at: string | null
        }
        Insert: {
          comparison_operator?:
            | Database["public"]["Enums"]["comparison_operator_enum"]
            | null
          created_at?: string | null
          created_by?: string | null
          days_before_expiry?: number | null
          id?: string
          item_id: string
          last_triggered_at?: string | null
          message?: string | null
          next_trigger_at?: string | null
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_user_ids?: string[] | null
          recurrence?:
            | Database["public"]["Enums"]["reminder_recurrence_enum"]
            | null
          recurrence_end_date?: string | null
          reminder_type: Database["public"]["Enums"]["reminder_type_enum"]
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status_enum"] | null
          tenant_id: string
          threshold?: number | null
          title?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Update: {
          comparison_operator?:
            | Database["public"]["Enums"]["comparison_operator_enum"]
            | null
          created_at?: string | null
          created_by?: string | null
          days_before_expiry?: number | null
          id?: string
          item_id?: string
          last_triggered_at?: string | null
          message?: string | null
          next_trigger_at?: string | null
          notify_email?: boolean | null
          notify_in_app?: boolean | null
          notify_user_ids?: string[] | null
          recurrence?:
            | Database["public"]["Enums"]["reminder_recurrence_enum"]
            | null
          recurrence_end_date?: string | null
          reminder_type?: Database["public"]["Enums"]["reminder_type_enum"]
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status_enum"] | null
          tenant_id?: string
          threshold?: number | null
          title?: string | null
          trigger_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_reminders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_reminders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_reminders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_reminders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "item_reminders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      item_tags: {
        Row: {
          created_at: string | null
          created_by: string | null
          item_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          item_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          item_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      item_vendors: {
        Row: {
          created_at: string | null
          id: string
          is_preferred: boolean | null
          item_id: string
          last_ordered_at: string | null
          last_unit_cost: number | null
          lead_time_days: number | null
          min_order_qty: number | null
          notes: string | null
          pack_size: number | null
          priority: number | null
          tenant_id: string
          unit_cost: number | null
          updated_at: string | null
          vendor_id: string
          vendor_sku: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          item_id: string
          last_ordered_at?: string | null
          last_unit_cost?: number | null
          lead_time_days?: number | null
          min_order_qty?: number | null
          notes?: string | null
          pack_size?: number | null
          priority?: number | null
          tenant_id: string
          unit_cost?: number | null
          updated_at?: string | null
          vendor_id: string
          vendor_sku?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          item_id?: string
          last_ordered_at?: string | null
          last_unit_cost?: number | null
          lead_time_days?: number | null
          min_order_qty?: number | null
          notes?: string | null
          pack_size?: number | null
          priority?: number | null
          tenant_id?: string
          unit_cost?: number | null
          updated_at?: string | null
          vendor_id?: string
          vendor_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_vendors_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_vendors_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_vendors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "item_vendors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          start_date: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          start_date?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      location_stock: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          location_id: string
          min_quantity: number | null
          quantity: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          location_id: string
          min_quantity?: number | null
          quantity?: number
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          location_id?: string
          min_quantity?: number | null
          quantity?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_stock_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_stock_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "location_stock_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          batch_code: string | null
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: string
          item_id: string
          location_id: string | null
          lot_number: string | null
          manufactured_date: string | null
          notes: string | null
          quantity: number
          received_at: string | null
          status: Database["public"]["Enums"]["lot_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          batch_code?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          item_id: string
          location_id?: string | null
          lot_number?: string | null
          manufactured_date?: string | null
          notes?: string | null
          quantity?: number
          received_at?: string | null
          status?: Database["public"]["Enums"]["lot_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          batch_code?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string
          location_id?: string | null
          lot_number?: string | null
          manufactured_date?: string | null
          notes?: string | null
          quantity?: number
          received_at?: string | null
          status?: Database["public"]["Enums"]["lot_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
          notification_subtype: string | null
          notification_type: string
          read_at: string | null
          tenant_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_subtype?: string | null
          notification_type: string
          read_at?: string | null
          tenant_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          notification_subtype?: string | null
          notification_type?: string
          read_at?: string | null
          tenant_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_terms: {
        Row: {
          created_at: string | null
          days: number | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          sort_order: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days?: number | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          sort_order?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days?: number | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_terms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "payment_terms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_list_items: {
        Row: {
          id: string
          item_id: string
          notes: string | null
          pick_list_id: string
          picked_at: string | null
          picked_by: string | null
          picked_quantity: number | null
          requested_quantity: number
        }
        Insert: {
          id?: string
          item_id: string
          notes?: string | null
          pick_list_id: string
          picked_at?: string | null
          picked_by?: string | null
          picked_quantity?: number | null
          requested_quantity: number
        }
        Update: {
          id?: string
          item_id?: string
          notes?: string | null
          pick_list_id?: string
          picked_at?: string | null
          picked_by?: string | null
          picked_quantity?: number | null
          requested_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "pick_list_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_items_pick_list_id_fkey"
            columns: ["pick_list_id"]
            isOneToOne: false
            referencedRelation: "pick_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_items_picked_by_fkey"
            columns: ["picked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_lists: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          display_id: string | null
          due_date: string | null
          id: string
          item_outcome:
            | Database["public"]["Enums"]["pick_list_item_outcome"]
            | null
          name: string | null
          notes: string | null
          pick_list_number: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_country: string | null
          ship_to_name: string | null
          ship_to_postal_code: string | null
          ship_to_state: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          display_id?: string | null
          due_date?: string | null
          id?: string
          item_outcome?:
            | Database["public"]["Enums"]["pick_list_item_outcome"]
            | null
          name?: string | null
          notes?: string | null
          pick_list_number?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          display_id?: string | null
          due_date?: string | null
          id?: string
          item_outcome?:
            | Database["public"]["Enums"]["pick_list_item_outcome"]
            | null
          name?: string | null
          notes?: string | null
          pick_list_number?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pick_lists_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_lists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_lists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "pick_lists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_active_at: string | null
          onboarding_completed: boolean | null
          phone: string | null
          preferences: Json | null
          role: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_active_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          ordered_quantity: number
          part_number: string | null
          purchase_order_id: string
          received_quantity: number | null
          sku: string | null
          unit_price: number | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          ordered_quantity: number
          part_number?: string | null
          purchase_order_id: string
          received_quantity?: number | null
          sku?: string | null
          unit_price?: number | null
        }
        Update: {
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          ordered_quantity?: number
          part_number?: string | null
          purchase_order_id?: string
          received_quantity?: number | null
          sku?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bill_to_address1: string | null
          bill_to_address2: string | null
          bill_to_city: string | null
          bill_to_country: string | null
          bill_to_name: string | null
          bill_to_postal_code: string | null
          bill_to_state: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          display_id: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_number: string | null
          received_date: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_country: string | null
          ship_to_name: string | null
          ship_to_postal_code: string | null
          ship_to_state: string | null
          shipping: number | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          subtotal: number | null
          tax: number | null
          tenant_id: string
          total: number | null
          total_amount: number | null
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_country?: string | null
          bill_to_name?: string | null
          bill_to_postal_code?: string | null
          bill_to_state?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          display_id?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          received_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipping?: number | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          subtotal?: number | null
          tax?: number | null
          tenant_id: string
          total?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_country?: string | null
          bill_to_name?: string | null
          bill_to_postal_code?: string | null
          bill_to_state?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          display_id?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          received_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipping?: number | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          subtotal?: number | null
          tax?: number | null
          tenant_id?: string
          total?: number | null
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "purchase_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      receive_item_serials: {
        Row: {
          created_at: string | null
          id: string
          receive_item_id: string
          serial_number: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          receive_item_id: string
          serial_number: string
        }
        Update: {
          created_at?: string | null
          id?: string
          receive_item_id?: string
          serial_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "receive_item_serials_receive_item_id_fkey"
            columns: ["receive_item_id"]
            isOneToOne: false
            referencedRelation: "receive_items"
            referencedColumns: ["id"]
          },
        ]
      }
      receive_items: {
        Row: {
          batch_code: string | null
          condition: Database["public"]["Enums"]["receive_item_condition"]
          created_at: string | null
          expiry_date: string | null
          id: string
          item_id: string | null
          location_id: string | null
          lot_number: string | null
          manufactured_date: string | null
          notes: string | null
          purchase_order_item_id: string
          quantity_received: number
          receive_id: string
          updated_at: string | null
        }
        Insert: {
          batch_code?: string | null
          condition?: Database["public"]["Enums"]["receive_item_condition"]
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string | null
          location_id?: string | null
          lot_number?: string | null
          manufactured_date?: string | null
          notes?: string | null
          purchase_order_item_id: string
          quantity_received: number
          receive_id: string
          updated_at?: string | null
        }
        Update: {
          batch_code?: string | null
          condition?: Database["public"]["Enums"]["receive_item_condition"]
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string | null
          location_id?: string | null
          lot_number?: string | null
          manufactured_date?: string | null
          notes?: string | null
          purchase_order_item_id?: string
          quantity_received?: number
          receive_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receive_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_items_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receive_items_receive_id_fkey"
            columns: ["receive_id"]
            isOneToOne: false
            referencedRelation: "receives"
            referencedColumns: ["id"]
          },
        ]
      }
      receives: {
        Row: {
          cancelled_at: string | null
          carrier: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          default_location_id: string | null
          delivery_note_number: string | null
          display_id: string | null
          id: string
          notes: string | null
          purchase_order_id: string
          received_by: string | null
          received_date: string
          status: Database["public"]["Enums"]["receive_status"]
          tenant_id: string
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          cancelled_at?: string | null
          carrier?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          default_location_id?: string | null
          delivery_note_number?: string | null
          display_id?: string | null
          id?: string
          notes?: string | null
          purchase_order_id: string
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["receive_status"]
          tenant_id: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          cancelled_at?: string | null
          carrier?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          default_location_id?: string | null
          delivery_note_number?: string | null
          display_id?: string | null
          id?: string
          notes?: string | null
          purchase_order_id?: string
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["receive_status"]
          tenant_id?: string
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receives_default_location_id_fkey"
            columns: ["default_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receives_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receives_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receives_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "receives_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      serial_numbers: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string
          location_id: string | null
          notes: string | null
          serial_number: string
          status: Database["public"]["Enums"]["serial_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id: string
          location_id?: string | null
          notes?: string | null
          serial_number: string
          status?: Database["public"]["Enums"]["serial_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string
          location_id?: string | null
          notes?: string | null
          serial_number?: string
          status?: Database["public"]["Enums"]["serial_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serial_numbers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "serial_numbers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_count_items: {
        Row: {
          counted_at: string | null
          counted_by: string | null
          counted_quantity: number | null
          created_at: string | null
          expected_quantity: number
          id: string
          item_id: string
          status: Database["public"]["Enums"]["stock_count_item_status"]
          stock_count_id: string
          updated_at: string | null
          variance: number | null
          variance_notes: string | null
          variance_resolved: boolean | null
        }
        Insert: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string | null
          expected_quantity: number
          id?: string
          item_id: string
          status?: Database["public"]["Enums"]["stock_count_item_status"]
          stock_count_id: string
          updated_at?: string | null
          variance?: number | null
          variance_notes?: string | null
          variance_resolved?: boolean | null
        }
        Update: {
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string | null
          expected_quantity?: number
          id?: string
          item_id?: string
          status?: Database["public"]["Enums"]["stock_count_item_status"]
          stock_count_id?: string
          updated_at?: string | null
          variance?: number | null
          variance_notes?: string | null
          variance_resolved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_count_items_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_count_items_stock_count_id_fkey"
            columns: ["stock_count_id"]
            isOneToOne: false
            referencedRelation: "stock_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_counts: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          completed_at: string | null
          counted_items: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_id: string | null
          due_date: string | null
          id: string
          name: string | null
          notes: string | null
          scope_folder_id: string | null
          scope_type: Database["public"]["Enums"]["stock_count_scope_type"]
          started_at: string | null
          status: Database["public"]["Enums"]["stock_count_status"]
          tenant_id: string
          total_items: number | null
          updated_at: string | null
          variance_items: number | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          counted_items?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_id?: string | null
          due_date?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          scope_folder_id?: string | null
          scope_type?: Database["public"]["Enums"]["stock_count_scope_type"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["stock_count_status"]
          tenant_id: string
          total_items?: number | null
          updated_at?: string | null
          variance_items?: number | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          counted_items?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_id?: string | null
          due_date?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          scope_folder_id?: string | null
          scope_type?: Database["public"]["Enums"]["stock_count_scope_type"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["stock_count_status"]
          tenant_id?: string
          total_items?: number | null
          updated_at?: string | null
          variance_items?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_counts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_counts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_counts_scope_folder_id_fkey"
            columns: ["scope_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_counts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "stock_counts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          ai_suggestion_reason: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          from_location_id: string
          id: string
          is_ai_suggested: boolean | null
          item_id: string
          notes: string | null
          quantity: number
          requested_at: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["transfer_status"] | null
          tenant_id: string
          to_location_id: string
          updated_at: string | null
        }
        Insert: {
          ai_suggestion_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          from_location_id: string
          id?: string
          is_ai_suggested?: boolean | null
          item_id: string
          notes?: string | null
          quantity: number
          requested_at?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          tenant_id: string
          to_location_id: string
          updated_at?: string | null
        }
        Update: {
          ai_suggestion_reason?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          from_location_id?: string
          id?: string
          is_ai_suggested?: boolean | null
          item_id?: string
          notes?: string | null
          quantity?: number
          requested_at?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          tenant_id?: string
          to_location_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "stock_transfers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_plan_history: {
        Row: {
          changed_by_admin: string | null
          created_at: string | null
          effective_at: string | null
          id: string
          new_tier: string
          old_tier: string | null
          price_lock_until: string | null
          proration_applied: boolean | null
          reason: string | null
          tenant_id: string
        }
        Insert: {
          changed_by_admin?: string | null
          created_at?: string | null
          effective_at?: string | null
          id?: string
          new_tier: string
          old_tier?: string | null
          price_lock_until?: string | null
          proration_applied?: boolean | null
          reason?: string | null
          tenant_id: string
        }
        Update: {
          changed_by_admin?: string | null
          created_at?: string | null
          effective_at?: string | null
          id?: string
          new_tier?: string
          old_tier?: string | null
          price_lock_until?: string | null
          proration_applied?: boolean | null
          reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_plan_history_changed_by_admin_fkey"
            columns: ["changed_by_admin"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_plan_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tenant_plan_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          max_items: number | null
          max_users: number | null
          name: string
          org_code: string
          primary_color: string | null
          settings: Json | null
          slug: string
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_items?: number | null
          max_users?: number | null
          name: string
          org_code: string
          primary_color?: string | null
          settings?: Json | null
          slug: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_items?: number | null
          max_users?: number | null
          name?: string
          org_code?: string
          primary_color?: string | null
          settings?: Json | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          payment_term_id: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          payment_term_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          payment_term_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_payment_term_id_fkey"
            columns: ["payment_term_id"]
            isOneToOne: false
            referencedRelation: "payment_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "vendors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      all_activity_logs: {
        Row: {
          action_type: string | null
          changes: Json | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          from_folder_id: string | null
          from_folder_name: string | null
          id: string | null
          ip_address: unknown
          is_archived: boolean | null
          quantity_after: number | null
          quantity_before: number | null
          quantity_delta: number | null
          tenant_id: string | null
          to_folder_id: string | null
          to_folder_name: string | null
          user_agent: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
      items_with_tags: {
        Row: {
          barcode: string | null
          cost_price: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deleted_at: string | null
          description: string | null
          dimension_unit: string | null
          embedding: string | null
          embedding_updated_at: string | null
          folder_id: string | null
          height: number | null
          id: string | null
          image_urls: string[] | null
          last_modified_by: string | null
          length: number | null
          location: string | null
          min_quantity: number | null
          name: string | null
          notes: string | null
          price: number | null
          qr_code: string | null
          quantity: number | null
          search_vector: unknown
          serial_number: string | null
          sku: string | null
          status: string | null
          tag_list: Json[] | null
          tags: string[] | null
          tenant_id: string | null
          tracking_mode: string | null
          unit: string | null
          updated_at: string | null
          weight: number | null
          weight_unit: string | null
          width: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_last_modified_by_fkey"
            columns: ["last_modified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_stats: {
        Row: {
          folder_count: number | null
          in_stock_count: number | null
          last_activity: string | null
          last_item_update: string | null
          low_stock_count: number | null
          out_of_stock_count: number | null
          refreshed_at: string | null
          subscription_tier: string | null
          tag_count: number | null
          team_size: number | null
          tenant_id: string | null
          tenant_name: string | null
          total_inventory_value: number | null
          total_items: number | null
          total_quantity: number | null
          vendor_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_receive_item: {
        Args: {
          p_batch_code?: string
          p_condition?: Database["public"]["Enums"]["receive_item_condition"]
          p_expiry_date?: string
          p_location_id?: string
          p_lot_number?: string
          p_manufactured_date?: string
          p_notes?: string
          p_purchase_order_item_id: string
          p_quantity_received: number
          p_receive_id: string
        }
        Returns: Json
      }
      add_tags_to_item: {
        Args: { p_item_id: string; p_tag_ids: string[] }
        Returns: number
      }
      archive_old_activity_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      batch_create_items: { Args: { p_items: Json }; Returns: Json }
      bulk_adjust_quantities: { Args: { adjustments: Json }; Returns: Json }
      bulk_delete_items: { Args: { item_ids: string[] }; Returns: Json }
      bulk_import_items: {
        Args: { p_items: Json; p_options?: Json }
        Returns: Json
      }
      bulk_move_items: {
        Args: { item_ids: string[]; target_folder_id: string }
        Returns: Json
      }
      bulk_restore_items: { Args: { item_ids: string[] }; Returns: Json }
      can_edit: { Args: never; Returns: boolean }
      cancel_receive: { Args: { p_receive_id: string }; Returns: Json }
      cancel_stock_count: { Args: { p_stock_count_id: string }; Returns: Json }
      check_subscription_limits: {
        Args: never
        Returns: {
          current_usage: number
          is_exceeded: boolean
          max_allowed: number
          resource_type: string
        }[]
      }
      checkout_with_serials: {
        Args: {
          p_assignee_id?: string
          p_assignee_name?: string
          p_assignee_type: Database["public"]["Enums"]["checkout_assignee_type"]
          p_due_date?: string
          p_item_id: string
          p_notes?: string
          p_serial_ids: string[]
        }
        Returns: Json
      }
      complete_pick_list: { Args: { p_pick_list_id: string }; Returns: Json }
      complete_receive: { Args: { p_receive_id: string }; Returns: Json }
      complete_stock_count: {
        Args: { p_apply_adjustments?: boolean; p_stock_count_id: string }
        Returns: Json
      }
      create_bulk_item_reminders: {
        Args: {
          p_comparison_operator?: string
          p_days_before_expiry?: number
          p_item_ids: string[]
          p_message?: string
          p_notify_email?: boolean
          p_notify_in_app?: boolean
          p_notify_user_ids?: string[]
          p_recurrence?: string
          p_recurrence_end_date?: string
          p_reminder_type: string
          p_scheduled_at?: string
          p_threshold?: number
          p_title?: string
        }
        Returns: Json
      }
      create_folder_reminder: {
        Args: {
          p_comparison_operator?: string
          p_days_before_expiry?: number
          p_folder_id: string
          p_message?: string
          p_notify_email?: boolean
          p_notify_in_app?: boolean
          p_notify_user_ids?: string[]
          p_recurrence?: string
          p_recurrence_end_date?: string
          p_reminder_type: string
          p_scheduled_at?: string
          p_threshold?: number
          p_title?: string
        }
        Returns: Json
      }
      create_folder_v2: {
        Args: {
          p_color?: string
          p_icon?: string
          p_name: string
          p_parent_id?: string
        }
        Returns: Json
      }
      create_inventory_item_v2: {
        Args: {
          p_barcode?: string
          p_cost_price?: number
          p_currency?: string
          p_custom_fields?: Json
          p_description?: string
          p_folder_id?: string
          p_image_urls?: string[]
          p_min_quantity?: number
          p_name: string
          p_notes?: string
          p_price?: number
          p_quantity?: number
          p_serial_number?: string
          p_sku?: string
          p_tags?: string[]
          p_unit?: string
        }
        Returns: Json
      }
      create_item_reminder:
        | {
            Args: {
              p_days_before_expiry?: number
              p_item_id: string
              p_message?: string
              p_notify_email?: boolean
              p_notify_in_app?: boolean
              p_notify_user_ids?: string[]
              p_recurrence?: string
              p_recurrence_end_date?: string
              p_reminder_type: string
              p_scheduled_at?: string
              p_threshold?: number
              p_title?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_comparison_operator?: string
              p_days_before_expiry?: number
              p_item_id: string
              p_message?: string
              p_notify_email?: boolean
              p_notify_in_app?: boolean
              p_notify_user_ids?: string[]
              p_recurrence?: string
              p_recurrence_end_date?: string
              p_reminder_type: string
              p_scheduled_at?: string
              p_threshold?: number
              p_title?: string
            }
            Returns: Json
          }
      create_item_with_tags: {
        Args: { p_item: Json; p_tag_ids?: string[] }
        Returns: Json
      }
      create_job: {
        Args: {
          p_description?: string
          p_end_date?: string
          p_location?: string
          p_name: string
          p_start_date?: string
        }
        Returns: Json
      }
      create_pick_list_v2: {
        Args: {
          p_assigned_to?: string
          p_due_date?: string
          p_item_outcome?: string
          p_items?: Json
          p_name?: string
          p_notes?: string
          p_ship_to_address1?: string
          p_ship_to_address2?: string
          p_ship_to_city?: string
          p_ship_to_country?: string
          p_ship_to_name?: string
          p_ship_to_postal_code?: string
          p_ship_to_state?: string
        }
        Returns: Json
      }
      create_pick_list_with_items: {
        Args: {
          p_assigned_to?: string
          p_due_date?: string
          p_item_outcome?: Database["public"]["Enums"]["pick_list_item_outcome"]
          p_items?: Json
          p_name: string
          p_notes?: string
          p_ship_to_address1?: string
          p_ship_to_address2?: string
          p_ship_to_city?: string
          p_ship_to_country?: string
          p_ship_to_name?: string
          p_ship_to_postal_code?: string
          p_ship_to_state?: string
        }
        Returns: Json
      }
      create_po_from_suggestions: {
        Args: { p_item_suggestions: Json; p_vendor_id: string }
        Returns: Json
      }
      create_purchase_order_v2: {
        Args: {
          p_bill_to_address1?: string
          p_bill_to_address2?: string
          p_bill_to_city?: string
          p_bill_to_country?: string
          p_bill_to_name?: string
          p_bill_to_postal_code?: string
          p_bill_to_state?: string
          p_currency?: string
          p_expected_date?: string
          p_items?: Json
          p_notes?: string
          p_ship_to_address1?: string
          p_ship_to_address2?: string
          p_ship_to_city?: string
          p_ship_to_country?: string
          p_ship_to_name?: string
          p_ship_to_postal_code?: string
          p_ship_to_state?: string
          p_vendor_id?: string
        }
        Returns: Json
      }
      create_receive: {
        Args: {
          p_carrier?: string
          p_default_location_id?: string
          p_delivery_note_number?: string
          p_notes?: string
          p_purchase_order_id: string
          p_tracking_number?: string
        }
        Returns: Json
      }
      create_receive_with_items: {
        Args: {
          p_carrier?: string
          p_default_location_id?: string
          p_delivery_note_number?: string
          p_notes?: string
          p_purchase_order_id: string
          p_tracking_number?: string
        }
        Returns: Json
      }
      create_stock_count: {
        Args: {
          p_assigned_to?: string
          p_description?: string
          p_due_date?: string
          p_name?: string
          p_notes?: string
          p_scope_folder_id?: string
          p_scope_type?: Database["public"]["Enums"]["stock_count_scope_type"]
        }
        Returns: Json
      }
      delete_item_reminder: { Args: { p_reminder_id: string }; Returns: Json }
      delete_reminder: {
        Args: { p_reminder_id: string; p_source_type: string }
        Returns: Json
      }
      export_inventory_data: {
        Args: { p_folder_id?: string; p_format?: string }
        Returns: Json
      }
      find_similar_items: {
        Args: { p_item_id: string; p_limit?: number }
        Returns: {
          id: string
          name: string
          similarity: number
          sku: string
        }[]
      }
      generate_display_id: {
        Args: { p_entity_type: string; p_tenant_id: string }
        Returns: string
      }
      generate_display_id_for_current_user: {
        Args: { p_entity_type: string }
        Returns: string
      }
      generate_org_code: { Args: { p_company_name: string }; Returns: string }
      get_active_checkout: { Args: { p_item_id: string }; Returns: Json }
      get_activity_logs: {
        Args: {
          p_action_type?: string
          p_entity_id?: string
          p_entity_type?: string
          p_from_date?: string
          p_include_archived?: boolean
          p_limit?: number
          p_offset?: number
          p_to_date?: string
        }
        Returns: {
          action_type: string
          changes: Json
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          is_archived: boolean
          quantity_delta: number
          user_id: string
          user_name: string
        }[]
      }
      get_activity_logs_count: {
        Args: {
          p_action_type?: string
          p_entity_id?: string
          p_entity_type?: string
          p_from_date?: string
          p_include_archived?: boolean
          p_to_date?: string
        }
        Returns: number
      }
      get_admin_role: { Args: { p_user_id: string }; Returns: string }
      get_all_reminders: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_status?: string
          p_type?: string
        }
        Returns: Json
      }
      get_checkout_serials: { Args: { p_checkout_id: string }; Returns: Json }
      get_checkouts: {
        Args: {
          p_assignee_type?: string
          p_limit?: number
          p_offset?: number
          p_overdue_only?: boolean
          p_status?: string
        }
        Returns: Json
      }
      get_current_user_profile: {
        Args: never
        Returns: {
          email: string
          full_name: string
          role: string
          tenant_id: string
          user_id: string
        }[]
      }
      get_dashboard_data: { Args: never; Returns: Json }
      get_due_reminders: {
        Args: never
        Returns: {
          created_by: string
          days_before_expiry: number
          id: string
          item_id: string
          item_name: string
          message: string
          notify_email: boolean
          notify_in_app: boolean
          notify_user_ids: string[]
          recurrence: Database["public"]["Enums"]["reminder_recurrence_enum"]
          recurrence_end_date: string
          reminder_type: Database["public"]["Enums"]["reminder_type_enum"]
          scheduled_at: string
          tenant_id: string
          threshold: number
          title: string
          trigger_count: number
        }[]
      }
      get_entity_by_display_id: {
        Args: { p_display_id: string }
        Returns: Json
      }
      get_entity_followers: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["chatter_entity_type"]
        }
        Returns: {
          followed_at: string
          notify_email: boolean
          notify_in_app: boolean
          notify_push: boolean
          user_avatar: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_entity_messages: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["chatter_entity_type"]
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          author_avatar: string
          author_email: string
          author_id: string
          author_name: string
          content: string
          created_at: string
          edited_at: string
          id: string
          is_system_message: boolean
          mentions: Json
          parent_id: string
          reply_count: number
        }[]
      }
      get_folder_stats: {
        Args: never
        Returns: {
          folder_color: string
          folder_id: string
          folder_name: string
          item_count: number
          low_stock_count: number
          total_value: number
        }[]
      }
      get_inventory_list: {
        Args: {
          p_folder_id?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_sort_by?: string
          p_sort_dir?: string
          p_status?: string
        }
        Returns: Json
      }
      get_item_checkout_history: {
        Args: { p_item_id: string; p_limit?: number }
        Returns: Json
      }
      get_item_details: { Args: { p_item_id: string }; Returns: Json }
      get_item_locations: {
        Args: { p_item_id: string }
        Returns: {
          location_id: string
          location_name: string
          location_type: Database["public"]["Enums"]["location_type"]
          min_quantity: number
          quantity: number
          status: string
        }[]
      }
      get_item_reminders: { Args: { p_item_id: string }; Returns: Json }
      get_item_serials: {
        Args: { p_include_unavailable?: boolean; p_item_id: string }
        Returns: Json
      }
      get_item_tags: {
        Args: { p_item_id: string }
        Returns: {
          color: string
          id: string
          name: string
        }[]
      }
      get_item_vendors: { Args: { p_item_id: string }; Returns: Json }
      get_items_by_tag: {
        Args: { p_tag_id: string }
        Returns: {
          id: string
          name: string
          quantity: number
          sku: string
          status: string
        }[]
      }
      get_items_needing_embeddings: {
        Args: { p_limit?: number }
        Returns: {
          description: string
          id: string
          name: string
          sku: string
        }[]
      }
      get_jobs: { Args: { p_limit?: number; p_status?: string }; Returns: Json }
      get_letter_prefix: { Args: { p_sequence: number }; Returns: string }
      get_message_replies: {
        Args: { p_limit?: number; p_message_id: string }
        Returns: {
          author_avatar: string
          author_email: string
          author_id: string
          author_name: string
          content: string
          created_at: string
          edited_at: string
          id: string
          is_system_message: boolean
          mentions: Json
          parent_id: string
        }[]
      }
      get_my_checkouts: { Args: never; Returns: Json }
      get_my_tenant_stats: {
        Args: { force_refresh?: boolean }
        Returns: {
          folder_count: number
          in_stock_count: number
          last_activity: string
          last_item_update: string
          low_stock_count: number
          out_of_stock_count: number
          refreshed_at: string
          subscription_tier: string
          tag_count: number
          team_size: number
          tenant_id: string
          tenant_name: string
          total_inventory_value: number
          total_items: number
          total_quantity: number
          vendor_count: number
        }[]
      }
      get_my_tenant_stats_realtime: { Args: never; Returns: Json }
      get_next_entity_number: {
        Args: { p_entity_type: string; p_tenant_id: string }
        Returns: number
      }
      get_overdue_summary: { Args: never; Returns: Json }
      get_payment_terms_with_usage: {
        Args: never
        Returns: {
          days: number
          description: string
          id: string
          name: string
          sort_order: number
          usage_count: number
        }[]
      }
      get_pick_list_with_items: {
        Args: { p_pick_list_id: string }
        Returns: Json
      }
      get_po_receives: { Args: { p_purchase_order_id: string }; Returns: Json }
      get_quota_usage: {
        Args: never
        Returns: {
          current_usage: number
          is_exceeded: boolean
          is_warning: boolean
          max_allowed: number
          resource_type: string
          usage_percent: number
        }[]
      }
      get_receive_with_items: { Args: { p_receive_id: string }; Returns: Json }
      get_recent_activity_summary: {
        Args: { p_days?: number }
        Returns: {
          action_type: string
          count: number
          date: string
        }[]
      }
      get_reminder_stats: { Args: never; Returns: Json }
      get_reorder_suggestions: {
        Args: { p_include_without_vendor?: boolean }
        Returns: Json
      }
      get_reorder_suggestions_by_vendor: { Args: never; Returns: Json }
      get_reorder_suggestions_count: { Args: never; Returns: number }
      get_status_distribution: {
        Args: never
        Returns: {
          count: number
          percentage: number
          status: string
        }[]
      }
      get_stock_count_with_items: {
        Args: { p_stock_count_id: string }
        Returns: Json
      }
      get_tag_stats: {
        Args: never
        Returns: {
          item_count: number
          tag_color: string
          tag_id: string
          tag_name: string
        }[]
      }
      get_team_members_for_mention: {
        Args: { p_limit?: number; p_search_query?: string }
        Returns: {
          user_avatar: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_tenant_org_code: { Args: never; Returns: Json }
      get_trial_days_remaining: { Args: { tenant_id: string }; Returns: number }
      get_unread_mentions_count: { Args: never; Returns: number }
      get_user_tenant_id: { Args: never; Returns: string }
      is_account_paused: { Args: { tenant_id: string }; Returns: boolean }
      is_admin_feature_enabled: {
        Args: { p_flag_name: string }
        Returns: boolean
      }
      is_admin_or_owner: { Args: never; Returns: boolean }
      is_admin_user: { Args: { p_user_id: string }; Returns: boolean }
      is_following_entity: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["chatter_entity_type"]
        }
        Returns: boolean
      }
      is_in_grace_period: { Args: { tenant_id: string }; Returns: boolean }
      is_trial_active: { Args: { tenant_id: string }; Returns: boolean }
      link_item_to_vendor: {
        Args: {
          p_is_preferred?: boolean
          p_item_id: string
          p_lead_time_days?: number
          p_min_order_qty?: number
          p_notes?: string
          p_pack_size?: number
          p_unit_cost?: number
          p_vendor_id: string
          p_vendor_sku?: string
        }
        Returns: Json
      }
      log_activity: {
        Args: {
          p_action_type: string
          p_changes?: Json
          p_entity_id: string
          p_entity_name: string
          p_entity_type: string
          p_from_folder_id?: string
          p_quantity_after?: number
          p_quantity_before?: number
          p_quantity_delta?: number
          p_to_folder_id?: string
        }
        Returns: string
      }
      log_admin_action: {
        Args: {
          p_action_category: string
          p_action_type: string
          p_admin_email: string
          p_admin_user_id: string
          p_ip_address?: unknown
          p_reason?: string
          p_state_after?: Json
          p_state_before?: Json
          p_target_id?: string
          p_target_tenant_id?: string
          p_target_type?: string
          p_user_agent?: string
        }
        Returns: string
      }
      mark_mentions_read: { Args: { p_message_ids: string[] }; Returns: number }
      perform_checkin: {
        Args: {
          p_checkout_id: string
          p_condition?: Database["public"]["Enums"]["item_condition"]
          p_notes?: string
        }
        Returns: Json
      }
      perform_checkout: {
        Args: {
          p_assignee_id?: string
          p_assignee_name?: string
          p_assignee_type?: Database["public"]["Enums"]["checkout_assignee_type"]
          p_due_date?: string
          p_item_id: string
          p_notes?: string
          p_quantity?: number
        }
        Returns: Json
      }
      pick_pick_list_item: {
        Args: { p_pick_list_item_id: string; p_picked_quantity: number }
        Returns: Json
      }
      post_chatter_message: {
        Args: {
          p_content: string
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["chatter_entity_type"]
          p_mentioned_user_ids?: string[]
          p_parent_id?: string
        }
        Returns: string
      }
      process_reminder_trigger: {
        Args: { p_mark_triggered?: boolean; p_reminder_id: string }
        Returns: Json
      }
      purge_old_archives: { Args: { retention_days?: number }; Returns: number }
      record_stock_count: {
        Args: {
          p_counted_quantity: number
          p_notes?: string
          p_stock_count_item_id: string
        }
        Returns: Json
      }
      refresh_all_tenant_stats: { Args: never; Returns: undefined }
      remove_receive_item: {
        Args: { p_receive_item_id: string }
        Returns: Json
      }
      remove_tags_from_item: {
        Args: { p_item_id: string; p_tag_ids: string[] }
        Returns: number
      }
      return_checkout_serials: {
        Args: {
          p_checkout_id: string
          p_notes?: string
          p_serial_returns: Json
        }
        Returns: Json
      }
      search_by_display_id: {
        Args: { p_entity_types?: string[]; p_limit?: number; p_query: string }
        Returns: Json
      }
      search_items_fulltext: {
        Args: { p_folder_id?: string; p_limit?: number; search_query: string }
        Returns: {
          description: string
          id: string
          name: string
          quantity: number
          rank: number
          sku: string
          status: string
        }[]
      }
      search_items_hybrid: {
        Args: {
          fulltext_weight?: number
          p_limit?: number
          query_embedding?: string
          search_query: string
          semantic_weight?: number
        }
        Returns: {
          combined_score: number
          description: string
          fulltext_score: number
          id: string
          name: string
          quantity: number
          semantic_score: number
          sku: string
          status: string
        }[]
      }
      search_items_semantic: {
        Args: {
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          description: string
          id: string
          name: string
          quantity: number
          similarity: number
          sku: string
          status: string
        }[]
      }
      seed_default_payment_terms: {
        Args: { p_tenant_id: string }
        Returns: number
      }
      set_item_tags: {
        Args: { p_item_id: string; p_tag_ids: string[] }
        Returns: number
      }
      set_tenant_context: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      start_stock_count: { Args: { p_stock_count_id: string }; Returns: Json }
      submit_stock_count_for_review: {
        Args: { p_stock_count_id: string }
        Returns: Json
      }
      toggle_reminder: {
        Args: { p_reminder_id: string; p_source_type: string }
        Returns: Json
      }
      toggle_reminder_status: { Args: { p_reminder_id: string }; Returns: Json }
      update_item_embedding: {
        Args: { p_embedding: string; p_item_id: string }
        Returns: boolean
      }
      update_item_reminder: {
        Args: {
          p_days_before_expiry?: number
          p_message?: string
          p_notify_email?: boolean
          p_notify_in_app?: boolean
          p_recurrence?: string
          p_recurrence_end_date?: string
          p_reminder_id: string
          p_scheduled_at?: string
          p_status?: string
          p_threshold?: number
          p_title?: string
        }
        Returns: Json
      }
      update_item_with_tags: {
        Args: { p_item_id: string; p_tag_ids?: string[]; p_updates: Json }
        Returns: Json
      }
      update_overdue_checkouts: { Args: never; Returns: number }
      update_receive_item: {
        Args: {
          p_batch_code?: string
          p_condition?: Database["public"]["Enums"]["receive_item_condition"]
          p_expiry_date?: string
          p_location_id?: string
          p_lot_number?: string
          p_manufactured_date?: string
          p_notes?: string
          p_quantity_received?: number
          p_receive_item_id: string
        }
        Returns: Json
      }
      update_reminder: {
        Args: {
          p_comparison_operator?: string
          p_days_before_expiry?: number
          p_message?: string
          p_notify_email?: boolean
          p_notify_in_app?: boolean
          p_recurrence?: string
          p_recurrence_end_date?: string
          p_reminder_id: string
          p_scheduled_at?: string
          p_source_type: string
          p_threshold?: number
          p_title?: string
        }
        Returns: Json
      }
      upsert_item_serials: {
        Args: { p_item_id: string; p_serials: string[] }
        Returns: Json
      }
      user_has_role: { Args: { required_roles: string[] }; Returns: boolean }
      validate_item_status: { Args: { status: string }; Returns: boolean }
      validate_pick_list_status: { Args: { status: string }; Returns: boolean }
      validate_po_status: { Args: { status: string }; Returns: boolean }
      validate_tenant_access: {
        Args: { check_tenant_id: string }
        Returns: boolean
      }
      validate_user_role: { Args: { role: string }; Returns: boolean }
    }
    Enums: {
      activity_action_enum:
        | "create"
        | "update"
        | "delete"
        | "restore"
        | "adjust_quantity"
        | "move"
        | "archive"
        | "login"
        | "logout"
        | "export"
        | "import"
        | "bulk_update"
        | "assign"
        | "complete"
      alert_type_enum:
        | "low_stock"
        | "out_of_stock"
        | "expiring_soon"
        | "reorder_point"
        | "custom"
      chatter_entity_type:
        | "item"
        | "checkout"
        | "stock_count"
        | "purchase_order"
        | "pick_list"
        | "receive"
      checkout_assignee_type: "person" | "job" | "location"
      checkout_status: "checked_out" | "returned" | "overdue"
      comparison_operator_enum: "lte" | "lt" | "gt" | "gte" | "eq"
      entity_type_enum:
        | "item"
        | "folder"
        | "tag"
        | "pick_list"
        | "purchase_order"
        | "vendor"
        | "address"
        | "profile"
        | "tenant"
        | "alert"
        | "notification"
      field_type_enum:
        | "text"
        | "number"
        | "date"
        | "datetime"
        | "boolean"
        | "select"
        | "multi_select"
        | "url"
        | "email"
        | "phone"
        | "currency"
        | "percentage"
      item_condition: "good" | "damaged" | "needs_repair" | "lost"
      item_status_enum: "in_stock" | "low_stock" | "out_of_stock"
      location_type: "warehouse" | "van" | "store" | "job_site"
      lot_status: "active" | "expired" | "depleted" | "blocked"
      notification_type_enum:
        | "low_stock"
        | "out_of_stock"
        | "order_update"
        | "pick_list_assigned"
        | "system"
        | "team"
        | "alert"
        | "welcome"
        | "reminder_low_stock"
        | "reminder_expiry"
        | "reminder_restock"
      pick_list_item_outcome: "decrement" | "checkout" | "transfer"
      pick_list_status_enum: "draft" | "in_progress" | "completed" | "cancelled"
      po_status_enum:
        | "draft"
        | "submitted"
        | "confirmed"
        | "partial"
        | "received"
        | "cancelled"
      receive_item_condition: "good" | "damaged" | "rejected"
      receive_status: "draft" | "completed" | "cancelled"
      reminder_recurrence_enum: "once" | "daily" | "weekly" | "monthly"
      reminder_status_enum: "active" | "paused" | "triggered" | "expired"
      reminder_type_enum: "low_stock" | "expiry" | "restock"
      serial_status:
        | "available"
        | "checked_out"
        | "sold"
        | "damaged"
        | "returned"
      stock_count_item_status: "pending" | "counted" | "verified" | "adjusted"
      stock_count_scope_type: "full" | "folder" | "custom"
      stock_count_status:
        | "draft"
        | "in_progress"
        | "review"
        | "completed"
        | "cancelled"
      subscription_status_enum:
        | "active"
        | "trial"
        | "past_due"
        | "cancelled"
        | "suspended"
      subscription_tier_enum: "free" | "starter" | "professional" | "enterprise"
      transfer_status: "pending" | "in_transit" | "completed" | "cancelled"
      user_role_enum: "owner" | "admin" | "editor" | "viewer" | "member"
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
      activity_action_enum: [
        "create",
        "update",
        "delete",
        "restore",
        "adjust_quantity",
        "move",
        "archive",
        "login",
        "logout",
        "export",
        "import",
        "bulk_update",
        "assign",
        "complete",
      ],
      alert_type_enum: [
        "low_stock",
        "out_of_stock",
        "expiring_soon",
        "reorder_point",
        "custom",
      ],
      chatter_entity_type: [
        "item",
        "checkout",
        "stock_count",
        "purchase_order",
        "pick_list",
        "receive",
      ],
      checkout_assignee_type: ["person", "job", "location"],
      checkout_status: ["checked_out", "returned", "overdue"],
      comparison_operator_enum: ["lte", "lt", "gt", "gte", "eq"],
      entity_type_enum: [
        "item",
        "folder",
        "tag",
        "pick_list",
        "purchase_order",
        "vendor",
        "address",
        "profile",
        "tenant",
        "alert",
        "notification",
      ],
      field_type_enum: [
        "text",
        "number",
        "date",
        "datetime",
        "boolean",
        "select",
        "multi_select",
        "url",
        "email",
        "phone",
        "currency",
        "percentage",
      ],
      item_condition: ["good", "damaged", "needs_repair", "lost"],
      item_status_enum: ["in_stock", "low_stock", "out_of_stock"],
      location_type: ["warehouse", "van", "store", "job_site"],
      lot_status: ["active", "expired", "depleted", "blocked"],
      notification_type_enum: [
        "low_stock",
        "out_of_stock",
        "order_update",
        "pick_list_assigned",
        "system",
        "team",
        "alert",
        "welcome",
        "reminder_low_stock",
        "reminder_expiry",
        "reminder_restock",
      ],
      pick_list_item_outcome: ["decrement", "checkout", "transfer"],
      pick_list_status_enum: ["draft", "in_progress", "completed", "cancelled"],
      po_status_enum: [
        "draft",
        "submitted",
        "confirmed",
        "partial",
        "received",
        "cancelled",
      ],
      receive_item_condition: ["good", "damaged", "rejected"],
      receive_status: ["draft", "completed", "cancelled"],
      reminder_recurrence_enum: ["once", "daily", "weekly", "monthly"],
      reminder_status_enum: ["active", "paused", "triggered", "expired"],
      reminder_type_enum: ["low_stock", "expiry", "restock"],
      serial_status: [
        "available",
        "checked_out",
        "sold",
        "damaged",
        "returned",
      ],
      stock_count_item_status: ["pending", "counted", "verified", "adjusted"],
      stock_count_scope_type: ["full", "folder", "custom"],
      stock_count_status: [
        "draft",
        "in_progress",
        "review",
        "completed",
        "cancelled",
      ],
      subscription_status_enum: [
        "active",
        "trial",
        "past_due",
        "cancelled",
        "suspended",
      ],
      subscription_tier_enum: ["free", "starter", "professional", "enterprise"],
      transfer_status: ["pending", "in_transit", "completed", "cancelled"],
      user_role_enum: ["owner", "admin", "editor", "viewer", "member"],
    },
  },
} as const

