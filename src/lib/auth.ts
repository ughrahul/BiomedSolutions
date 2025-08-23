import { createClientSupabase } from "@/lib/supabase";
import { createProfileWithAdmin, getProfileWithAdmin, upsertProfileWithAdmin } from "@/lib/auth-admin";

// Client-side auth functions with session validation
export async function getCurrentUser() {
  const supabase = createClientSupabase();

  if (!supabase) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createClientSupabase();

  if (!supabase) {
    return null;
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

export async function requireAuth() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      window.location.href = "/auth/login";
      return null;
    }

    const profile = await getUserProfile(user.id);

    if (!profile || !profile.is_active) {
      window.location.href = "/auth/login";
      return null;
    }

    return { user, profile };
  } catch (error) {
    console.error("Auth error:", error);
    window.location.href = "/auth/login";
    return null;
  }
}

export async function signOut() {
  const supabase = createClientSupabase();
  
  if (!supabase) {
    console.error("Supabase client not available");
    return;
  }

  if (!supabase) {
    console.log("Supabase not configured - cannot sign out");
    return { error: "Authentication not configured" };
  }

  try {
    // Update last login time before signing out
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({
          last_login: new Date().toISOString(),
          login_count: supabase.rpc("increment", { row: "login_count" }),
        })
        .eq("user_id", user.id);
    }

    const { error } = await supabase.auth.signOut();

    // Clear all local storage and session storage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();

      // Clear any cached data
      window.location.href = "/auth/login";
    }

    // Dispatch custom event for auth state change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-state-changed"));
    }

    return { error };
  } catch (error) {
    console.error("Signout error:", error);
    return { error };
  }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClientSupabase();

  if (!supabase) {
    console.error("Supabase client not available");
    return { user: null, error: "Database connection not available", success: false };
  }

  try {
    console.log(`🔐 Attempting to sign in user: ${email}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`❌ Auth error for ${email}:`, error.message);
      return { user: null, error: error.message, success: false };
    }

    if (data.user) {
      console.log(
        `✅ User authenticated: ${data.user.email} (ID: ${data.user.id})`
      );

      // Check if user profile exists
      let profile = null;
      try {
        // Get single profile for user
        const { data: fetchedProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .single();
        
        if (fetchError) {
          console.log(`🔧 No profile found for ${email}, creating one...`);
          
          // Create profile with admin client to bypass RLS
          try {
            const adminProfile = await createProfileWithAdmin(
              data.user.id,
              data.user.email || email,
              data.user.user_metadata
            );
            
            if (adminProfile) {
              profile = adminProfile;
              console.log(`✅ Created profile for ${email}`);
            } else {
              throw new Error("Failed to create profile");
            }
          } catch (adminError) {
            console.error(`❌ Failed to create profile for ${email}:`, adminError);
            await supabase.auth.signOut();
            return {
              user: null,
              error: "Failed to create user profile. Please contact administrator.",
              success: false,
            };
          }
        } else {
          profile = fetchedProfile;
          console.log(`✅ Found profile for ${email}`);
        }
      } catch (e) {
        console.error(`❌ Profile error for ${email}:`, e);
        await supabase.auth.signOut();
        return {
          user: null,
          error: "Profile error. Please contact administrator.",
          success: false,
        };
      }

      if (!profile) {
        console.error(`❌ No profile found for ${email}`);
        await supabase.auth.signOut();
        return {
          user: null,
          error: "User profile not found. Please contact administrator.",
          success: false,
        };
      }

      if (!profile.is_active) {
        console.error(`❌ Inactive profile for ${email}`);
        await supabase.auth.signOut();
        return {
          user: null,
          error: "Account is not active. Please contact administrator.",
          success: false,
        };
      }

      console.log(`✅ Profile validated for ${email}:`, {
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
      });

      // Update login count and last login time
      try {
        await supabase
          .from("profiles")
          .update({
            last_login: new Date().toISOString(),
            login_count: (profile.login_count || 0) + 1,
          })
          .eq("user_id", data.user.id);
        console.log(`✅ Updated login stats for ${email}`);
      } catch (updateError) {
        console.warn(
          `⚠️  Failed to update login stats for ${email}:`,
          updateError
        );
        // Don't fail the login for this error
      }

      // Dispatch custom event for auth state change
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-state-changed"));
      }

      return {
        user: data.user,
        profile: profile,
        error: null,
        success: true,
      };
    }

    console.error(`❌ No user data returned for ${email}`);
    return { user: null, error: "Authentication failed", success: false };
  } catch (error) {
    console.error(`❌ Sign in error for ${email}:`, error);
    return { user: null, error: "Authentication failed", success: false };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = createClientSupabase();

  if (!supabase) {
    return { user: null, error: "Authentication not configured" };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error("Sign up error:", error);
    return { user: null, error: "Registration failed" };
  }
}

export async function resetPassword(email: string) {
  const supabase = createClientSupabase();

  if (!supabase) {
    return { error: "Authentication not configured" };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Password reset failed" };
  }
}

export async function updatePassword(password: string) {
  const supabase = createClientSupabase();

  if (!supabase) {
    return { error: "Authentication not configured" };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("Update password error:", error);
    return { error: "Password update failed" };
  }
}
