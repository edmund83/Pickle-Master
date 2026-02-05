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
      ai_usage_limits: {
        Row: {
          created_at: string | null
          id: string
          monthly_limit_usd: number
          tenant_id: string
          updated_at: string | null
          user_id: string
          warning_threshold: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          monthly_limit_usd?: number
          tenant_id: string
          updated_at?: string | null
          user_id: string
          warning_threshold?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          monthly_limit_usd?: number
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
          warning_threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "ai_usage_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_tracking: {
        Row: {
          cost_usd: number
          created_at: string | null
          id: string
          input_tokens: number
          model_name: string | null
          operation: string
          output_tokens: number
          period_start: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          cost_usd?: number
          created_at?: string | null
          id?: string
          input_tokens?: number
          model_name?: string | null
          operation?: string
          output_tokens?: number
          period_start?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          cost_usd?: number
          created_at?: string | null
          id?: string
          input_tokens?: number
          model_name?: string | null
          operation?: string
          output_tokens?: number
          period_start?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "ai_usage_tracking_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      contacts: {
        Row: {
          company: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          id_number: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "contacts_tenant_id_fkey"
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
      customers: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_postal_code: string | null
          billing_state: string | null
          contact_name: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          customer_code: string | null
          default_tax_rate_id: string | null
          display_id: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_tax_exempt: boolean | null
          name: string
          notes: string | null
          payment_term_id: string | null
          phone: string | null
          shipping_address_line1: string | null
          shipping_address_line2: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_postal_code: string | null
          shipping_same_as_billing: boolean | null
          shipping_state: string | null
          tax_exemption_reason: string | null
          tax_id: string | null
          tax_id_label: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          customer_code?: string | null
          default_tax_rate_id?: string | null
          display_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_tax_exempt?: boolean | null
          name: string
          notes?: string | null
          payment_term_id?: string | null
          phone?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_same_as_billing?: boolean | null
          shipping_state?: string | null
          tax_exemption_reason?: string | null
          tax_id?: string | null
          tax_id_label?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_postal_code?: string | null
          billing_state?: string | null
          contact_name?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          customer_code?: string | null
          default_tax_rate_id?: string | null
          display_id?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_tax_exempt?: boolean | null
          name?: string
          notes?: string | null
          payment_term_id?: string | null
          phone?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_same_as_billing?: boolean | null
          shipping_state?: string | null
          tax_exemption_reason?: string | null
          tax_id?: string | null
          tax_id_label?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_default_tax_rate_id_fkey"
            columns: ["default_tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_payment_term_id_fkey"
            columns: ["payment_term_id"]
            isOneToOne: false
            referencedRelation: "payment_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_order_item_serials: {
        Row: {
          created_at: string | null
          delivery_order_item_id: string
          id: string
          lot_id: string | null
          quantity: number | null
          serial_number: string
        }
        Insert: {
          created_at?: string | null
          delivery_order_item_id: string
          id?: string
          lot_id?: string | null
          quantity?: number | null
          serial_number: string
        }
        Update: {
          created_at?: string | null
          delivery_order_item_id?: string
          id?: string
          lot_id?: string | null
          quantity?: number | null
          serial_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_order_item_serials_delivery_order_item_id_fkey"
            columns: ["delivery_order_item_id"]
            isOneToOne: false
            referencedRelation: "delivery_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_item_serials_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_order_items: {
        Row: {
          condition: string | null
          created_at: string | null
          delivery_order_id: string
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          pick_list_item_id: string | null
          quantity_delivered: number | null
          quantity_shipped: number
          sales_order_item_id: string | null
          sku: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          delivery_order_id: string
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          pick_list_item_id?: string | null
          quantity_delivered?: number | null
          quantity_shipped: number
          sales_order_item_id?: string | null
          sku?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          delivery_order_id?: string
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          pick_list_item_id?: string | null
          quantity_delivered?: number | null
          quantity_shipped?: number
          sales_order_item_id?: string | null
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_order_items_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_pick_list_item_id_fkey"
            columns: ["pick_list_item_id"]
            isOneToOne: false
            referencedRelation: "pick_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_sales_order_item_id_fkey"
            columns: ["sales_order_item_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          carrier: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          delivered_at: string | null
          delivered_confirmed_by: string | null
          delivery_notes: string | null
          delivery_photo_url: string | null
          dispatched_at: string | null
          dispatched_by: string | null
          display_id: string | null
          id: string
          notes: string | null
          pick_list_id: string | null
          received_by: string | null
          sales_order_id: string | null
          scheduled_date: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_country: string | null
          ship_to_name: string | null
          ship_to_phone: string | null
          ship_to_postal_code: string | null
          ship_to_state: string | null
          shipping_method: string | null
          signature_url: string | null
          status: Database["public"]["Enums"]["delivery_order_status"]
          tenant_id: string
          total_packages: number | null
          total_weight: number | null
          tracking_number: string | null
          updated_at: string | null
          weight_unit: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivered_confirmed_by?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          dispatched_at?: string | null
          dispatched_by?: string | null
          display_id?: string | null
          id?: string
          notes?: string | null
          pick_list_id?: string | null
          received_by?: string | null
          sales_order_id?: string | null
          scheduled_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_phone?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipping_method?: string | null
          signature_url?: string | null
          status?: Database["public"]["Enums"]["delivery_order_status"]
          tenant_id: string
          total_packages?: number | null
          total_weight?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          weight_unit?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          delivered_at?: string | null
          delivered_confirmed_by?: string | null
          delivery_notes?: string | null
          delivery_photo_url?: string | null
          dispatched_at?: string | null
          dispatched_by?: string | null
          display_id?: string | null
          id?: string
          notes?: string | null
          pick_list_id?: string | null
          received_by?: string | null
          sales_order_id?: string | null
          scheduled_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_phone?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipping_method?: string | null
          signature_url?: string | null
          status?: Database["public"]["Enums"]["delivery_order_status"]
          tenant_id?: string
          total_packages?: number | null
          total_weight?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_delivered_confirmed_by_fkey"
            columns: ["delivered_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_dispatched_by_fkey"
            columns: ["dispatched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_pick_list_id_fkey"
            columns: ["pick_list_id"]
            isOneToOne: false
            referencedRelation: "pick_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "delivery_orders_tenant_id_fkey"
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
          default_tax_rate_id: string | null
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
          is_tax_exempt: boolean | null
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
          tracking_mode:
            | Database["public"]["Enums"]["item_tracking_mode"]
            | null
          unit: string | null
          updated_at: string | null
          version: number
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
          default_tax_rate_id?: string | null
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
          is_tax_exempt?: boolean | null
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
          tracking_mode?:
            | Database["public"]["Enums"]["item_tracking_mode"]
            | null
          unit?: string | null
          updated_at?: string | null
          version?: number
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
          default_tax_rate_id?: string | null
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
          is_tax_exempt?: boolean | null
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
          tracking_mode?:
            | Database["public"]["Enums"]["item_tracking_mode"]
            | null
          unit?: string | null
          updated_at?: string | null
          version?: number
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
            foreignKeyName: "inventory_items_default_tax_rate_id_fkey"
            columns: ["default_tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
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
      invoice_items: {
        Row: {
          created_at: string | null
          delivery_order_item_id: string | null
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          invoice_id: string
          item_id: string | null
          item_name: string
          line_total: number | null
          quantity: number
          sales_order_item_id: string | null
          sku: string | null
          sort_order: number | null
          tax_amount: number | null
          tax_rate: number | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          delivery_order_item_id?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id: string
          item_id?: string | null
          item_name: string
          line_total?: number | null
          quantity: number
          sales_order_item_id?: string | null
          sku?: string | null
          sort_order?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          delivery_order_item_id?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          item_id?: string | null
          item_name?: string
          line_total?: number | null
          quantity?: number
          sales_order_item_id?: string | null
          sku?: string | null
          sort_order?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_delivery_order_item_id_fkey"
            columns: ["delivery_order_item_id"]
            isOneToOne: false
            referencedRelation: "delivery_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_sales_order_item_id_fkey"
            columns: ["sales_order_item_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          recorded_by: string | null
          reference_number: string | null
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "invoice_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          balance_due: number | null
          bill_to_address1: string | null
          bill_to_address2: string | null
          bill_to_city: string | null
          bill_to_country: string | null
          bill_to_name: string | null
          bill_to_postal_code: string | null
          bill_to_state: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string | null
          created_by: string | null
          credit_reason: string | null
          customer_id: string
          customer_notes: string | null
          delivery_order_id: string | null
          discount_amount: number | null
          display_id: string | null
          due_date: string | null
          id: string
          internal_notes: string | null
          invoice_date: string
          invoice_number: string | null
          invoice_type: string | null
          last_payment_date: string | null
          original_invoice_id: string | null
          payment_term_id: string | null
          sales_order_id: string | null
          sent_at: string | null
          sent_by: string | null
          sent_to_email: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          tenant_id: string
          terms_and_conditions: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          balance_due?: number | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_country?: string | null
          bill_to_name?: string | null
          bill_to_postal_code?: string | null
          bill_to_state?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_reason?: string | null
          customer_id: string
          customer_notes?: string | null
          delivery_order_id?: string | null
          discount_amount?: number | null
          display_id?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string | null
          invoice_type?: string | null
          last_payment_date?: string | null
          original_invoice_id?: string | null
          payment_term_id?: string | null
          sales_order_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          sent_to_email?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id: string
          terms_and_conditions?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          balance_due?: number | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_country?: string | null
          bill_to_name?: string | null
          bill_to_postal_code?: string | null
          bill_to_state?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_reason?: string | null
          customer_id?: string
          customer_notes?: string | null
          delivery_order_id?: string | null
          discount_amount?: number | null
          display_id?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_date?: string
          invoice_number?: string | null
          invoice_type?: string | null
          last_payment_date?: string | null
          original_invoice_id?: string | null
          payment_term_id?: string | null
          sales_order_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          sent_to_email?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id?: string
          terms_and_conditions?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_term_id_fkey"
            columns: ["payment_term_id"]
            isOneToOne: false
            referencedRelation: "payment_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
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
          created_by: string
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
          created_by: string
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
          created_by?: string
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
          lead_time_days: number | null
          minimum_order_quantity: number | null
          notes: string | null
          tenant_id: string
          updated_at: string | null
          vendor_id: string
          vendor_price: number | null
          vendor_sku: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          item_id: string
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          notes?: string | null
          tenant_id: string
          updated_at?: string | null
          vendor_id: string
          vendor_price?: number | null
          vendor_sku?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          item_id?: string
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          notes?: string | null
          tenant_id?: string
          updated_at?: string | null
          vendor_id?: string
          vendor_price?: number | null
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
      line_item_taxes: {
        Row: {
          created_at: string | null
          id: string
          invoice_item_id: string | null
          is_compound: boolean | null
          purchase_order_item_id: string | null
          sales_order_item_id: string | null
          sort_order: number | null
          tax_amount: number
          tax_code: string | null
          tax_name: string
          tax_rate: number
          tax_rate_id: string | null
          tax_type: string
          taxable_amount: number
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_item_id?: string | null
          is_compound?: boolean | null
          purchase_order_item_id?: string | null
          sales_order_item_id?: string | null
          sort_order?: number | null
          tax_amount: number
          tax_code?: string | null
          tax_name: string
          tax_rate: number
          tax_rate_id?: string | null
          tax_type?: string
          taxable_amount: number
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_item_id?: string | null
          is_compound?: boolean | null
          purchase_order_item_id?: string | null
          sales_order_item_id?: string | null
          sort_order?: number | null
          tax_amount?: number
          tax_code?: string | null
          tax_name?: string
          tax_rate?: number
          tax_rate_id?: string | null
          tax_type?: string
          taxable_amount?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_item_taxes_invoice_item_id_fkey"
            columns: ["invoice_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_taxes_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_taxes_sales_order_item_id_fkey"
            columns: ["sales_order_item_id"]
            isOneToOne: false
            referencedRelation: "sales_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_taxes_tax_rate_id_fkey"
            columns: ["tax_rate_id"]
            isOneToOne: false
            referencedRelation: "tax_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_item_taxes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "line_item_taxes_tenant_id_fkey"
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
      lot_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          lot_id: string
          movement_type: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lot_id: string
          movement_type: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lot_id?: string
          movement_type?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
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
      notification_preferences: {
        Row: {
          created_at: string | null
          digest_frequency: string | null
          email_enabled: boolean | null
          email_low_stock_alert: boolean | null
          email_pick_list_assigned: boolean | null
          email_po_approved: boolean | null
          email_po_submitted: boolean | null
          email_receive_completed: boolean | null
          email_stock_count_assigned: boolean | null
          id: string
          inapp_enabled: boolean | null
          push_enabled: boolean | null
          push_low_stock_alert: boolean | null
          push_pick_list_assigned: boolean | null
          push_po_approved: boolean | null
          push_po_submitted: boolean | null
          push_receive_completed: boolean | null
          push_stock_count_assigned: boolean | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          digest_frequency?: string | null
          email_enabled?: boolean | null
          email_low_stock_alert?: boolean | null
          email_pick_list_assigned?: boolean | null
          email_po_approved?: boolean | null
          email_po_submitted?: boolean | null
          email_receive_completed?: boolean | null
          email_stock_count_assigned?: boolean | null
          id?: string
          inapp_enabled?: boolean | null
          push_enabled?: boolean | null
          push_low_stock_alert?: boolean | null
          push_pick_list_assigned?: boolean | null
          push_po_approved?: boolean | null
          push_po_submitted?: boolean | null
          push_receive_completed?: boolean | null
          push_stock_count_assigned?: boolean | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          digest_frequency?: string | null
          email_enabled?: boolean | null
          email_low_stock_alert?: boolean | null
          email_pick_list_assigned?: boolean | null
          email_po_approved?: boolean | null
          email_po_submitted?: boolean | null
          email_receive_completed?: boolean | null
          email_stock_count_assigned?: boolean | null
          id?: string
          inapp_enabled?: boolean | null
          push_enabled?: boolean | null
          push_low_stock_alert?: boolean | null
          push_pick_list_assigned?: boolean | null
          push_po_approved?: boolean | null
          push_po_submitted?: boolean | null
          push_receive_completed?: boolean | null
          push_stock_count_assigned?: boolean | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
      pick_list_item_lots: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          lot_id: string
          pick_list_item_id: string
          quantity: number
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lot_id: string
          pick_list_item_id: string
          quantity: number
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          lot_id?: string
          pick_list_item_id?: string
          quantity?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_list_item_lots_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_item_lots_pick_list_item_id_fkey"
            columns: ["pick_list_item_id"]
            isOneToOne: false
            referencedRelation: "pick_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_item_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "pick_list_item_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_list_item_serials: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          pick_list_item_id: string
          serial_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          pick_list_item_id: string
          serial_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          pick_list_item_id?: string
          serial_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_list_item_serials_pick_list_item_id_fkey"
            columns: ["pick_list_item_id"]
            isOneToOne: false
            referencedRelation: "pick_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_item_serials_serial_id_fkey"
            columns: ["serial_id"]
            isOneToOne: false
            referencedRelation: "serial_numbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_item_serials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "pick_list_item_serials_tenant_id_fkey"
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
          source_item_id: string | null
          source_type: string | null
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
          source_item_id?: string | null
          source_type?: string | null
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
          source_item_id?: string | null
          source_type?: string | null
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
          name: string
          notes: string | null
          pick_list_number: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_country: string | null
          ship_to_name: string | null
          ship_to_postal_code: string | null
          ship_to_state: string | null
          source_entity_id: string | null
          source_entity_type: string | null
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
          name: string
          notes?: string | null
          pick_list_number?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
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
          name?: string
          notes?: string | null
          pick_list_number?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          source_entity_id?: string | null
          source_entity_type?: string | null
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
          locale_preferences: Json | null
          onboarding_completed: boolean | null
          preferences: Json | null
          role: string | null
          tenant_id: string | null
          unread_notification_count: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_active_at?: string | null
          locale_preferences?: Json | null
          onboarding_completed?: boolean | null
          preferences?: Json | null
          role?: string | null
          tenant_id?: string | null
          unread_notification_count?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          locale_preferences?: Json | null
          onboarding_completed?: boolean | null
          preferences?: Json | null
          role?: string | null
          tenant_id?: string | null
          unread_notification_count?: number | null
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
          order_number: string
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
          order_number: string
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
          order_number?: string
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
      rate_limit_logs: {
        Row: {
          count: number | null
          created_at: string | null
          id: string
          operation: string
          tenant_id: string
          window_start: string
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          id?: string
          operation: string
          tenant_id: string
          window_start?: string
        }
        Update: {
          count?: number | null
          created_at?: string | null
          id?: string
          operation?: string
          tenant_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_limit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "rate_limit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          purchase_order_item_id: string | null
          quantity_received: number
          receive_id: string
          return_reason: string | null
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
          purchase_order_item_id?: string | null
          quantity_received: number
          receive_id: string
          return_reason?: string | null
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
          purchase_order_item_id?: string | null
          quantity_received?: number
          receive_id?: string
          return_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receive_items_folder_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
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
          purchase_order_id: string | null
          received_by: string | null
          received_date: string
          source_type: string | null
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
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          source_type?: string | null
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
          purchase_order_id?: string | null
          received_by?: string | null
          received_date?: string
          source_type?: string | null
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
            foreignKeyName: "receives_default_folder_id_fkey"
            columns: ["default_location_id"]
            isOneToOne: false
            referencedRelation: "folders"
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
      sales_order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          item_id: string | null
          item_name: string
          line_total: number | null
          notes: string | null
          quantity_allocated: number | null
          quantity_delivered: number | null
          quantity_invoiced: number | null
          quantity_ordered: number
          quantity_picked: number | null
          quantity_shipped: number | null
          requires_lot: boolean | null
          requires_serial: boolean | null
          sales_order_id: string
          sku: string | null
          sort_order: number | null
          tax_rate: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          item_id?: string | null
          item_name: string
          line_total?: number | null
          notes?: string | null
          quantity_allocated?: number | null
          quantity_delivered?: number | null
          quantity_invoiced?: number | null
          quantity_ordered: number
          quantity_picked?: number | null
          quantity_shipped?: number | null
          requires_lot?: boolean | null
          requires_serial?: boolean | null
          sales_order_id: string
          sku?: string | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          item_id?: string | null
          item_name?: string
          line_total?: number | null
          notes?: string | null
          quantity_allocated?: number | null
          quantity_delivered?: number | null
          quantity_invoiced?: number | null
          quantity_ordered?: number
          quantity_picked?: number | null
          quantity_shipped?: number | null
          requires_lot?: boolean | null
          requires_serial?: boolean | null
          sales_order_id?: string
          sku?: string | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items_with_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          bill_to_address1: string | null
          bill_to_address2: string | null
          bill_to_city: string | null
          bill_to_country: string | null
          bill_to_name: string | null
          bill_to_postal_code: string | null
          bill_to_state: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_notes: string | null
          discount_amount: number | null
          display_id: string | null
          id: string
          internal_notes: string | null
          order_date: string
          order_number: string | null
          payment_status: string | null
          payment_term_id: string | null
          pick_list_id: string | null
          priority: string | null
          promised_date: string | null
          requested_date: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_country: string | null
          ship_to_name: string | null
          ship_to_phone: string | null
          ship_to_postal_code: string | null
          ship_to_state: string | null
          shipping_cost: number | null
          source_location_id: string | null
          status: Database["public"]["Enums"]["sales_order_status"]
          submitted_at: string | null
          submitted_by: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          tenant_id: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_country?: string | null
          bill_to_name?: string | null
          bill_to_postal_code?: string | null
          bill_to_state?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          discount_amount?: number | null
          display_id?: string | null
          id?: string
          internal_notes?: string | null
          order_date?: string
          order_number?: string | null
          payment_status?: string | null
          payment_term_id?: string | null
          pick_list_id?: string | null
          priority?: string | null
          promised_date?: string | null
          requested_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_phone?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipping_cost?: number | null
          source_location_id?: string | null
          status?: Database["public"]["Enums"]["sales_order_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_country?: string | null
          bill_to_name?: string | null
          bill_to_postal_code?: string | null
          bill_to_state?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          discount_amount?: number | null
          display_id?: string | null
          id?: string
          internal_notes?: string | null
          order_date?: string
          order_number?: string | null
          payment_status?: string | null
          payment_term_id?: string | null
          pick_list_id?: string | null
          priority?: string | null
          promised_date?: string | null
          requested_date?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_country?: string | null
          ship_to_name?: string | null
          ship_to_phone?: string | null
          ship_to_postal_code?: string | null
          ship_to_state?: string | null
          shipping_cost?: number | null
          source_location_id?: string | null
          status?: Database["public"]["Enums"]["sales_order_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          tenant_id?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_payment_term_id_fkey"
            columns: ["payment_term_id"]
            isOneToOne: false
            referencedRelation: "payment_terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_pick_list_id_fkey"
            columns: ["pick_list_id"]
            isOneToOne: false
            referencedRelation: "pick_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "sales_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          is_shared: boolean | null
          last_used_at: string | null
          name: string
          query: string | null
          sort: Json | null
          tenant_id: string
          updated_at: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_shared?: boolean | null
          last_used_at?: string | null
          name: string
          query?: string | null
          sort?: Json | null
          tenant_id: string
          updated_at?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_shared?: boolean | null
          last_used_at?: string | null
          name?: string
          query?: string | null
          sort?: Json | null
          tenant_id?: string
          updated_at?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "saved_searches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          approved_at: string | null
          approved_by: string | null
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
          submitted_at: string | null
          submitted_by: string | null
          tenant_id: string
          total_items: number | null
          updated_at: string | null
          variance_items: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
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
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id: string
          total_items?: number | null
          updated_at?: string | null
          variance_items?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
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
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id?: string
          total_items?: number | null
          updated_at?: string | null
          variance_items?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_counts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "stock_counts_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      tax_rates: {
        Row: {
          applies_to_shipping: boolean | null
          code: string | null
          country_code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_compound: boolean | null
          is_default: boolean | null
          name: string
          rate: number
          region_code: string | null
          tax_type: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          applies_to_shipping?: boolean | null
          code?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_compound?: boolean | null
          is_default?: boolean | null
          name: string
          rate: number
          region_code?: string | null
          tax_type?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          applies_to_shipping?: boolean | null
          code?: string | null
          country_code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_compound?: boolean | null
          is_default?: boolean | null
          name?: string
          rate?: number
          region_code?: string | null
          tax_type?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tax_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          tenant_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "team_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_rate_limits: {
        Row: {
          created_at: string | null
          id: string
          max_requests: number
          operation: string
          tenant_id: string
          updated_at: string | null
          window_minutes: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_requests: number
          operation: string
          tenant_id: string
          updated_at?: string | null
          window_minutes?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          max_requests?: number
          operation?: string
          tenant_id?: string
          updated_at?: string | null
          window_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "tenant_rate_limits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_stats"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tenant_rate_limits_tenant_id_fkey"
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
          max_folders: number | null
          max_items: number | null
          max_users: number | null
          name: string
          org_code: string | null
          prices_include_tax: boolean | null
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
          max_folders?: number | null
          max_items?: number | null
          max_users?: number | null
          name: string
          org_code?: string | null
          prices_include_tax?: boolean | null
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
          max_folders?: number | null
          max_items?: number | null
          max_users?: number | null
          name?: string
          org_code?: string | null
          prices_include_tax?: boolean | null
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
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tax_id: string | null
          tax_id_label: string | null
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
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          tax_id_label?: string | null
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
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tax_id?: string | null
          tax_id_label?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
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
          tracking_mode:
            | Database["public"]["Enums"]["item_tracking_mode"]
            | null
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
      add_credit_note_item: {
        Args: {
          p_credit_note_id: string
          p_description?: string
          p_item_id: string
          p_quantity: number
          p_unit_price: number
        }
        Returns: string
      }
      add_line_item_tax: {
        Args: {
          p_is_compound?: boolean
          p_item_id: string
          p_item_type: string
          p_sort_order?: number
          p_tax_rate_id: string
          p_taxable_amount: number
          p_tenant_id: string
        }
        Returns: string
      }
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
      add_standalone_receive_item: {
        Args: {
          p_batch_code?: string
          p_condition?: Database["public"]["Enums"]["receive_item_condition"]
          p_expiry_date?: string
          p_item_id: string
          p_location_id?: string
          p_lot_number?: string
          p_manufactured_date?: string
          p_notes?: string
          p_quantity_received: number
          p_receive_id: string
          p_return_reason?: string
        }
        Returns: Json
      }
      add_tags_to_item: {
        Args: { p_item_id: string; p_tag_ids: string[] }
        Returns: number
      }
      adjust_lot_quantity: {
        Args: { p_lot_id: string; p_quantity_delta: number; p_reason?: string }
        Returns: Json
      }
      allocate_pick_list_item_lots: {
        Args: { p_allocations: Json; p_pick_list_item_id: string }
        Returns: Json
      }
      allocate_pick_list_item_serials: {
        Args: { p_pick_list_item_id: string; p_serial_ids: string[] }
        Returns: Json
      }
      apply_credit_note: {
        Args: { p_credit_note_id: string }
        Returns: boolean
      }
      archive_old_activity_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      auto_allocate_lots_fefo: {
        Args: { p_pick_list_item_id: string }
        Returns: Json
      }
      auto_allocate_serials_fifo: {
        Args: { p_pick_list_item_id: string }
        Returns: Json
      }
      batch_create_items: { Args: { p_items: Json }; Returns: Json }
      bulk_adjust_quantities: { Args: { adjustments: Json }; Returns: Json }
      bulk_delete_items: { Args: { item_ids: string[] }; Returns: Json }
      bulk_import_items: {
        Args: { p_items: Json; p_options?: Json }
        Returns: Json
      }
      bulk_move_items: {
        Args: { p_item_ids: string[]; p_target_folder_id: string }
        Returns: Json
      }
      bulk_restore_items: { Args: { item_ids: string[] }; Returns: Json }
      bulk_update_embeddings: { Args: { embeddings: Json }; Returns: number }
      calculate_item_volume: { Args: { p_item_id: string }; Returns: number }
      can_access_feature: { Args: { feature_name: string }; Returns: boolean }
      can_edit: { Args: never; Returns: boolean }
      cancel_receive: { Args: { p_receive_id: string }; Returns: Json }
      cancel_stock_count: { Args: { p_stock_count_id: string }; Returns: Json }
      cancel_transfer: { Args: { p_transfer_id: string }; Returns: Json }
      check_ai_usage_limit: {
        Args: { p_estimated_cost?: number }
        Returns: Json
      }
      check_display_id_capacity_alert: {
        Args: { p_entity_type: string; p_sequence: number; p_tenant_id: string }
        Returns: undefined
      }
      check_integrity_summary: {
        Args: { p_tenant_id?: string }
        Returns: {
          failed: number
          passed: number
          status: string
          total_checks: number
        }[]
      }
      check_rate_limit: { Args: { p_operation: string }; Returns: Json }
      check_serial_exists: {
        Args: { p_exclude_item_id?: string; p_serial_number: string }
        Returns: Json
      }
      check_so_do_invoice_integrity: {
        Args: { p_tenant_id?: string }
        Returns: {
          check_name: string
          check_status: string
          details: Json
          issue_count: number
        }[]
      }
      check_subscription_limits: {
        Args: never
        Returns: {
          current_usage: number
          is_exceeded: boolean
          max_allowed: number
          resource_type: string
        }[]
      }
      checkout_item_atomic: {
        Args: {
          p_assignee_name: string
          p_assignee_type: Database["public"]["Enums"]["checkout_assignee_type"]
          p_due_date?: string
          p_item_id: string
          p_notes?: string
          p_quantity: number
        }
        Returns: Json
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
      cleanup_ai_usage_logs: { Args: never; Returns: number }
      cleanup_rate_limit_logs: { Args: never; Returns: number }
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
      create_contact: {
        Args: {
          p_company?: string
          p_email?: string
          p_id_number?: string
          p_name: string
          p_notes?: string
          p_phone?: string
        }
        Returns: Json
      }
      create_credit_note: {
        Args: {
          p_credit_reason?: string
          p_notes?: string
          p_original_invoice_id: string
        }
        Returns: string
      }
      create_delivery_order_from_pick_list: {
        Args: {
          p_carrier?: string
          p_pick_list_id: string
          p_scheduled_date?: string
          p_tracking_number?: string
        }
        Returns: string
      }
      create_delivery_order_from_sales_order: {
        Args: { p_sales_order_id: string }
        Returns: {
          delivery_order_id: string
          display_id: string
        }[]
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
      create_invoice_from_delivery: {
        Args: { p_delivery_order_id: string }
        Returns: string
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
      create_location: {
        Args: {
          p_description?: string
          p_name: string
          p_type?: Database["public"]["Enums"]["location_type"]
        }
        Returns: Json
      }
      create_lot: {
        Args: {
          p_batch_code?: string
          p_expiry_date?: string
          p_item_id: string
          p_location_id?: string
          p_lot_number?: string
          p_manufactured_date?: string
          p_notes?: string
          p_quantity: number
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_action_url?: string
          p_entity_display_id?: string
          p_entity_id?: string
          p_entity_type?: string
          p_message?: string
          p_tenant_id: string
          p_title: string
          p_triggered_by?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
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
      create_sales_order: {
        Args: {
          p_customer_id?: string
          p_customer_notes?: string
          p_internal_notes?: string
          p_order_date?: string
          p_order_number?: string
          p_priority?: string
          p_promised_date?: string
          p_requested_date?: string
          p_ship_to_address1?: string
          p_ship_to_address2?: string
          p_ship_to_city?: string
          p_ship_to_country?: string
          p_ship_to_name?: string
          p_ship_to_phone?: string
          p_ship_to_postal_code?: string
          p_ship_to_state?: string
          p_source_location_id?: string
        }
        Returns: {
          display_id: string
          id: string
        }[]
      }
      create_standalone_receive:
        | {
            Args: {
              p_default_location_id?: string
              p_notes?: string
              p_source_type?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_carrier?: string
              p_default_location_id?: string
              p_delivery_note_number?: string
              p_notes?: string
              p_received_date?: string
              p_source_type?: string
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
      delete_saved_search: { Args: { p_search_id: string }; Returns: Json }
      delete_serial: { Args: { p_serial_id: string }; Returns: Json }
      dispatch_delivery_order: {
        Args: { p_delivery_order_id: string }
        Returns: undefined
      }
      execute_transfer: { Args: { p_transfer_id: string }; Returns: Json }
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
      generate_invitation_token: { Args: never; Returns: string }
      generate_org_code: { Args: { p_company_name: string }; Returns: string }
      generate_pick_list_from_sales_order: {
        Args: { p_sales_order_id: string }
        Returns: string
      }
      get_action_breakdown: {
        Args: { p_days?: number; p_tenant_id: string }
        Returns: {
          action_count: number
          action_type: string
          percentage: number
        }[]
      }
      get_active_checkout: { Args: { p_item_id: string }; Returns: Json }
      get_active_tax_rates: {
        Args: { p_tenant_id: string }
        Returns: {
          applies_to_shipping: boolean
          code: string
          country_code: string
          id: string
          is_compound: boolean
          is_default: boolean
          name: string
          rate: number
          region_code: string
          tax_type: string
        }[]
      }
      get_activity_by_day: {
        Args: { p_days?: number; p_tenant_id: string }
        Returns: {
          activity_count: number
          activity_date: string
        }[]
      }
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
          from_folder_id: string
          from_folder_name: string
          id: string
          is_archived: boolean
          quantity_after: number
          quantity_before: number
          quantity_delta: number
          to_folder_id: string
          to_folder_name: string
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
      get_ai_usage_summary: { Args: never; Returns: Json }
      get_all_reminders: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_status?: string
          p_type?: string
        }
        Returns: Json
      }
      get_alphanumeric_prefix: { Args: { p_sequence: number }; Returns: string }
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
      get_contact_checkouts: {
        Args: { p_contact_id: string; p_limit?: number }
        Returns: Json
      }
      get_contacts: {
        Args: {
          p_include_inactive?: boolean
          p_limit?: number
          p_search?: string
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
      get_customer_details: {
        Args: { p_customer_id: string }
        Returns: {
          billing_address_line1: string
          billing_address_line2: string
          billing_city: string
          billing_country: string
          billing_postal_code: string
          billing_state: string
          contact_name: string
          created_at: string
          credit_limit: number
          customer_code: string
          email: string
          id: string
          is_active: boolean
          name: string
          notes: string
          payment_term_id: string
          payment_term_name: string
          phone: string
          shipping_address_line1: string
          shipping_address_line2: string
          shipping_city: string
          shipping_country: string
          shipping_postal_code: string
          shipping_same_as_billing: boolean
          shipping_state: string
          tenant_id: string
          total_orders: number
          total_revenue: number
          updated_at: string
        }[]
      }
      get_customer_tax_info: {
        Args: { p_customer_id: string }
        Returns: {
          customer_id: string
          customer_name: string
          default_tax_rate: number
          default_tax_rate_id: string
          default_tax_rate_name: string
          is_tax_exempt: boolean
          tax_exemption_reason: string
          tax_id: string
          tax_id_label: string
        }[]
      }
      get_dashboard_data: { Args: never; Returns: Json }
      get_default_tax_rate: {
        Args: { p_tenant_id: string }
        Returns: {
          id: string
          name: string
          rate: number
          tax_type: string
        }[]
      }
      get_display_id_capacity: {
        Args: never
        Returns: {
          current_letter: string
          current_sequence: number
          entity_label: string
          entity_type: string
          remaining_single_letter: number
          single_letter_capacity: number
          status: string
          used_percentage: number
        }[]
      }
      get_document_tax_breakdown: {
        Args: { p_document_id: string; p_document_type: string }
        Returns: {
          tax_amount: number
          tax_name: string
          tax_rate: number
          tax_type: string
          taxable_amount: number
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
      get_expiring_lots: {
        Args: { p_days?: number; p_location_id?: string }
        Returns: Json
      }
      get_expiring_lots_summary: { Args: never; Returns: Json }
      get_fefo_suggestion: {
        Args: {
          p_item_id: string
          p_location_id?: string
          p_quantity_needed: number
        }
        Returns: Json
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
      get_invitation_by_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          expires_at: string
          id: string
          invited_by_name: string
          is_valid: boolean
          role: string
          tenant_id: string
          tenant_name: string
        }[]
      }
      get_invoice_item_taxes: {
        Args: { p_item_id: string }
        Returns: {
          id: string
          is_compound: boolean
          tax_amount: number
          tax_code: string
          tax_name: string
          tax_rate: number
          tax_type: string
          taxable_amount: number
        }[]
      }
      get_invoice_tax_summary: {
        Args: { p_invoice_id: string }
        Returns: {
          tax_name: string
          tax_rate: number
          tax_type: string
          total_tax: number
          total_taxable: number
        }[]
      }
      get_item_checkout_history: {
        Args: { p_item_id: string; p_limit?: number }
        Returns: Json
      }
      get_item_detail_full: { Args: { p_item_id: string }; Returns: Json }
      get_item_details: { Args: { p_item_id: string }; Returns: Json }
      get_item_locations: { Args: { p_item_id: string }; Returns: Json }
      get_item_lots: {
        Args: { p_include_depleted?: boolean; p_item_id: string }
        Returns: Json
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
      get_item_tax_info: {
        Args: { p_item_id: string }
        Returns: {
          default_tax_rate: number
          default_tax_rate_id: string
          default_tax_rate_name: string
          is_tax_exempt: boolean
          item_id: string
          item_name: string
        }[]
      }
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
      get_items_with_shipping: {
        Args: { p_missing_only?: boolean }
        Returns: Json
      }
      get_jobs: { Args: { p_limit?: number; p_status?: string }; Returns: Json }
      get_letter_prefix: { Args: { p_sequence: number }; Returns: string }
      get_location_inventory: {
        Args: { p_include_zero?: boolean; p_location_id: string }
        Returns: Json
      }
      get_location_lots: {
        Args: { p_expiring_only?: boolean; p_location_id: string }
        Returns: Json
      }
      get_locations: { Args: { p_include_inactive?: boolean }; Returns: Json }
      get_lot_movements: {
        Args: { p_limit?: number; p_lot_id: string }
        Returns: Json
      }
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
      get_most_active_items: {
        Args: { p_days?: number; p_limit?: number; p_tenant_id: string }
        Returns: {
          activity_count: number
          entity_id: string
          entity_name: string
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
          is_default: boolean
          name: string
          sort_order: number
          usage_count: number
        }[]
      }
      get_pending_transfers: { Args: never; Returns: Json }
      get_pick_list_item_tracking: {
        Args: { p_pick_list_item_id: string }
        Returns: Json
      }
      get_pick_list_with_items: {
        Args: { p_pick_list_id: string }
        Returns: Json
      }
      get_plan_limits: {
        Args: { plan_id: string }
        Returns: {
          max_folders_limit: number
          max_items_limit: number
          max_users_limit: number
          trial_days: number
        }[]
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
        Args: { p_folder_id?: string; p_include_subfolders?: boolean }
        Returns: Json
      }
      get_sales_order_item_taxes: {
        Args: { p_item_id: string }
        Returns: {
          id: string
          is_compound: boolean
          tax_amount: number
          tax_code: string
          tax_name: string
          tax_rate: number
          tax_type: string
          taxable_amount: number
        }[]
      }
      get_sales_order_tax_summary: {
        Args: { p_sales_order_id: string }
        Returns: {
          tax_name: string
          tax_rate: number
          tax_type: string
          total_tax: number
          total_taxable: number
        }[]
      }
      get_sales_order_with_details: {
        Args: { p_sales_order_id: string }
        Returns: {
          created_at: string
          customer_email: string
          customer_id: string
          customer_name: string
          display_id: string
          id: string
          items_count: number
          order_date: string
          payment_status: string
          pick_list_display_id: string
          pick_list_id: string
          priority: string
          promised_date: string
          requested_date: string
          ship_to_address1: string
          ship_to_city: string
          ship_to_country: string
          ship_to_name: string
          ship_to_state: string
          status: Database["public"]["Enums"]["sales_order_status"]
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
        }[]
      }
      get_saved_searches: { Args: never; Returns: Json }
      get_standalone_receives: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_source_type?: string
          p_status?: string
        }
        Returns: Json
      }
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
      get_team_members_for_mention:
        | {
            Args: never
            Returns: {
              avatar_url: string
              email: string
              full_name: string
              id: string
              role: string
            }[]
          }
        | {
            Args: { p_limit?: number; p_search_query?: string }
            Returns: {
              user_avatar: string
              user_email: string
              user_id: string
              user_name: string
            }[]
          }
      get_tenant_org_code: { Args: never; Returns: Json }
      get_transfer_suggestions: { Args: never; Returns: Json }
      get_trial_days_remaining: { Args: { tenant_id: string }; Returns: number }
      get_unread_mentions_count: { Args: never; Returns: number }
      get_unread_notification_count: { Args: never; Returns: number }
      get_user_locale_preferences: { Args: never; Returns: Json }
      get_user_notifications: {
        Args: { p_limit?: number; p_offset?: number; p_unread_only?: boolean }
        Returns: Json
      }
      get_user_tenant_id: { Args: never; Returns: string }
      get_weekly_comparison: {
        Args: { p_tenant_id: string }
        Returns: {
          change_percent: number
          last_week_count: number
          this_week_count: number
        }[]
      }
      get_zoe_context: {
        Args: {
          p_days_back?: number
          p_include_checkouts?: boolean
          p_include_movements?: boolean
          p_include_pick_lists?: boolean
          p_include_po?: boolean
          p_include_tasks?: boolean
          p_include_team?: boolean
          p_item_limit?: number
          p_query_keywords?: string[]
        }
        Returns: Json
      }
      increment_so_item_shipped: {
        Args: { p_quantity: number; p_so_item_id: string }
        Returns: Json
      }
      is_account_paused: { Args: { tenant_id: string }; Returns: boolean }
      is_admin_or_owner: { Args: never; Returns: boolean }
      is_following_entity: {
        Args: {
          p_entity_id: string
          p_entity_type: Database["public"]["Enums"]["chatter_entity_type"]
        }
        Returns: boolean
      }
      is_in_grace_period: { Args: { tenant_id: string }; Returns: boolean }
      is_tenant_owner: { Args: never; Returns: boolean }
      is_trial_active: { Args: { tenant_id: string }; Returns: boolean }
      log_activity:
        | {
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
        | {
            Args: {
              p_action_type: string
              p_changes?: Json
              p_entity_id: string
              p_entity_name?: string
              p_entity_type: string
              p_quantity_after?: number
              p_quantity_before?: number
              p_quantity_delta?: number
              p_tenant_id: string
              p_user_id: string
            }
            Returns: string
          }
      mark_mentions_read: { Args: { p_message_ids: string[] }; Returns: number }
      mark_notifications_read: {
        Args: { p_notification_ids: string[] }
        Returns: undefined
      }
      mark_overdue_invoices: { Args: never; Returns: number }
      move_folder_with_descendants: {
        Args: { p_folder_id: string; p_new_parent_id: string }
        Returns: undefined
      }
      normalize_plan_id: { Args: { plan_id: string }; Returns: string }
      notify_admins_pending_approval: {
        Args: {
          p_entity_display_id: string
          p_entity_id: string
          p_entity_type: string
          p_submitter_name: string
          p_tenant_id: string
          p_triggered_by: string
        }
        Returns: undefined
      }
      notify_approval: {
        Args: {
          p_approved: boolean
          p_approver_name: string
          p_entity_display_id: string
          p_entity_id: string
          p_entity_type: string
          p_tenant_id: string
          p_triggered_by: string
          p_user_id: string
        }
        Returns: undefined
      }
      notify_assignment: {
        Args: {
          p_assigner_name: string
          p_entity_display_id: string
          p_entity_id: string
          p_entity_type: string
          p_tenant_id: string
          p_triggered_by: string
          p_user_id: string
        }
        Returns: undefined
      }
      notify_receive_completed: {
        Args: {
          p_completer_name: string
          p_receive_display_id: string
          p_receive_id: string
          p_tenant_id: string
          p_triggered_by: string
        }
        Returns: undefined
      }
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
      purge_old_archives: { Args: { retention_days?: number }; Returns: number }
      recalculate_invoice_totals: {
        Args: { p_invoice_id: string }
        Returns: undefined
      }
      recalculate_line_item_taxes: {
        Args: {
          p_item_id: string
          p_item_type: string
          p_tax_rate_ids: string[]
          p_taxable_amount: number
        }
        Returns: undefined
      }
      recalculate_purchase_order_totals: {
        Args: { p_purchase_order_id: string }
        Returns: undefined
      }
      recalculate_sales_order_totals: {
        Args: { p_sales_order_id: string }
        Returns: undefined
      }
      record_invoice_payment: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_notes?: string
          p_payment_method?: string
          p_reference_number?: string
        }
        Returns: string
      }
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
      request_transfer: {
        Args: {
          p_ai_reason?: string
          p_from_location_id: string
          p_is_ai_suggested?: boolean
          p_item_id: string
          p_notes?: string
          p_quantity: number
          p_to_location_id: string
        }
        Returns: Json
      }
      return_checkout_serials: {
        Args: {
          p_checkout_id: string
          p_notes?: string
          p_serial_returns: Json
        }
        Returns: Json
      }
      return_item_atomic: {
        Args: {
          p_checkout_id: string
          p_condition?: Database["public"]["Enums"]["item_condition"]
          p_notes?: string
        }
        Returns: Json
      }
      save_search: {
        Args: {
          p_filters?: Json
          p_is_shared?: boolean
          p_name: string
          p_query?: string
          p_sort?: Json
        }
        Returns: Json
      }
      search_by_display_id: {
        Args: { p_entity_types?: string[]; p_limit?: number; p_query: string }
        Returns: Json
      }
      search_customers: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          billing_city: string
          customer_code: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string
        }[]
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
      set_location_stock: {
        Args: {
          p_item_id: string
          p_location_id: string
          p_min_quantity?: number
          p_quantity: number
        }
        Returns: Json
      }
      set_tenant_context: { Args: never; Returns: undefined }
      set_user_ai_limit: {
        Args: { p_monthly_limit_usd: number; p_user_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      start_stock_count: { Args: { p_stock_count_id: string }; Returns: Json }
      stock_in_serials: {
        Args: { p_item_id: string; p_notes?: string; p_serials: string[] }
        Returns: Json
      }
      stock_out_fifo: {
        Args: { p_item_id: string; p_quantity: number; p_reason?: string }
        Returns: Json
      }
      stock_out_serials: {
        Args: {
          p_item_id: string
          p_new_status?: string
          p_reason?: string
          p_serial_ids: string[]
        }
        Returns: Json
      }
      submit_stock_count_for_review: {
        Args: { p_stock_count_id: string }
        Returns: Json
      }
      toggle_reminder: {
        Args: { p_reminder_id: string; p_source_type: string }
        Returns: Json
      }
      toggle_reminder_status: { Args: { p_reminder_id: string }; Returns: Json }
      track_ai_usage: {
        Args: {
          p_input_tokens: number
          p_model_name?: string
          p_operation?: string
          p_output_tokens: number
        }
        Returns: Json
      }
      transfer_lot: {
        Args: {
          p_lot_id: string
          p_quantity?: number
          p_to_location_id: string
        }
        Returns: Json
      }
      update_contact: {
        Args: {
          p_company?: string
          p_contact_id: string
          p_email?: string
          p_id_number?: string
          p_is_active?: boolean
          p_name?: string
          p_notes?: string
          p_phone?: string
        }
        Returns: Json
      }
      update_expired_lots: { Args: never; Returns: number }
      update_inventory_quantity_with_lock: {
        Args: {
          p_change_source?: string
          p_expected_version: number
          p_item_id: string
          p_quantity_change: number
        }
        Returns: Json
      }
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
      update_serial_status: {
        Args: {
          p_notes?: string
          p_serial_id: string
          p_status: Database["public"]["Enums"]["serial_status"]
        }
        Returns: Json
      }
      update_tenant_limits: {
        Args: { new_plan_id: string; tenant_uuid: string }
        Returns: undefined
      }
      update_user_locale_preferences: {
        Args: { p_preferences: Json }
        Returns: Json
      }
      upsert_item_serials: {
        Args: { p_item_id: string; p_serials: string[] }
        Returns: Json
      }
      use_saved_search: { Args: { p_search_id: string }; Returns: Json }
      user_has_role: { Args: { required_roles: string[] }; Returns: boolean }
      validate_ai_request: { Args: { p_operation?: string }; Returns: Json }
      validate_item_status: { Args: { status: string }; Returns: boolean }
      validate_locale_preferences: { Args: { prefs: Json }; Returns: boolean }
      validate_pick_list_status: { Args: { status: string }; Returns: boolean }
      validate_po_status: { Args: { status: string }; Returns: boolean }
      validate_receive: { Args: { p_receive_id: string }; Returns: Json }
      validate_tenant_access: {
        Args: { check_tenant_id: string }
        Returns: boolean
      }
      validate_tenant_settings: { Args: { settings: Json }; Returns: boolean }
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
        | "customer"
        | "sales_order"
        | "delivery_order"
        | "invoice"
      checkout_assignee_type: "person" | "job" | "location" | "contact"
      checkout_status: "checked_out" | "returned" | "overdue"
      comparison_operator_enum: "lte" | "lt" | "gt" | "gte" | "eq"
      delivery_order_status:
        | "draft"
        | "ready"
        | "dispatched"
        | "in_transit"
        | "delivered"
        | "partial"
        | "failed"
        | "returned"
        | "cancelled"
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
      invoice_status:
        | "draft"
        | "pending"
        | "sent"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled"
        | "void"
      item_condition: "good" | "damaged" | "needs_repair" | "lost"
      item_status_enum: "in_stock" | "low_stock" | "out_of_stock"
      item_tracking_mode: "none" | "serialized" | "lot_expiry"
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
      receive_status: "draft" | "in_progress" | "completed" | "cancelled"
      reminder_recurrence_enum: "once" | "daily" | "weekly" | "monthly"
      reminder_status_enum: "active" | "paused" | "completed" | "deleted"
      reminder_type_enum: "low_stock" | "expiry" | "restock"
      sales_order_status:
        | "draft"
        | "submitted"
        | "confirmed"
        | "picking"
        | "picked"
        | "partial_shipped"
        | "shipped"
        | "delivered"
        | "completed"
        | "cancelled"
      serial_status:
        | "available"
        | "reserved"
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
        | "pending_approval"
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
        "customer",
        "sales_order",
        "delivery_order",
        "invoice",
      ],
      checkout_assignee_type: ["person", "job", "location", "contact"],
      checkout_status: ["checked_out", "returned", "overdue"],
      comparison_operator_enum: ["lte", "lt", "gt", "gte", "eq"],
      delivery_order_status: [
        "draft",
        "ready",
        "dispatched",
        "in_transit",
        "delivered",
        "partial",
        "failed",
        "returned",
        "cancelled",
      ],
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
      invoice_status: [
        "draft",
        "pending",
        "sent",
        "partial",
        "paid",
        "overdue",
        "cancelled",
        "void",
      ],
      item_condition: ["good", "damaged", "needs_repair", "lost"],
      item_status_enum: ["in_stock", "low_stock", "out_of_stock"],
      item_tracking_mode: ["none", "serialized", "lot_expiry"],
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
      receive_status: ["draft", "in_progress", "completed", "cancelled"],
      reminder_recurrence_enum: ["once", "daily", "weekly", "monthly"],
      reminder_status_enum: ["active", "paused", "completed", "deleted"],
      reminder_type_enum: ["low_stock", "expiry", "restock"],
      sales_order_status: [
        "draft",
        "submitted",
        "confirmed",
        "picking",
        "picked",
        "partial_shipped",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
      ],
      serial_status: [
        "available",
        "reserved",
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
        "pending_approval",
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
