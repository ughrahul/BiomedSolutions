import { NextResponse } from "next/server";
import { initializeAdminUser } from "@/lib/supabase-admin";

export async function POST() {
  try {
    await initializeAdminUser();

    return NextResponse.json({
      message: "Admin user initialization completed",
      success: true,
    });
  } catch (error) {
    console.error("Admin initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize admin user" },
      { status: 500 }
    );
  }
}
