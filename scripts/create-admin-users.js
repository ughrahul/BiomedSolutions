const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nPlease check your .env.local file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUsers() {
  try {
    console.log("🚀 Creating admin users...");

    const adminUsers = [
      {
        email: "admin1@biomed.com",
        password: "admin123",
        full_name: "Admin User 1",
      },
      {
        email: "admin2@biomed.com",
        password: "admin123",
        full_name: "Admin User 2",
      },
      {
        email: "admin3@biomed.com",
        password: "admin123",
        full_name: "Admin User 3",
      },
    ];

    for (const admin of adminUsers) {
      try {
        // Create user in auth
        const { data: user, error: userError } =
          await supabase.auth.admin.createUser({
            email: admin.email,
            password: admin.password,
            email_confirm: true,
            user_metadata: {
              full_name: admin.full_name,
            },
          });

        if (userError) {
          console.log(
            `⚠️  User ${admin.email} might already exist: ${userError.message}`
          );
        } else {
          console.log(`✅ User ${admin.email} created successfully`);
        }

        // Update profile with basic information
        if (user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              full_name: admin.full_name,
              is_active: true,
            })
            .eq("user_id", user.id);

          if (profileError) {
            console.log(
              `⚠️  Profile update error for ${admin.email}: ${profileError.message}`
            );
          } else {
            console.log(`✅ Profile updated for ${admin.email}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Error creating user ${admin.email}: ${error.message}`);
      }
    }

    // Create admin settings for each user
    console.log("📝 Creating admin settings...");

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id")
      .in(
        "email",
        adminUsers.map((u) => u.email)
      );

    if (profilesError) {
      console.log("⚠️  Error fetching profiles:", profilesError.message);
    } else if (profiles && profiles.length > 0) {
      const adminSettings = profiles.map((profile) => ({
        user_id: profile.user_id,
        company_name: "Biomed Solutions",
        company_address:
          "Annapurna Neurological Institute, Maitighar, Kathmandu, Nepal",
        company_phone: "+977-980-120-335",
        company_email: "info@annapurnahospitals.com",
      }));

      const { error: settingsError } = await supabase
        .from("admin_settings")
        .upsert(adminSettings, { onConflict: "user_id" });

      if (settingsError) {
        console.log("⚠️  Admin settings error:", settingsError.message);
      } else {
        console.log("✅ Admin settings created");
      }
    }

    console.log("✅ Admin users setup completed!");
    console.log("\n📋 Admin Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👤 Admin 1:");
    console.log("   Email: admin1@biomed.com");
    console.log("   Password: admin123");
    console.log("");
    console.log("👤 Admin 2:");
    console.log("   Email: admin2@biomed.com");
    console.log("   Password: admin123");
    console.log("");
    console.log("👤 Admin 3:");
    console.log("   Email: admin3@biomed.com");
    console.log("   Password: admin123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 You can now login at: http://localhost:3000/auth/login");
    console.log("💡 All users have equal admin rights - no role restrictions.");
  } catch (error) {
    console.error("❌ Error creating admin users:", error.message);
    process.exit(1);
  }
}

// Run the setup
createAdminUsers();
