import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function POST() {
  try {
    const supabase = createAdminSupabaseClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // First, get category IDs
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, slug");

    if (catError) {
      throw catError;
    }

    const categoryMap = categories?.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, string>) || {};

    // Define the products to seed
    const productsToSeed = [
      {
        name: 'Digital Blood Pressure Monitor',
        description: 'Professional-grade digital blood pressure monitor with advanced accuracy technology and memory storage for comprehensive patient monitoring.',
        short_description: 'Professional digital BP monitor with memory storage',

        sku: 'DBP-001',
        stock_quantity: 50,
        category_id: categoryMap['diagnostic-equipment'],
        features: ['Automatic inflation', 'Memory storage', 'Irregular heartbeat detection'],
        specifications: { accuracy: '±3 mmHg', cuff_size: '22-42 cm', memory: '60 readings' },
        is_active: true,
        is_featured: true,
        images: ['/assets/images/placeholder-product.svg']
      },
      {
        name: 'Digital ECG Machine',
        description: 'Advanced 12-lead ECG machine with high-resolution display and automatic interpretation capabilities for comprehensive cardiac monitoring.',
        short_description: 'Advanced 12-lead ECG machine with automatic interpretation',
         15000.00,
        sku: 'ECG-DIG-001',
        stock_quantity: 8,
        category_id: categoryMap['diagnostic-equipment'],
        features: ['12-lead ECG recording', 'Automatic interpretation', 'Wireless connectivity', 'Touch screen display'],
        specifications: { display: '10.1 inch touchscreen', connectivity: 'WiFi, Bluetooth', power: 'Battery + AC', leads: '12-lead' },
        is_active: true,
        is_featured: true,
        images: ['/assets/images/placeholder-product.svg']
      },
      {
        name: 'Portable Ultrasound Scanner',
        description: 'Compact portable ultrasound system with advanced imaging technology for point-of-care diagnostics and mobile medical applications.',
        short_description: 'Compact portable ultrasound with advanced imaging',
         25000.00,
        sku: 'US-PORT-002',
        stock_quantity: 5,
        category_id: categoryMap['medical-imaging'],
        features: ['Portable design', 'Multiple transducers', 'Cloud connectivity', 'Battery operated'],
        specifications: { weight: '2.5 kg', battery_life: '4 hours', display: '15 inch LED', connectivity: 'WiFi, USB' },
        is_active: true,
        is_featured: true,
        images: ['/assets/images/placeholder-product.svg']
      },
      {
        name: 'Multi-Parameter Patient Monitor',
        description: 'Comprehensive patient monitoring system with real-time vital signs tracking, alarm management, and data recording capabilities.',
        short_description: 'Multi-parameter monitor for vital signs tracking',
         8500.00,
        sku: 'PM-MULTI-003',
        stock_quantity: 12,
        category_id: categoryMap['patient-monitoring'],
        features: ['ECG monitoring', 'SpO2 measurement', 'Blood pressure', 'Temperature', 'Alarm system'],
        specifications: { parameters: 'ECG, SpO2, NIBP, Temperature', display: '12.1 inch', alarms: 'Audio/Visual', connectivity: 'Network ready' },
        is_active: true,
        is_featured: true,
        images: ['/assets/images/placeholder-product.svg']
      },
      {
        name: 'Surgical Cautery Unit',
        description: 'Advanced electrosurgical generator with multiple cutting and coagulation modes for precise surgical procedures.',
        short_description: 'Advanced electrosurgical generator for precise surgery',
         12000.00,
        sku: 'SC-ADV-004',
        stock_quantity: 6,
        category_id: categoryMap['surgical-instruments'],
        features: ['Multiple cutting modes', 'Coagulation control', 'Safety features', 'Digital display'],
        specifications: { power: '400W', modes: 'Cut, Coag, Blend', safety: 'Return electrode monitoring', display: 'LCD' },
        is_active: true,
        is_featured: true,
        images: ['/assets/images/placeholder-product.svg']
      },
      {
        name: 'Automated Chemistry Analyzer',
        description: 'High-throughput automated chemistry analyzer for comprehensive blood chemistry testing with advanced quality control.',
        short_description: 'High-throughput automated chemistry analyzer',
         45000.00,
        sku: 'CA-AUTO-005',
        stock_quantity: 3,
        category_id: categoryMap['laboratory-equipment'],
        features: ['Automated processing', 'Quality control', 'Multiple test panels', 'Data management'],
        specifications: { throughput: '200 tests/hour', sample_volume: '2-35 μL', tests: 'Chemistry panel', connectivity: 'LIS compatible' },
        is_active: true,
        is_featured: true,
        images: ['/assets/images/placeholder-product.svg']
      },
      {
        name: 'Automated External Defibrillator',
        description: 'Life-saving automated external defibrillator with voice prompts and visual indicators for emergency cardiac care.',
        short_description: 'Life-saving AED with voice prompts and indicators',
         3500.00,
        sku: 'AED-AUTO-006',
        stock_quantity: 15,
        category_id: categoryMap['emergency-care'],
        features: ['Voice prompts', 'Visual indicators', 'Automatic analysis', 'Shock delivery'],
        specifications: { energy: '150-200J', analysis: 'Automatic', prompts: 'Voice + Visual', battery: '5 year standby' },
        is_active: true,
        is_featured: true,
        images: ['/assets/images/placeholder-product.svg']
      }
    ];

    // First, check what already exists
    const { data: existingProducts } = await supabase
      .from("products")
      .select("sku, id, name, is_featured");

    const existingSKUs = new Set(existingProducts?.map(p => p.sku) || []);
    const newProducts = productsToSeed.filter(p => !existingSKUs.has(p.sku));

    let insertedProducts = [];
    let updatedCount = 0;

    // Insert new products
    if (newProducts.length > 0) {
      const { data: insertData, error: insertError } = await supabase
        .from("products")
        .insert(newProducts)
        .select();

      if (insertError) {
        throw insertError;
      }
      insertedProducts = insertData || [];
    }

    // Update existing products to be featured if they're not already
    const existingToUpdate = existingProducts?.filter(p => 
      productsToSeed.some(newP => newP.sku === p.sku) && !p.is_featured
    ) || [];

    if (existingToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from("products")
        .update({ is_featured: true })
        .in("id", existingToUpdate.map(p => p.id));

      if (updateError) {
        console.warn("Error updating existing products:", updateError);
      } else {
        updatedCount = existingToUpdate.length;
      }
    }

    const data = insertedProducts;

    const totalProcessed = insertedProducts.length + updatedCount;
    const totalExisting = existingSKUs.size - updatedCount;

    return NextResponse.json({
      message: totalProcessed > 0 
        ? `Successfully processed ${totalProcessed} featured products` 
        : "All featured products already exist and are configured",
      products: insertedProducts,
      existing: totalExisting,
      added: insertedProducts.length,
      updated: updatedCount,
      details: {
        newProducts: newProducts.map(p => p.name),
        updatedProducts: existingToUpdate.map(p => p.name),
        totalFeatured: existingProducts?.filter(p => p.is_featured).length + insertedProducts.length
      }
    });

  } catch (error) {
    console.error("Seed products error:", error);
    return NextResponse.json(
      { error: "Failed to seed products", details: (error as Error).message },
      { status: 500 }
    );
  }
} 