import { NextResponse, NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { CreateContactMessage } from "@/types/message";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data: messages, error } = await supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: messages || [],
      total: messages?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, organization, subject, message } =
      body as CreateContactMessage & { phone?: string; organization?: string };

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, message" },
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
      return NextResponse.json(
        { error: "Database connection not available. Please try again later." },
        { status: 500 }
      );
    }

    // Insert message into database with enhanced data
    const { data, error } = await supabase
      .from("inquiries")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() || null,
          company: organization?.trim() || null,
          subject: subject.trim(),
          message: message.trim(),
          status: "unread",
          source: "website",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Database error inserting inquiry:", error);
      return NextResponse.json(
        { error: "Failed to send message. Our team has been notified. Please try again later." },
        { status: 500 }
      );
    }

    // Log successful submission for admin monitoring
    console.log(`✅ New inquiry received from ${email} - ${subject}`);

    return NextResponse.json({
      message: "Message sent successfully! We'll get back to you within 24 hours.",
      data: data[0],
      success: true,
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
