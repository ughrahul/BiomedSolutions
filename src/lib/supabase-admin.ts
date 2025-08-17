import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
export const createAdminSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase admin client: Missing environment variables");
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
};

// Initialize first admin user
export async function initializeAdminUser() {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    console.log("Supabase not configured - skipping admin user initialization");
    return;
  }

  try {
    // Check if admin user already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", "admin@biomed.com")
      .single();

    if (existingProfile) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: "admin@biomed.com",
        password: "demo123",
        email_confirm: true,
        user_metadata: {
          full_name: "Admin User",
          role: "admin",
        },
      });

    if (authError) {
      console.error("Error creating admin user:", authError);
      return;
    }

    // Create admin profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authUser.user.id,
      email: "admin@biomed.com",
      full_name: "Admin User",
      role: "admin",
    });

    if (profileError) {
      console.error("Error creating admin profile:", profileError);
      return;
    }

    // Create admin settings
    const { error: settingsError } = await supabase
      .from("admin_settings")
      .insert({
        user_id: authUser.user.id,
        company_name: "Biomed Solutions",
        company_address:
          "Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal",
        company_phone: "+977-980-120-335",
        company_email: "info@annapurnahospitals.com",
      });

    if (settingsError) {
      console.error("Error creating admin settings:", settingsError);
    }

    console.log("Admin user initialized successfully");
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}
