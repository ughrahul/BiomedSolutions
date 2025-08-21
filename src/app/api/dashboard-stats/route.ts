import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get products count
    const { count: productsCount, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (productsError) {
      console.error("Error fetching products count:", productsError);
    }

    // Get contact messages count
    const { count: messagesCount, error: messagesError } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true });

    if (messagesError) {
      console.error("Error fetching messages count:", messagesError);
    }

    return NextResponse.json({
      totalProducts: productsCount || 0,
      totalMessages: messagesCount || 0,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
