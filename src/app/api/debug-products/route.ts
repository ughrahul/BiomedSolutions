import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        error: "Database not configured",
        debug: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET"
        }
      });
    }

    // Get all products
    const { data: allProducts, error: allError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        short_description,

        sku,
        stock_quantity,
        is_active,
        is_featured,
        created_at,
        category_id,
        features,
        specifications,
        images,
        categories (
          id,
          name,
          slug
        )
      `)
      .order("created_at", { ascending: false });

    // Get specifically featured products
    const { data: featuredProducts, error: featuredError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        is_active,
        is_featured,
        category_id,
        categories (
          name
        )
      `)
      .eq("is_active", true)
      .eq("is_featured", true);

    // Get categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    // Database connection test
    const { data: testQuery, error: testError } = await supabase
      .from("products")
      .select("count(*)")
      .single();

    return NextResponse.json({
      database: {
        connected: !testError,
        connectionError: testError?.message || null
      },
      products: {
        total: allProducts?.length || 0,
        active: allProducts?.filter(p => p.is_active)?.length || 0,
        featured: allProducts?.filter(p => p.is_featured && p.is_active)?.length || 0,
        allProductsList: allProducts || [],
        featuredProductsList: featuredProducts || [],
        errors: {
          allProducts: allError?.message || null,
          featuredProducts: featuredError?.message || null
        }
      },
      categories: {
        total: categories?.length || 0,
        list: categories || [],
        error: catError?.message || null
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseMode: process.env.NEXT_PUBLIC_DATABASE_MODE,
        realtimeEnabled: process.env.NEXT_PUBLIC_ENABLE_REALTIME,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "CONFIGURED" : "MISSING",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "CONFIGURED" : "MISSING"
      },
      analysis: {
        hasProducts: (allProducts?.length || 0) > 0,
        hasFeaturedProducts: (featuredProducts?.length || 0) > 0,
        hasCategories: (categories?.length || 0) > 0,
        recommendations: []
      }
    });

  } catch (error) {
    return NextResponse.json({
      error: "Debug API failed",
      details: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
