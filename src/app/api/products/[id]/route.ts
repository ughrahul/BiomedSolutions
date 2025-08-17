import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      // Demo mode
      const mockProduct = {
        id,
        name: "Advanced Patient Monitor",
        description: "State-of-the-art patient monitoring system",
        short_description: "AI-powered patient monitoring",

        sku: "APM-2024-001",
        stock_quantity: 15,
        category_id: "monitoring",
        features: ["Real-time Monitoring", "AI Analytics"],
        specifications: [{ name: "Display", value: "15-inch HD" }],
        is_active: true,
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({ data: mockProduct });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      // Demo mode
      return NextResponse.json({
        message: "Product updated successfully (demo mode)",
        data: { id, ...body },
      });
    }

    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product updated successfully",
      data: data[0],
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      // Demo mode
      return NextResponse.json({
        message: "Product deleted successfully (demo mode)",
      });
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
