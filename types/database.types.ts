export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      checkouts: {
        Row: {
          id: string
          tenant_id: string
          item_id: string
          quantity: number
          assignee_type: 'person' | 'job' | 'location'
          assignee_id: string | null
          assignee_name: string | null
          checked_out_at: string
          checked_out_by: string | null
          due_date: string | null
          status: 'checked_out' | 'returned' | 'overdue'
          returned_at: string | null
          returned_by: string | null
          return_condition: 'good' | 'damaged' | 'needs_repair' | 'lost' | null
          return_notes: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          item_id: string
          quantity?: number
          assignee_type: 'person' | 'job' | 'location'
          assignee_id?: string | null
          assignee_name?: string | null
          checked_out_at?: string
          checked_out_by?: string | null
          due_date?: string | null
          status?: 'checked_out' | 'returned' | 'overdue'
          returned_at?: string | null
          returned_by?: string | null
          return_condition?: 'good' | 'damaged' | 'needs_repair' | 'lost' | null
          return_notes?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          item_id?: string
          quantity?: number
          assignee_type?: 'person' | 'job' | 'location'
          assignee_id?: string | null
          assignee_name?: string | null
          checked_out_at?: string
          checked_out_by?: string | null
          due_date?: string | null
          status?: 'checked_out' | 'returned' | 'overdue'
          returned_at?: string | null
          returned_by?: string | null
          return_condition?: 'good' | 'damaged' | 'needs_repair' | 'lost' | null
          return_notes?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          status: string | null
          start_date: string | null
          end_date: string | null
          location: string | null
          notes: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          status?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          status?: string | null
          start_date?: string | null
          end_date?: string | null
          location?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: 'warehouse' | 'van' | 'store' | 'job_site'
          description: string | null
          is_active: boolean
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type?: 'warehouse' | 'van' | 'store' | 'job_site'
          description?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          type?: 'warehouse' | 'van' | 'store' | 'job_site'
          description?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      location_stock: {
        Row: {
          id: string
          tenant_id: string
          item_id: string
          location_id: string
          quantity: number
          min_quantity: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          item_id: string
          location_id: string
          quantity?: number
          min_quantity?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          item_id?: string
          location_id?: string
          quantity?: number
          min_quantity?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      stock_transfers: {
        Row: {
          id: string
          tenant_id: string
          item_id: string
          quantity: number
          from_location_id: string
          to_location_id: string
          status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
          is_ai_suggested: boolean
          ai_suggestion_reason: string | null
          requested_by: string | null
          requested_at: string | null
          completed_by: string | null
          completed_at: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          item_id: string
          quantity: number
          from_location_id: string
          to_location_id: string
          status?: 'pending' | 'in_transit' | 'completed' | 'cancelled'
          is_ai_suggested?: boolean
          ai_suggestion_reason?: string | null
          requested_by?: string | null
          requested_at?: string | null
          completed_by?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          item_id?: string
          quantity?: number
          from_location_id?: string
          to_location_id?: string
          status?: 'pending' | 'in_transit' | 'completed' | 'cancelled'
          is_ai_suggested?: boolean
          ai_suggestion_reason?: string | null
          requested_by?: string | null
          requested_at?: string | null
          completed_by?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      lots: {
        Row: {
          id: string
          tenant_id: string
          item_id: string
          location_id: string | null
          lot_number: string | null
          batch_code: string | null
          expiry_date: string | null
          manufactured_date: string | null
          received_at: string | null
          quantity: number
          status: 'active' | 'expired' | 'depleted' | 'blocked'
          notes: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          item_id: string
          location_id?: string | null
          lot_number?: string | null
          batch_code?: string | null
          expiry_date?: string | null
          manufactured_date?: string | null
          received_at?: string | null
          quantity?: number
          status?: 'active' | 'expired' | 'depleted' | 'blocked'
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          item_id?: string
          location_id?: string | null
          lot_number?: string | null
          batch_code?: string | null
          expiry_date?: string | null
          manufactured_date?: string | null
          received_at?: string | null
          quantity?: number
          status?: 'active' | 'expired' | 'depleted' | 'blocked'
          notes?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      item_reminders: {
        Row: {
          id: string
          tenant_id: string
          item_id: string
          created_by: string | null
          reminder_type: 'low_stock' | 'expiry' | 'restock'
          title: string | null
          message: string | null
          threshold: number | null
          comparison_operator: 'lte' | 'lt' | 'gt' | 'gte' | 'eq'
          days_before_expiry: number | null
          scheduled_at: string | null
          recurrence: 'once' | 'daily' | 'weekly' | 'monthly'
          recurrence_end_date: string | null
          notify_in_app: boolean
          notify_email: boolean
          notify_user_ids: string[] | null
          status: 'active' | 'paused' | 'triggered' | 'expired'
          last_triggered_at: string | null
          next_trigger_at: string | null
          trigger_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          item_id: string
          created_by?: string | null
          reminder_type: 'low_stock' | 'expiry' | 'restock'
          title?: string | null
          message?: string | null
          threshold?: number | null
          comparison_operator?: 'lte' | 'lt' | 'gt' | 'gte' | 'eq'
          days_before_expiry?: number | null
          scheduled_at?: string | null
          recurrence?: 'once' | 'daily' | 'weekly' | 'monthly'
          recurrence_end_date?: string | null
          notify_in_app?: boolean
          notify_email?: boolean
          notify_user_ids?: string[] | null
          status?: 'active' | 'paused' | 'triggered' | 'expired'
          last_triggered_at?: string | null
          next_trigger_at?: string | null
          trigger_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          item_id?: string
          created_by?: string | null
          reminder_type?: 'low_stock' | 'expiry' | 'restock'
          title?: string | null
          message?: string | null
          threshold?: number | null
          comparison_operator?: 'lte' | 'lt' | 'gt' | 'gte' | 'eq'
          days_before_expiry?: number | null
          scheduled_at?: string | null
          recurrence?: 'once' | 'daily' | 'weekly' | 'monthly'
          recurrence_end_date?: string | null
          notify_in_app?: boolean
          notify_email?: boolean
          notify_user_ids?: string[] | null
          status?: 'active' | 'paused' | 'triggered' | 'expired'
          last_triggered_at?: string | null
          next_trigger_at?: string | null
          trigger_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
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
          ip_address: string | null
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
          ip_address?: string | null
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
          ip_address?: string | null
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
          ip_address: string | null
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
          ip_address?: string | null
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
          ip_address?: string | null
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
      }
      folders: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          depth: number | null
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
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          path?: string[] | null
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
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
          embedding: string | null
          embedding_updated_at: string | null
          folder_id: string | null
          id: string
          image_urls: string[] | null
          last_modified_by: string | null
          location: string | null
          min_quantity: number | null
          name: string
          notes: string | null
          price: number | null
          qr_code: string | null
          quantity: number
          serial_number: string | null
          sku: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string
          unit: string | null
          updated_at: string | null
          // Tracking mode
          tracking_mode: 'none' | 'serialized' | 'lot_expiry' | null
          // Shipping dimensions
          weight: number | null
          weight_unit: string | null
          length: number | null
          width: number | null
          height: number | null
          dimension_unit: string | null
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
          embedding?: string | null
          embedding_updated_at?: string | null
          folder_id?: string | null
          id?: string
          image_urls?: string[] | null
          last_modified_by?: string | null
          location?: string | null
          min_quantity?: number | null
          name: string
          notes?: string | null
          price?: number | null
          qr_code?: string | null
          quantity?: number
          serial_number?: string | null
          sku?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id: string
          unit?: string | null
          updated_at?: string | null
          // Tracking mode
          tracking_mode?: 'none' | 'serialized' | 'lot_expiry' | null
          // Shipping dimensions
          weight?: number | null
          weight_unit?: string | null
          length?: number | null
          width?: number | null
          height?: number | null
          dimension_unit?: string | null
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
          embedding?: string | null
          embedding_updated_at?: string | null
          folder_id?: string | null
          id?: string
          image_urls?: string[] | null
          last_modified_by?: string | null
          location?: string | null
          min_quantity?: number | null
          name?: string
          notes?: string | null
          price?: number | null
          qr_code?: string | null
          quantity?: number
          serial_number?: string | null
          sku?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string
          unit?: string | null
          updated_at?: string | null
          // Tracking mode
          tracking_mode?: 'none' | 'serialized' | 'lot_expiry' | null
          // Shipping dimensions
          weight?: number | null
          weight_unit?: string | null
          length?: number | null
          width?: number | null
          height?: number | null
          dimension_unit?: string | null
        }
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
      }
      notifications: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          message: string | null
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
          notification_type?: string
          read_at?: string | null
          tenant_id?: string
          title?: string
          user_id?: string | null
        }
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
      }
      pick_lists: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          item_outcome: string | null
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
          due_date?: string | null
          id?: string
          item_outcome?: string | null
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
          due_date?: string | null
          id?: string
          item_outcome?: string | null
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
      }
      purchase_order_items: {
        Row: {
          id: string
          item_id: string | null
          item_name: string
          notes: string | null
          ordered_quantity: number
          purchase_order_id: string
          received_quantity: number | null
          sku: string | null
          unit_price: number | null
          part_number: string | null
        }
        Insert: {
          id?: string
          item_id?: string | null
          item_name: string
          notes?: string | null
          ordered_quantity: number
          purchase_order_id: string
          received_quantity?: number | null
          sku?: string | null
          unit_price?: number | null
          part_number?: string | null
        }
        Update: {
          id?: string
          item_id?: string | null
          item_name?: string
          notes?: string | null
          ordered_quantity?: number
          purchase_order_id?: string
          received_quantity?: number | null
          sku?: string | null
          unit_price?: number | null
          part_number?: string | null
        }
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_number: string | null
          received_date: string | null
          shipping: number | null
          status: string | null
          subtotal: number | null
          tax: number | null
          tenant_id: string
          total_amount: number | null
          updated_at: string | null
          vendor_id: string | null
          // Ship To address fields
          ship_to_name: string | null
          ship_to_address1: string | null
          ship_to_address2: string | null
          ship_to_city: string | null
          ship_to_state: string | null
          ship_to_postal_code: string | null
          ship_to_country: string | null
          // Bill To address fields
          bill_to_name: string | null
          bill_to_address1: string | null
          bill_to_address2: string | null
          bill_to_city: string | null
          bill_to_state: string | null
          bill_to_postal_code: string | null
          bill_to_country: string | null
          // Submission and approval tracking
          submitted_by: string | null
          submitted_at: string | null
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          received_date?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          tenant_id: string
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          // Ship To address fields
          ship_to_name?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_state?: string | null
          ship_to_postal_code?: string | null
          ship_to_country?: string | null
          // Bill To address fields
          bill_to_name?: string | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_state?: string | null
          bill_to_postal_code?: string | null
          bill_to_country?: string | null
          // Submission and approval tracking
          submitted_by?: string | null
          submitted_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string | null
          received_date?: string | null
          shipping?: number | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          tenant_id?: string
          total_amount?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          // Ship To address fields
          ship_to_name?: string | null
          ship_to_address1?: string | null
          ship_to_address2?: string | null
          ship_to_city?: string | null
          ship_to_state?: string | null
          ship_to_postal_code?: string | null
          ship_to_country?: string | null
          // Bill To address fields
          bill_to_name?: string | null
          bill_to_address1?: string | null
          bill_to_address2?: string | null
          bill_to_city?: string | null
          bill_to_state?: string | null
          bill_to_postal_code?: string | null
          bill_to_country?: string | null
          // Submission and approval tracking
          submitted_by?: string | null
          submitted_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
        }
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
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          max_items: number | null
          max_users: number | null
          name: string
          primary_color: string | null
          settings: Json | null
          slug: string
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_items?: number | null
          max_users?: number | null
          name: string
          primary_color?: string | null
          settings?: Json | null
          slug: string
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_items?: number | null
          max_users?: number | null
          name?: string
          primary_color?: string | null
          settings?: Json | null
          slug?: string
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
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
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
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
          ip_address: string | null
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
      }
    }
    Functions: {
      add_tags_to_item: {
        Args: { p_item_id: string; p_tag_ids: string[] }
        Returns: number
      }
      archive_old_activity_logs: {
        Args: { retention_days?: number }
        Returns: number
      }
      bulk_adjust_quantities: { Args: { adjustments: Json }; Returns: Json }
      bulk_delete_items: { Args: { item_ids: string[] }; Returns: Json }
      bulk_move_items: {
        Args: { item_ids: string[]; target_folder_id: string }
        Returns: Json
      }
      bulk_restore_items: { Args: { item_ids: string[] }; Returns: Json }
      can_edit: { Args: Record<string, never>; Returns: boolean }
      check_subscription_limits: {
        Args: Record<string, never>
        Returns: {
          current_usage: number
          is_exceeded: boolean
          max_allowed: number
          resource_type: string
        }[]
      }
      create_item_with_tags: {
        Args: { p_item: Json; p_tag_ids?: string[] }
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
      get_current_user_profile: {
        Args: Record<string, never>
        Returns: {
          email: string
          full_name: string
          role: string
          tenant_id: string
          user_id: string
        }[]
      }
      get_dashboard_data: { Args: Record<string, never>; Returns: Json }
      get_folder_stats: {
        Args: Record<string, never>
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
      get_item_details: { Args: { p_item_id: string }; Returns: Json }
      get_item_tags: {
        Args: { p_item_id: string }
        Returns: {
          color: string
          id: string
          name: string
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
      get_my_tenant_stats_realtime: { Args: Record<string, never>; Returns: Json }
      get_recent_activity_summary: {
        Args: { p_days?: number }
        Returns: {
          action_type: string
          count: number
          date: string
        }[]
      }
      get_status_distribution: {
        Args: Record<string, never>
        Returns: {
          count: number
          percentage: number
          status: string
        }[]
      }
      get_tag_stats: {
        Args: Record<string, never>
        Returns: {
          item_count: number
          tag_color: string
          tag_id: string
          tag_name: string
        }[]
      }
      get_user_tenant_id: { Args: Record<string, never>; Returns: string }
      is_admin_or_owner: { Args: Record<string, never>; Returns: boolean }
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
      purge_old_archives: { Args: { retention_days?: number }; Returns: number }
      refresh_all_tenant_stats: { Args: Record<string, never>; Returns: undefined }
      remove_tags_from_item: {
        Args: { p_item_id: string; p_tag_ids: string[] }
        Returns: number
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
      set_item_tags: {
        Args: { p_item_id: string; p_tag_ids: string[] }
        Returns: number
      }
      set_tenant_context: { Args: Record<string, never>; Returns: undefined }
      update_item_embedding: {
        Args: { p_embedding: string; p_item_id: string }
        Returns: boolean
      }
      update_item_with_tags: {
        Args: { p_item_id: string; p_tag_ids?: string[]; p_updates: Json }
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
        | 'create'
        | 'update'
        | 'delete'
        | 'restore'
        | 'adjust_quantity'
        | 'move'
        | 'archive'
        | 'login'
        | 'logout'
        | 'export'
        | 'import'
        | 'bulk_update'
        | 'assign'
        | 'complete'
      alert_type_enum:
        | 'low_stock'
        | 'out_of_stock'
        | 'expiring_soon'
        | 'reorder_point'
        | 'custom'
      entity_type_enum:
        | 'item'
        | 'folder'
        | 'tag'
        | 'pick_list'
        | 'purchase_order'
        | 'vendor'
        | 'address'
        | 'profile'
        | 'tenant'
        | 'alert'
        | 'notification'
      field_type_enum:
        | 'text'
        | 'number'
        | 'date'
        | 'datetime'
        | 'boolean'
        | 'select'
        | 'multi_select'
        | 'url'
        | 'email'
        | 'phone'
        | 'currency'
        | 'percentage'
      item_status_enum: 'in_stock' | 'low_stock' | 'out_of_stock'
      notification_type_enum:
        | 'low_stock'
        | 'out_of_stock'
        | 'order_update'
        | 'pick_list_assigned'
        | 'system'
        | 'team'
        | 'alert'
        | 'welcome'
        | 'reminder_low_stock'
        | 'reminder_expiry'
        | 'reminder_restock'
      reminder_type_enum: 'low_stock' | 'expiry' | 'restock'
      reminder_recurrence_enum: 'once' | 'daily' | 'weekly' | 'monthly'
      reminder_status_enum: 'active' | 'paused' | 'triggered' | 'expired'
      comparison_operator_enum: 'lte' | 'lt' | 'gt' | 'gte' | 'eq'
      pick_list_status_enum: 'draft' | 'in_progress' | 'completed' | 'cancelled'
      po_status_enum:
        | 'draft'
        | 'submitted'
        | 'confirmed'
        | 'partial'
        | 'received'
        | 'cancelled'
      subscription_status_enum:
        | 'active'
        | 'trial'
        | 'past_due'
        | 'cancelled'
        | 'suspended'
      subscription_tier_enum: 'free' | 'starter' | 'professional' | 'enterprise'
      user_role_enum: 'owner' | 'admin' | 'editor' | 'viewer' | 'member'
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Tenant = Tables<'tenants'>
export type Profile = Tables<'profiles'>
export type Folder = Tables<'folders'>
export type InventoryItem = Tables<'inventory_items'>
export type ActivityLog = Tables<'activity_logs'>
export type Tag = Tables<'tags'>
export type ItemTag = Tables<'item_tags'>
export type Address = Tables<'addresses'>
export type Vendor = Tables<'vendors'>
export type CustomFieldDefinition = Tables<'custom_field_definitions'>
export type Alert = Tables<'alerts'>
export type Notification = Tables<'notifications'>
export type PickList = Tables<'pick_lists'>
export type PickListItem = Tables<'pick_list_items'>

// Extended type for Pick List with joined relations
export type PickListWithRelations = PickList & {
  assigned_to_profile: { id: string; full_name: string | null } | null
  created_by_profile: { id: string; full_name: string | null } | null
}
export type PurchaseOrder = Tables<'purchase_orders'>
export type PurchaseOrderItem = Tables<'purchase_order_items'>

// Extended type for PO list with joined relations
export type PurchaseOrderWithRelations = PurchaseOrder & {
  vendors: { id: string; name: string } | null
  created_by_profile: { id: string; full_name: string | null } | null
  submitted_by_profile: { id: string; full_name: string | null } | null
}
export type Checkout = Tables<'checkouts'>
export type Job = Tables<'jobs'>
export type Location = Tables<'locations'>
export type LocationStock = Tables<'location_stock'>
export type StockTransfer = Tables<'stock_transfers'>
export type Lot = Tables<'lots'>
export type ItemReminder = Tables<'item_reminders'>

// Enum types
export type ItemStatus = Database['public']['Enums']['item_status_enum']
export type UserRole = Database['public']['Enums']['user_role_enum']
export type SubscriptionTier = Database['public']['Enums']['subscription_tier_enum']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status_enum']
export type PickListStatus = Database['public']['Enums']['pick_list_status_enum']
export type POStatus = Database['public']['Enums']['po_status_enum']
export type NotificationType = Database['public']['Enums']['notification_type_enum']
export type ActivityAction = Database['public']['Enums']['activity_action_enum']
export type EntityType = Database['public']['Enums']['entity_type_enum']
export type AlertType = Database['public']['Enums']['alert_type_enum']
export type FieldType = Database['public']['Enums']['field_type_enum']
export type ReminderType = Database['public']['Enums']['reminder_type_enum']
export type ReminderRecurrence = Database['public']['Enums']['reminder_recurrence_enum']
export type ReminderStatus = Database['public']['Enums']['reminder_status_enum']
export type ComparisonOperator = Database['public']['Enums']['comparison_operator_enum']

// Checkout-related types
export type CheckoutAssigneeType = 'person' | 'job' | 'location'
export type CheckoutStatus = 'checked_out' | 'returned' | 'overdue'
export type ItemCondition = 'good' | 'damaged' | 'needs_repair' | 'lost'

// Extended checkout type with item details (for list views)
export interface CheckoutWithItem extends Checkout {
  item_name?: string
  item_sku?: string
  item_image?: string
  checked_out_by_name?: string
  days_overdue?: number
}

// Location-related types
export type LocationType = 'warehouse' | 'van' | 'store' | 'job_site'
export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled'

// Extended location type with stats (for list views)
export interface LocationWithStats extends Location {
  item_count?: number
  total_quantity?: number
}

// Extended stock transfer type with details (for list views)
export interface StockTransferWithDetails extends StockTransfer {
  item_name?: string
  item_sku?: string
  item_image?: string
  from_location_name?: string
  from_location_type?: LocationType
  to_location_name?: string
  to_location_type?: LocationType
  requested_by_name?: string
}

// AI Transfer Suggestion type
export interface TransferSuggestion {
  item_id: string
  item_name: string
  item_sku?: string
  item_image?: string
  to_location_id: string
  to_location_name: string
  to_location_type: LocationType
  current_qty: number
  min_quantity: number
  from_location_id: string
  from_location_name: string
  from_location_type: LocationType
  available_qty: number
  suggested_qty: number
  reason: string
}

// Location inventory item type
export interface LocationInventoryItem {
  item_id: string
  item_name: string
  sku?: string
  quantity: number
  min_quantity: number
  item_image?: string
  location_status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

// Item location distribution type
export interface ItemLocationDistribution {
  location_id: string
  location_name: string
  location_type: LocationType
  quantity: number
  min_quantity: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

// Lot-related types
export type LotStatus = 'active' | 'expired' | 'depleted' | 'blocked'
export type ItemTrackingMode = 'none' | 'serialized' | 'lot_expiry'
export type ExpiryUrgency = 'expired' | 'critical' | 'warning' | 'upcoming' | 'ok' | 'no_expiry'

// Extended lot type with computed fields
export interface LotWithDetails extends Lot {
  location_name?: string
  days_until_expiry?: number | null
  expiry_status?: ExpiryUrgency
  item_name?: string
  item_sku?: string
  item_image?: string
}

// Expiring lots summary for dashboard
export interface ExpiringLotsSummary {
  expired_count: number
  expiring_7_days: number
  expiring_30_days: number
  total_value_at_risk: number
}

// FEFO picking suggestion
export interface FEFOSuggestion {
  lot_id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  available_quantity: number
  location_id: string | null
  location_name: string | null
  pick_quantity: number
}

// Shipping dimensions type
export interface ShippingDimensions {
  weight: number | null
  weight_unit: string
  length: number | null
  width: number | null
  height: number | null
  dimension_unit: string
}

// Reminder-related types
export interface ItemReminderWithDetails extends ItemReminder {
  created_by_name?: string
  trigger_description?: string
  // Fields for folder reminders displayed on item pages
  source_type?: 'item' | 'folder'
  folder_id?: string | null
  folder_name?: string | null
}

// Reminder form input type
export interface CreateReminderInput {
  itemId: string
  reminderType: ReminderType
  title?: string
  message?: string
  threshold?: number
  comparisonOperator?: ComparisonOperator
  daysBeforeExpiry?: number
  scheduledAt?: string
  recurrence?: ReminderRecurrence
  recurrenceEndDate?: string
  notifyInApp?: boolean
  notifyEmail?: boolean
  notifyUserIds?: string[]
}
