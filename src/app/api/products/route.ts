import { NextResponse, NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      console.error("❌ Database client not available");
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
      console.error("❌ Database query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch products", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully fetched ${products?.length || 0} products`);

    return NextResponse.json({
      products: products || [],
      total: products?.length || 0,
    });
  } catch (error) {
    console.error("❌ GET /api/products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting product creation...");
    
    const body = await request.json();
    console.log("📦 Received request body:", JSON.stringify(body, null, 2));

    // Validate request body
    if (!body || typeof body !== 'object') {
      console.error("❌ Invalid request body");
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Extract and validate required fields
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

    // Verify category exists
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

    // Generate SKU if not provided
    const finalSku = sku?.trim() || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log("🏷️ Generated SKU:", finalSku);

    // Prepare product data for insertion
    const productData = {
      name: name.trim(),
      description: description.trim(),
      short_description: short_description?.trim() || description.substring(0, 100),
      full_description: full_description?.trim() || description,
      sku: finalSku,
      category_id,
      images: Array.isArray(images) ? images : [],
      specifications: specifications || {},
      features: Array.isArray(features) ? features : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      warranty: warranty || "1 year",
      certifications: Array.isArray(certifications) ? certifications : [],
      rating: typeof rating === 'number' ? Math.max(0, Math.min(5, rating)) : 4.5,
      review_count: typeof review_count === 'number' ? Math.max(0, review_count) : 0,
      tags: Array.isArray(tags) ? tags : [],
      is_active: typeof is_active === 'boolean' ? is_active : true,
      is_featured: typeof is_featured === 'boolean' ? is_featured : false,
      // Price and stock fields are now optional - not included in product creation
    };

    console.log("📝 Prepared product data:", JSON.stringify(productData, null, 2));

    // Check for SKU uniqueness
    const { data: existingSku, error: skuCheckError } = await supabase
      .from("products")
      .select("id, name")
      .eq("sku", finalSku)
      .single();

    if (existingSku && !skuCheckError) {
      console.error("❌ SKU already exists:", existingSku);
      return NextResponse.json(
        { 
          error: "SKU already exists",
          details: `SKU '${finalSku}' is already used by product '${existingSku.name}'`,
          existingProduct: existingSku
        },
        { status: 409 }
      );
    }

    console.log("✅ SKU uniqueness verified");

    // Create the product
    console.log("💾 Inserting product into database...");
    const { data: createdProduct, error: productError } = await supabase
      .from("products")
      .insert([productData])
      .select(`
        *,
        categories(name, slug)
      `)
      .single();

    if (productError) {
      console.error("❌ Database insertion error:", productError);
      return NextResponse.json(
        { 
          error: "Failed to create product",
          details: productError.message,
          code: productError.code,
          hint: productError.hint
        },
        { status: 500 }
      );
    }

    console.log("✅ Product created successfully:", {
      id: createdProduct.id,
      name: createdProduct.name,
      sku: createdProduct.sku,
      category: createdProduct.categories?.name
    });

    // Return success response
    return NextResponse.json({
      message: "Product created successfully",
      data: createdProduct,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error("❌ POST /api/products error:", error);
    
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
