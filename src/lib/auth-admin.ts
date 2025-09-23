import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { serverLogger } from "@/lib/logger";

// Admin-level authentication functions that bypass RLS
export async function createProfileWithAdmin(
  userId: string,
  email: string,
  userMetadata?: any
) {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    throw new Error("Admin client not available");
  }

  try {
    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (existingProfile) {
      serverLogger.log(`✅ Profile already exists for user ${userId}`);
      return existingProfile;
    }

    // Create new profile with admin client (bypasses RLS)
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        email: email,
        full_name: userMetadata?.full_name || email.split("@")[0] || "User",
        is_active: true,
        role: "admin",
        access_level: "primary",
        login_count: 0,
        last_login: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      serverLogger.error("Admin profile creation error:", error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    serverLogger.log(`✅ Created profile for user ${userId}`);
    return data;
  } catch (error) {
    serverLogger.error("Admin profile creation failed:", error);
    throw error;
  }
}


