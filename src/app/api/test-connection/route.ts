import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        status: "error",
        message: "Supabase not configured",
        details: "Check your environment variables",
      });
    }

    // Test database connection
    const { data: products, error } = await supabase
      .from("products")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: "error",
        message: "Database connection failed",
        details: error.message,
      });
    }

    // Test auth connection
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      details: {
        database: "Connected",
        auth: authError ? "Error" : "Connected",
        productsCount: products?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
