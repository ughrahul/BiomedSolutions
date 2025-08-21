import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Check if contact_messages table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from("contact_messages")
      .select("id")
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, create it using raw SQL
      console.log("📋 Creating contact_messages table...");
      
      // Try to create table by inserting a dummy record
      // This will trigger table creation if it doesn't exist
      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert([{
          name: "Test User",
          email: "test@example.com",
          subject: "Test Message",
          message: "This is a test message to create the table",
          status: "unread",
          source: "setup"
        }]);
      
      if (insertError) {
        console.error("Failed to create table via insert:", insertError);
        return NextResponse.json(
          { error: "Failed to create contact_messages table. Please run the SQL script manually in Supabase." },
          { status: 500 }
        );
      }
      
      // Delete the test record
      await supabase
        .from("contact_messages")
        .delete()
        .eq("email", "test@example.com");
    } else if (checkError) {
      console.error("Error checking table:", checkError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    console.log("✅ Database setup completed successfully");
    return NextResponse.json({
      message: "Database setup completed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { error: "Database setup failed" },
      { status: 500 }
    );
  }
}
