import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Server-side Supabase client with enhanced cookie handling
export const createServerSupabase = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // Handle the case where cookies can't be set (e.g., in middleware)
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to set cookie:", name, error);
          }
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // Handle the case where cookies can't be removed
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to remove cookie:", name, error);
          }
        }
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

// Get user from server with session validation
export const getServerUser = async () => {
  try {
    const supabase = await createServerSupabase();

    // First check if we have a session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      if (process.env.NODE_ENV === "development") {
        console.error("Session error:", sessionError);
      }
      return null;
    }

    if (!session) {
      return null;
    }

    // If we have a session, get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      if (process.env.NODE_ENV === "development") {
        console.error("User error:", userError);
      }
      return null;
    }

    return user;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Server auth error:", error);
    }
    return null;
  }
};

// Get user profile from server
export const getServerUserProfile = async (userId: string) => {
  try {
    const supabase = await createServerSupabase();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching server profile:", error);
      }
      return null;
    }

    return profile;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Server profile error:", error);
    }
    return null;
  }
};
