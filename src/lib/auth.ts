import { createClientSupabase } from "@/lib/supabase";
import { createProfileWithAdmin, getProfileWithAdmin, upsertProfileWithAdmin } from "@/lib/auth-admin";

// Client-side auth functions with session validation
export async function getCurrentUser() {
  try {
    const supabase = createClientSupabase();
    
    if (!supabase) {
      console.error("Supabase client not available");
      return null;
    }
    
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Session error:", sessionError);
      return null;
    }

    // If no session, return null instead of trying to get user
    if (!session) {
      return null;
    }

    // Only call getUser if we have a valid session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    // Validate userId before proceeding
    if (!userId) {
      console.error("No userId provided for profile lookup");
      return null;
    }

    const supabase = createClientSupabase();
    
    if (!supabase) {
      console.error("Supabase client not available");
      return null;
    }
    
    // Check session before making database queries
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session for profile lookup");
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Profile error:", error);
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

      // Check if user profile exists and is active
      let profile = null;
      let profileError = null;
      try {
        // Use array fetch instead of single to handle multiple profiles
        const { data: fetchedProfiles, error: fetchError } = await supabase
          .from("profiles")
          .select(
            "role, access_level, is_active, full_name, employee_id, department, position"
          )
          .eq("user_id", data.user.id);
        
        if (fetchError) {
          profileError = fetchError;
        } else if (fetchedProfiles && fetchedProfiles.length > 0) {
          // If multiple profiles exist, use the first one (most recent)
          profile = fetchedProfiles[0];
          console.log(`✅ Found ${fetchedProfiles.length} profile(s) for ${email}, using first one`);
        } else {
          // No profile found
          profileError = { code: "PGRST116", message: "No profile found" };
        }
      } catch (e) {
        profileError = e;
      }

      if (profileError) {
        console.error(
          `❌ Profile error for ${email}:`,
          (profileError as any).message
        );

        // If profile doesn't exist, try to create one
        if ((profileError as any).code === "PGRST116") {
          console.log(`🔧 Creating missing profile for ${email}...`);

          // Try to create profile with a more robust approach
          const profileData = {
            user_id: data.user.id,
            email: data.user.email,
            full_name:
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            is_active: true,
            role: "admin",
            access_level: "primary",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          let profileCreated = false;

          // First try with upsert to handle any existing records
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert(profileData, {
              onConflict: 'user_id',
              ignoreDuplicates: false
            });

          if (upsertError) {
            console.error(
              `❌ Failed to upsert profile for ${email}:`,
              upsertError.message
            );
            
            // If upsert fails, try direct insert
            const { error: insertError } = await supabase
              .from("profiles")
              .insert(profileData);

            if (insertError) {
              console.error(
                `❌ Failed to create profile for ${email}:`,
                insertError.message
              );
              
              // Final fallback: Use admin client to bypass RLS
              try {
                console.log(`🔧 Trying admin client fallback for ${email}...`);
                const adminProfile = await upsertProfileWithAdmin(
                  data.user.id,
                  data.user.email || email,
                  data.user.user_metadata
                );
                
                if (adminProfile) {
                  profile = adminProfile;
                  profileCreated = true;
                  console.log(`✅ Created profile using admin client for ${email}`);
                }
              } catch (adminError) {
                console.error(
                  `❌ Admin client fallback failed for ${email}:`,
                  adminError
                );
                await supabase.auth.signOut();
                return {
                  user: null,
                  error:
                    "Failed to create user profile. Please contact administrator.",
                  success: false,
                };
              }
            } else {
              profileCreated = true;
            }
          } else {
            profileCreated = true;
          }

          // If profile was created successfully, fetch it
          if (profileCreated && !profile) {
            // Try to fetch the newly created profile
            const { data: newProfiles, error: fetchError } = await supabase
              .from("profiles")
              .select(
                "role, access_level, is_active, full_name, employee_id, department, position"
              )
              .eq("user_id", data.user.id);

            if (fetchError || !newProfiles || newProfiles.length === 0) {
              console.error(
                `❌ Failed to fetch new profile for ${email}:`,
                fetchError?.message
              );
              
              // Try admin client to fetch profile
              try {
                const adminProfile = await getProfileWithAdmin(data.user.id);
                if (adminProfile) {
                  profile = adminProfile;
                  console.log(`✅ Fetched profile using admin client for ${email}`);
                } else {
                  await supabase.auth.signOut();
                  return {
                    user: null,
                    error: "Profile creation failed. Please contact administrator.",
                    success: false,
                  };
                }
              } catch (adminError) {
                console.error(
                  `❌ Admin client fetch failed for ${email}:`,
                  adminError
                );
                await supabase.auth.signOut();
                return {
                  user: null,
                  error: "Profile creation failed. Please contact administrator.",
                  success: false,
                };
              }
            } else {
              profile = newProfiles[0];
              console.log(`✅ Created and fetched profile for ${email}`);
            }
          }
        } else {
          await supabase.auth.signOut();
          return {
            user: null,
            error: "Profile error: " + (profileError as any).message,
            success: false,
          };
        }
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
            login_count: supabase.rpc("increment", { row: "login_count" }),
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
