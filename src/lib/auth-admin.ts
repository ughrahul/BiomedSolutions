import { createAdminSupabaseClient } from "@/lib/supabase-admin";

// Admin-level authentication functions that bypass RLS
export async function createProfileWithAdmin(userId: string, email: string, userMetadata?: any) {
  const supabase = createAdminSupabaseClient();
  
  if (!supabase) {
    throw new Error("Admin client not available");
  }

  try {
    // Use admin client to create profile (bypasses RLS)
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        email: email,
        full_name: userMetadata?.full_name || email.split("@")[0] || "User",
        is_active: true,
        role: "admin",
        access_level: "primary",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Admin profile creation error:", error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Admin profile creation failed:", error);
    throw error;
  }
}

export async function getProfileWithAdmin(userId: string) {
  const supabase = createAdminSupabaseClient();
  
  if (!supabase) {
    throw new Error("Admin client not available");
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Admin profile fetch error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Admin profile fetch failed:", error);
    return null;
  }
}

export async function upsertProfileWithAdmin(userId: string, email: string, userMetadata?: any) {
  const supabase = createAdminSupabaseClient();
  
  if (!supabase) {
    throw new Error("Admin client not available");
  }

  try {
    // Use admin client to upsert profile (bypasses RLS)
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        email: email,
        full_name: userMetadata?.full_name || email.split("@")[0] || "User",
        is_active: true,
        role: "admin",
        access_level: "primary",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error("Admin profile upsert error:", error);
      throw new Error(`Failed to upsert profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Admin profile upsert failed:", error);
    throw error;
  }
}
