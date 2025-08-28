import { NextResponse, NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { CreateContactMessage } from "@/types/message";
import { serverLogger } from "@/lib/logger";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Please check your Supabase environment variables.",
        },
        { status: 500 }
      );
    }

    // Try to fetch messages
    const { data: messages, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    // If table doesn't exist, provide helpful error message
    if (error && error.code === "42P01") {
      serverLogger.log("📋 Contact messages table doesn't exist");
      return NextResponse.json(
        {
          error:
            "Contact messages table not found. Please create the table manually in Supabase SQL Editor using the provided script.",
          setupInstructions: {
            step1: "Go to Supabase Dashboard → SQL Editor",
            step2: "Run the complete-setup.sql script",
            step3: "Refresh this page",
          },
        },
        { status: 404 }
      );
    } else if (error) {
      serverLogger.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: messages || [],
      total: messages?.length || 0,
    });
  } catch (error) {
    serverLogger.error("Contact API GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, organization, message } =
      body as CreateContactMessage & { phone?: string; organization?: string };

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ Supabase admin client not available");
      }
      return NextResponse.json(
        { error: "Database connection not available. Please try again later." },
        { status: 500 }
      );
    }

    // Check if contact_messages table exists and create if needed
    try {
      const { error: tableCheckError } = await supabase
        .from("contact_messages")
        .select("id")
        .limit(1);

      if (tableCheckError && tableCheckError.code === "42P01") {
        // Table doesn't exist, create it
        serverLogger.log("📋 Creating contact_messages table...");
        const { error: createTableError } = await supabase.rpc(
          "create_contact_messages_table"
        );
        if (createTableError) {
          serverLogger.error(
            "❌ Failed to create contact_messages table:",
            createTableError
          );
          return NextResponse.json(
            {
              error: "Database setup incomplete. Please contact administrator.",
            },
            { status: 500 }
          );
        }
      }
    } catch (tableError) {
      serverLogger.warn(
        "⚠️ Table check failed, proceeding with insert:",
        tableError
      );
    }

    // Insert message into database with enhanced data
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() || null,
          organization: organization?.trim() || null,
          message: message.trim(),
          status: "unread",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      serverLogger.error("❌ Database error inserting inquiry:", error);

      // Provide more specific error messages
      if (error.code === "23505") {
        return NextResponse.json(
          {
            error:
              "A message with this email already exists. Please wait before sending another.",
          },
          { status: 400 }
        );
      } else if (error.code === "23514") {
        return NextResponse.json(
          {
            error:
              "Invalid data provided. Please check your input and try again.",
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            error: "Failed to send message. Please try again in a few moments.",
          },
          { status: 500 }
        );
      }
    }

    // Log successful submission for admin monitoring
    serverLogger.log(`✅ New inquiry received from ${email}`);

    // Send real-time notification to admin dashboard
    try {
      await supabase.channel("admin-notifications").send({
        type: "broadcast",
        event: "new-inquiry",
        payload: {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (notificationError) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "⚠️ Failed to send real-time notification:",
          notificationError
        );
      }
    }

    return NextResponse.json({
      message:
        "Message sent successfully! We'll get back to you within 24 hours.",
      data: data[0],
      success: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Contact API error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
