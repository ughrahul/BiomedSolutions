import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Utility function to handle auth session missing errors
function isAuthSessionMissingError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  return errorMessage.toLowerCase().includes('auth session missing') ||
         errorMessage.toLowerCase().includes('authsessionmissingerror');
}

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
      // Handle specific auth session missing error
      if (isAuthSessionMissingError(sessionError)) {
        if (process.env.NODE_ENV === "development") {
          // No active session - user not authenticated
        }
        return null;
      }
      if (process.env.NODE_ENV === "development") {
        // Session error occurred
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
      // Handle specific auth session missing error
      if (isAuthSessionMissingError(userError)) {
        if (process.env.NODE_ENV === "development") {
          // No active session - user not authenticated
        }
        return null;
      }
      if (process.env.NODE_ENV === "development") {
        // User error occurred
      }
      return null;
    }

    return user;
  } catch (error) {
    // Handle any other errors gracefully
    if (isAuthSessionMissingError(error)) {
      if (process.env.NODE_ENV === "development") {
        // No active session - user not authenticated
      }
      return null;
    }
          if (process.env.NODE_ENV === "development") {
        // Server auth error occurred
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
        // Error fetching server profile
      }
      return null;
    }

    return profile;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      // Server profile error occurred
    }
    return null;
  }
};
