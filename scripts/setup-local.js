#!/usr/bin/env node

/**
 * Quick Local Setup Script for Biomed Solutions
 * This script helps set up the project for local development
 */

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

async function setupLocal() {
  try {
    console.log("🚀 Setting up local development environment...");

    // Step 1: Clean up duplicate profiles
    console.log("\n📋 Step 1: Cleaning up duplicate profiles...");
    
    // Get all profiles
    const { data: allProfiles, error: fetchError } = await supabase
      .from("profiles")
      .select("*");

    if (fetchError) {
      console.error("❌ Error fetching profiles:", fetchError.message);
      return;
    }

    if (allProfiles && allProfiles.length > 0) {
      console.log(`Found ${allProfiles.length} total profiles`);
      
      // Group by user_id to find duplicates
      const profileGroups = {};
      allProfiles.forEach(profile => {
        if (!profileGroups[profile.user_id]) {
          profileGroups[profile.user_id] = [];
        }
        profileGroups[profile.user_id].push(profile);
      });

      // Find users with multiple profiles
      const usersWithDuplicates = Object.keys(profileGroups).filter(
        userId => profileGroups[userId].length > 1
      );

      if (usersWithDuplicates.length > 0) {
        console.log(`Found ${usersWithDuplicates.length} users with duplicate profiles`);
        
        // Keep only the most recent profile for each user
        for (const userId of usersWithDuplicates) {
          const profiles = profileGroups[userId];
          profiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          
          // Delete all but the most recent profile
          const profilesToDelete = profiles.slice(1);
          for (const profile of profilesToDelete) {
            const { error: deleteError } = await supabase
              .from("profiles")
              .delete()
              .eq("id", profile.id);
            
            if (deleteError) {
              console.error(`❌ Error deleting profile ${profile.id}:`, deleteError.message);
            } else {
              console.log(`✅ Deleted duplicate profile for user ${userId}`);
            }
          }
        }
      } else {
        console.log("✅ No duplicate profiles found");
      }
    }

    // Step 2: Ensure all profiles have required fields
    console.log("\n📋 Step 2: Ensuring all profiles have required fields...");
    
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("❌ Error fetching profiles:", profilesError.message);
      return;
    }

    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        const updates = {};
        let needsUpdate = false;

        if (!profile.is_active) {
          updates.is_active = true;
          needsUpdate = true;
        }
        if (!profile.role) {
          updates.role = "admin";
          needsUpdate = true;
        }
        if (!profile.access_level) {
          updates.access_level = "primary";
          needsUpdate = true;
        }
        if (profile.login_count === null || profile.login_count === undefined) {
          updates.login_count = 0;
          needsUpdate = true;
        }
        if (!profile.created_at) {
          updates.created_at = new Date().toISOString();
          needsUpdate = true;
        }

        if (needsUpdate) {
          updates.updated_at = new Date().toISOString();
          
          const { error: updateError } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", profile.id);

          if (updateError) {
            console.error(`❌ Error updating profile ${profile.id}:`, updateError.message);
          } else {
            console.log(`✅ Updated profile for user ${profile.user_id}`);
          }
        }
      }
    }

    // Step 3: Create admin users if they don't exist
    console.log("\n📋 Step 3: Creating admin users...");
    
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
        // Check if user exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === admin.email);

        let user = existingUser;

        if (!existingUser) {
          // Create user in auth
          const { data: newUser, error: userError } =
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
              `⚠️  Error creating user ${admin.email}: ${userError.message}`
            );
            continue;
          } else {
            user = newUser;
            console.log(`✅ User ${admin.email} created successfully`);
          }
        } else {
          console.log(`✅ User ${admin.email} already exists`);
        }

        // Create or update profile
        if (user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              user_id: user.id,
              email: admin.email,
              full_name: admin.full_name,
              is_active: true,
              role: "admin",
              access_level: "primary",
              login_count: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id'
            });

          if (profileError) {
            console.log(
              `⚠️  Profile error for ${admin.email}: ${profileError.message}`
            );
          } else {
            console.log(`✅ Profile created/updated for ${admin.email}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Error processing user ${admin.email}: ${error.message}`);
      }
    }

    // Step 4: Final verification
    console.log("\n📋 Step 4: Final verification...");
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from("profiles")
      .select("*");

    if (finalError) {
      console.error("❌ Error fetching final profiles:", finalError.message);
    } else {
      console.log(`✅ Setup completed! Total profiles: ${finalProfiles.length}`);
      
      // Show profile summary
      console.log("\n📊 Profile Summary:");
      finalProfiles.forEach(profile => {
        console.log(`   - ${profile.email} (${profile.full_name}) - ${profile.role}`);
      });
    }

    console.log("\n✅ Local setup completed successfully!");
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
    console.log("💡 All users have equal admin rights - single profile per user.");

  } catch (error) {
    console.error("❌ Error during setup:", error.message);
    process.exit(1);
  }
}

// Run the setup
setupLocal(); 