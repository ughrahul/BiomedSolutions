"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { logger } from "@/lib/logger";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  const productParam = params.id as string;
  const supabase = createClientSupabase();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!supabase) {
        throw new Error("Database connection not available");
      }

      const isUuid = (value: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          value
        );
      const slugify = (value: string) =>
        String(value)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      let data: any = null;
      if (isUuid(productParam)) {
        const { data: byId, error: supabaseError } = await supabase
          .from("products")
          .select(
            `
          *,
          categories(name, slug)
        `
          )
          .eq("id", productParam)
          .eq("is_active", true)
          .single();

        if (supabaseError) {
          if ((supabaseError as any).code === "PGRST116") {
            notFound();
            return;
          }
          throw supabaseError;
        }
        data = byId;
      } else {
        // Treat param as slug (product name in URL)
        const decoded = decodeURIComponent(productParam);
        const candidateWithSpaces = decoded.replace(/-/g, " ");
        const { data: list, error: listError } = await supabase
          .from("products")
          .select(
            `
          *,
          categories(name, slug)
        `
          )
          .eq("is_active", true)
          .or(
            `name.ilike.%${candidateWithSpaces}%,name.ilike.%${decoded}%`
          );

        if (listError) {
          throw listError;
        }

        const exact = (list || []).find(
          (p: any) => slugify(p.name) === slugify(decoded)
        );
        if (!exact) {
          notFound();
          return;
        }
        data = exact;
      }

      const transformedProduct: Product = {
        id: data.id,
        name: data.name,
        slug: slugify(data.name),
        category: data.categories?.name || "Medical Equipment",
        category_id: data.category_id,
        description: data.description,
        short_description: data.short_description || data.description,
        full_description: data.description,
        sku: data.sku,
        images:
          data.images?.map((url: string, index: number) => ({
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
            },
          ],
        features: data.features || [],
        specifications: Array.isArray(data.specifications)
          ? data.specifications
          : data.specifications
          ? Object.entries(data.specifications).map(([name, value]) => ({
              name,
              value: String(value),
            }))
          : [],
        benefits: [],
        warranty: data.warranty || "1 year",
        certifications: Array.isArray(data.certifications)
          ? data.certifications.filter(Boolean)
          : [],
        rating: typeof data.rating === "number" ? data.rating : 0,
        review_count:
          typeof data.review_count === "number" ? data.review_count : 0,
        tags: data.features?.slice(0, 3) || [],
        is_active: data.is_active,
        is_featured: data.is_featured,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      setProduct(transformedProduct);
    } catch (error) {
      logger.error("Error fetching product:", error);
      setError("Failed to load product details");
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [productParam, supabase]);

  // Add this useEffect
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Detect low-performance environments to disable heavy background animations
  useEffect(() => {
    try {
      const lowPerf = (typeof window !== 'undefined' && (window.navigator.hardwareConcurrency || 0) <= 4) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsLowPerformance(!!lowPerf);
    } catch {
      setIsLowPerformance(false);
    }
  }, []);

  // Title is handled via route-level metadata in layout.tsx

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The requested product could not be found."}
          </p>
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
      {!isLowPerformance && (
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
      )}

      {/* Back to Products Button */}
      <div className="relative z-10 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/products">
            <button className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </button>
          </Link>
        </div>
      </div>

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
