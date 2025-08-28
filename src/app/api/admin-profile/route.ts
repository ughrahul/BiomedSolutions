import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

// Add console for logging
const console = globalThis.console;

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get the current user's session to determine which admin profile to return
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting current user:", authError);
      }
      return NextResponse.json(
        {
          error: "User not authenticated",
          details: "Please login to access admin features",
        },
        { status: 401 }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Current user:", user.email);
    }

    // Get the specific profile for the current user
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user profile:", error);
      }
      return NextResponse.json(
        {
          error: "Failed to fetch profile",
          details: "Profile not found for this user",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in GET /api/admin-profile:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { full_name, avatar_url } = body;

    // Validate input
    if (!full_name || typeof full_name !== "string") {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    // Get the current user's session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting current user:", authError);
      }
      return NextResponse.json(
        {
          error: "User not authenticated",
          details: "Please login to update your profile",
        },
        { status: 401 }
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Updating profile for:", user.email);
    }

    // Update the specific user's profile
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error updating user profile:", error);
      }
      return NextResponse.json(
        {
          error: "Failed to update profile",
          details: "Profile update failed. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
      message: "Profile updated successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in PUT /api/admin-profile:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
