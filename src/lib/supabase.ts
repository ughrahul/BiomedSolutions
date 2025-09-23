import { createBrowserClient } from "@supabase/ssr";
import { logger } from "@/lib/logger";
import { env } from "@/lib/env";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client-side Supabase client with enhanced configuration
export const createClientSupabase = () => {
  // Return null if environment variables are not configured
  if (env.isDemoMode()) {
    logger.log("🎭 Demo mode: Supabase environment variables not configured");
    return null;
  }

  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        headers: {
          "x-my-custom-header": "biomed-app",
        },
      },
    });

    // Add error handling for refresh token issues
    if (typeof window !== "undefined") {
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          logger.log("✅ Token refreshed successfully");
        }
      });
    }

    return client;
  } catch (error) {
    logger.error("Failed to create Supabase client:", error);
    return null;
  }
};

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          role: "admin" | "user";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          email: string;
          avatar_url?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          email?: string;
          avatar_url?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          slug: string;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          slug?: string;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          short_description: string | null;
          full_description: string | null;
          sku: string;
          category_id: string | null;
          images: string[];
          specifications: Record<string, any> | null;
          features: string[];
          benefits: string[];
          warranty: string;
          certifications: string[];
          rating: number;
          review_count: number;
          tags: string[];
          is_active: boolean;
          is_featured: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          short_description?: string | null;
          full_description?: string | null;
          sku: string;
          category_id?: string | null;
          images?: string[];
          specifications?: Record<string, any> | null;
          features?: string[];
          benefits?: string[];
          warranty?: string;
          certifications?: string[];
          rating?: number;
          review_count?: number;
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          short_description?: string | null;
          full_description?: string | null;
          sku?: string;
          category_id?: string | null;
          images?: string[];
          specifications?: Record<string, any> | null;
          features?: string[];
          benefits?: string[];
          warranty?: string;
          certifications?: string[];
          rating?: number;
          review_count?: number;
          tags?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          total_amount: number;
          shipping_address: Record<string, any>;
          billing_address: Record<string, any>;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          total_amount: number;
          shipping_address: Record<string, any>;
          billing_address: Record<string, any>;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          total_amount?: number;
          shipping_address?: Record<string, any>;
          billing_address?: Record<string, any>;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          organization: string | null;
          message: string;
          status: "unread" | "read" | "responded" | "resolved";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          organization?: string | null;
          message: string;
          status?: "unread" | "read" | "responded" | "resolved";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          organization?: string | null;
          message?: string;
          status?: "unread" | "read" | "responded" | "resolved";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      website_settings: {
        Row: {
          id: string;
          key: string;
          value: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
