import { NextResponse, NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, isFeatured } = body;

    if (!productId || typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: "Missing required fields: productId, isFeatured" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Update product featured status
    const { data, error } = await supabase
      .from("products")
      .update({ is_featured: isFeatured })
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update product featured status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Product ${isFeatured ? 'marked as featured' : 'unfeatured'} successfully`,
      product: data,
    });
  } catch (error) {
    console.error("Featured products API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Get all featured products
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        is_featured,
        is_active,
        created_at,
        categories (
          name
        )
      `)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: data || [],
      featuredCount: data?.filter(p => p.is_featured).length || 0,
    });
  } catch (error) {
    console.error("Featured products GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 