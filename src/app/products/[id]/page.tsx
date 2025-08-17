"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import ProductDetailHero from "@/components/ProductDetail/ProductDetailHero";
import ProductSpecifications from "@/components/ProductDetail/ProductSpecifications";
import { Product } from "@/types/product";
import { createClientSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;
  const supabase = createClientSupabase();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error("Database connection not available");
      }

      const { data, error: supabaseError } = await supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("id", productId)
        .eq("is_active", true)
        .single();

      if (supabaseError) {
        if (supabaseError.code === "PGRST116") {
          notFound();
          return;
        }
        throw supabaseError;
      }

      // Transform the data to match our Product type
      const transformedProduct: Product = {
        id: data.id,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        category: data.categories?.name || "Medical Equipment",
        categoryId: data.category_id,
        description: data.description,
        shortDescription: data.short_description || data.description,
        fullDescription: data.description,
                 price: data.price,
        sku: data.sku,
        inStock: data.stock_quantity > 0,
        stockQuantity: data.stock_quantity,
        images: data.images?.map((url: string, index: number) => ({
          id: `${data.id}-${index}`,
          url,
          alt: data.name,
          isPrimary: index === 0,
          order: index + 1,
        })) || [
          {
            id: `${data.id}-placeholder`,
            url: "/assets/images/placeholder-product.svg",
            alt: data.name,
            isPrimary: true,
            order: 1,
          }
        ],
        features: data.features || [],
        specifications: Array.isArray(data.specifications) 
          ? data.specifications 
          : data.specifications 
            ? Object.entries(data.specifications).map(([name, value]) => ({ name, value: String(value) }))
            : [],
        benefits: [],
        warranty: "1 year",
        certifications: ["CE Marked", "FDA Approved"],
        rating: 4.5,
        reviewCount: 0,
        tags: data.features?.slice(0, 3) || [],
        isActive: data.is_active,
        isFeatured: data.is_featured,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProduct(transformedProduct);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product details");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The requested product could not be found."}</p>
          <Link href="/products">
            <EnhancedButton>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </EnhancedButton>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, 25, 0],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Back to Products Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 pt-24 pb-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products">
            <EnhancedButton 
              variant="ghost" 
              className="mb-6 hover:bg-white/50 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </EnhancedButton>
          </Link>
        </div>
      </motion.div>

      {/* Product Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ProductDetailHero product={product} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <ProductSpecifications product={product} />
      </motion.div>
    </motion.div>
  );
}
