import { NextResponse, NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { CreateProductData } from "@/types/product";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        categories(name, slug)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: products || [],
      total: products?.length || 0,
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
    const { name, description, image_url, category } =
      body as CreateProductData;

    // Validate required fields
    if (!name || !description || !image_url || !category) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, image_url, category",
        },
        { status: 400 }
      );
    }

    // Generate required fields
    const sku = `SKU-${Date.now()}`;

    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Map category to category_id
    const categoryMap: Record<string, string> = {
      "imaging": "medical-imaging",
      "monitoring": "patient-monitoring", 
      "surgery": "surgical-instruments",
      "diagnostic": "diagnostic-equipment",
      "laboratory": "laboratory-equipment",
      "emergency": "emergency-care"
    };

    const categorySlug = categoryMap[category] || category;
    
    // Get the category_id from the database
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (categoryError) {
      // Try to find any category as fallback
      const { data: fallbackCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single();
      
      if (!fallbackCategory) {
        return NextResponse.json(
          { error: "No categories available. Please create categories first." },
          { status: 400 }
        );
      }
    }

    const category_id = categoryData?.id || null;

    // Create the product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          short_description: description.substring(0, 100),

          sku,
          stock_quantity: 0,
          category_id,
          images: [image_url],
          is_active: true,
          is_featured: false,
        },
      ])
      .select()
      .single();

    if (productError) {
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    // Add to inventory history
    const { error: historyError } = await supabase
      .from("inventory_history")
      .insert([
        {
          product_id: productData.id,
          user_id: null, // Will be set when we have user context
          action: "created",
          new_values: {
            name,
            description,
            image_url,
            category,
          },
          description: `New product "${name}" created in ${category} category`,
        },
      ]);

    if (historyError) {
      // Don't fail the request if history tracking fails
    }

    return NextResponse.json({
      message: "Product created successfully",
      data: productData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
