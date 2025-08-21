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
    console.log("🚀 Starting product update...");
    
    const { id } = await params;
    const body = await request.json();
    console.log("📦 Received update data:", JSON.stringify(body, null, 2));

    // Validate request body
    if (!body || typeof body !== 'object') {
      console.error("❌ Invalid request body");
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Extract all possible fields
    const {
      name,
      description,
      short_description,
      full_description,
      sku,
      category_id,
      images,
      specifications,
      features,
      benefits,
      warranty,
      certifications,
      rating,
      review_count,
      tags,
      is_active,
      is_featured,
      updated_at,
    } = body;

    // Validate required fields
    const requiredFields = { name, description, category_id };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === 'string' && !value.trim()))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: `Required fields missing: ${missingFields.join(', ')}`,
          missingFields
        },
        { status: 400 }
      );
    }

    console.log("✅ Required fields validation passed");

    // Initialize Supabase client
    const supabase = createAdminSupabaseClient();
    if (!supabase) {
      console.error("❌ Database client not available");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    console.log("✅ Database client initialized");

    // Verify category exists if category_id is provided
    if (category_id) {
      console.log("🔍 Verifying category_id:", category_id);
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("id", category_id)
        .single();

      if (categoryError || !categoryData) {
        console.error("❌ Category verification failed:", categoryError);
        return NextResponse.json(
          { 
            error: "Invalid category selected",
            details: categoryError?.message || "Category not found",
            category_id 
          },
          { status: 400 }
        );
      }

      console.log("✅ Category verified:", categoryData.name);
    }

    // Check for SKU uniqueness if SKU is being updated
    if (sku) {
      const { data: existingSku, error: skuCheckError } = await supabase
        .from("products")
        .select("id, name")
        .eq("sku", sku)
        .neq("id", id) // Exclude current product
        .single();

      if (existingSku && !skuCheckError) {
        console.error("❌ SKU already exists:", existingSku);
        return NextResponse.json(
          { 
            error: "SKU already exists",
            details: `SKU '${sku}' is already used by product '${existingSku.name}'`,
            existingProduct: existingSku
          },
          { status: 409 }
        );
      }

      console.log("✅ SKU uniqueness verified");
    }

    // Prepare comprehensive update data
    const updateData: any = {
      name: name?.trim(),
      description: description?.trim(),
      short_description: short_description?.trim(),
      full_description: full_description?.trim(),
      sku: sku?.trim(),
      category_id,
      images: Array.isArray(images) ? images : undefined,
      specifications: specifications || undefined,
      features: Array.isArray(features) ? features : undefined,
      benefits: Array.isArray(benefits) ? benefits : undefined,
      warranty: warranty || undefined,
      certifications: Array.isArray(certifications) ? certifications : undefined,
      rating: typeof rating === 'number' ? Math.max(0, Math.min(5, rating)) : undefined,
      review_count: typeof review_count === 'number' ? Math.max(0, review_count) : undefined,
      tags: Array.isArray(tags) ? tags : undefined,
      is_active: typeof is_active === 'boolean' ? is_active : undefined,
      is_featured: typeof is_featured === 'boolean' ? is_featured : undefined,
      updated_at: updated_at || new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    console.log("📝 Prepared update data:", JSON.stringify(updateData, null, 2));

    // Update the product
    console.log("💾 Updating product in database...");
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        categories(name, slug)
      `)
      .single();

    if (updateError) {
      console.error("❌ Database update error:", updateError);
      return NextResponse.json(
        { 
          error: "Failed to update product",
          details: updateError.message,
          code: updateError.code,
          hint: updateError.hint
        },
        { status: 500 }
      );
    }

    if (!updatedProduct) {
      console.error("❌ Product not found after update");
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.log("✅ Product updated successfully:", {
      id: updatedProduct.id,
      name: updatedProduct.name,
      sku: updatedProduct.sku,
      category: updatedProduct.categories?.name
    });

    // Return success response
    return NextResponse.json({
      message: "Product updated successfully",
      data: updatedProduct,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ PATCH /api/products/[id] error:", error);
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: "Internal server error",
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
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
