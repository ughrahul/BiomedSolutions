import { NextResponse, NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        {
          error:
            "Database not configured. Please set up Supabase environment variables.",
        },
        { status: 500 }
      );
    }

    // Get inventory history with product details
    const { data: history, error } = await supabase
      .from("inventory_history")
      .select(
        `
        *,
        products:product_id (
          id,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch inventory history" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedHistory =
      history?.map((entry) => ({
        id: entry.id,
        product_id: entry.product_id,
        product_name: entry.products?.name || "Unknown Product",
        user_id: entry.user_id,
        user_name: "Admin User", // For now, hardcoded since we don't have user context
        action: entry.action,
        old_values: entry.old_values,
        new_values: entry.new_values,
        description: entry.description,
        created_at: entry.created_at,
      })) || [];

    return NextResponse.json({
      history: transformedHistory,
      total: transformedHistory.length,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
