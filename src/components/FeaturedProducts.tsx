"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Loader2, ShoppingCart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { createClientSupabase } from "@/lib/supabase";
import { Product } from "@/types/product";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  // Transform database data to Product type (same as ProductGrid)
  const transformProductData = (item: any): Product => ({
    id: item.id,
    name: item.name,
    slug: item.name.toLowerCase().replace(/\s+/g, '-'),
    category: item.categories?.name || "Medical Equipment",
    categoryId: item.category_id,
    description: item.description,
    shortDescription: item.short_description || item.description?.substring(0, 150) + '...',
    fullDescription: item.description,

    sku: item.sku,
    inStock: item.stock_quantity > 0,
    stockQuantity: item.stock_quantity,
    image_url: item.images?.[0] || "/assets/images/placeholder-product.svg",
    images: item.images?.map((url: string, index: number) => ({
      id: `${item.id}-${index}`,
      url,
      alt: item.name,
      isPrimary: index === 0,
      order: index + 1,
    })) || [
      {
        id: `${item.id}-placeholder`,
        url: "/assets/images/placeholder-product.svg",
        alt: item.name,
        isPrimary: true,
        order: 1,
      }
    ],
    features: item.features || [],
    specifications: Array.isArray(item.specifications) 
      ? item.specifications 
      : item.specifications 
        ? Object.entries(item.specifications).map(([name, value]) => ({ name, value: String(value) }))
        : [],
    benefits: [],
    warranty: "1 year manufacturer warranty",
    certifications: ["CE Marked", "FDA Approved"],
    rating: 4.5,
    reviewCount: Math.floor(Math.random() * 50) + 10,
    tags: item.features?.slice(0, 3) || [],
    isActive: item.is_active,
    isFeatured: item.is_featured,
    created_at: item.created_at,
    updated_at: item.updated_at,
  });

  // Real-time product updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (typeof window !== 'undefined') {
      console.log('🔄 Real-time featured product update:', payload);
    }
    
    switch (payload.eventType) {
      case 'INSERT': {
        if (payload.new.is_featured || isFallback) {
          const newProduct = transformProductData(payload.new);
          setProducts(prev => [newProduct, ...prev].slice(0, 6));
        }
        break;
      }
      case 'UPDATE': {
        const updatedProduct = transformProductData(payload.new);
        if (payload.new.is_featured || isFallback) {
          setProducts(prev => {
            const updated = prev.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            return updated.some(p => p.id === updatedProduct.id) ? updated : [updatedProduct, ...prev].slice(0, 6);
          });
        } else if (!isFallback) {
          // Remove from featured if no longer featured
          setProducts(prev => prev.filter(p => p.id !== updatedProduct.id));
        }
        break;
      }
      case 'DELETE': {
        setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        break;
      }
    }
  }, [isFallback]);

  // Fetch products from database - first try featured, then fallback to recent
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClientSupabase();
      if (!supabase) {
        setError("Database connection not available");
        setLoading(false);
        return;
      }

      // First, try to get featured products
      let { data, error: fetchError } = await supabase
        .from("products")
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // If no featured products, get recent products
      if (!fetchError && (!data || data.length === 0)) {
        console.log("No featured products found, fetching recent products...");
        setIsFallback(true);
        
        const result = await supabase
          .from("products")
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(6);
          
        data = result.data;
        fetchError = result.error;
      }

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const transformedProducts = data.map(transformProductData);
        setProducts(transformedProducts);
      } else {
        setError("No products available");
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        console.error("Error fetching products:", error);
      }
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClientSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('featured-product-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: isFallback ? 'is_active=eq.true' : 'is_featured=eq.true'
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeUpdate, isFallback]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-lg">Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchProducts}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 mb-4">No products available.</p>
        <Link 
          href="/admin/products"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Add Products
        </Link>
      </div>
    );
  }

  // Create a duplicated array for seamless loop
  const duplicatedProducts = [...products, ...products];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {isFallback ? "Our Latest Products" : "Featured Products"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isFallback 
              ? "Discover our latest medical equipment and healthcare solutions" 
              : "Discover our handpicked selection of premium medical equipment"
            }
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-8"
              animate={{
                x: [0, -(300 + 32) * products.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: products.length * 8, // 8 seconds per product
                  ease: "linear",
                },
              }}
              style={{ width: `${(300 + 32) * duplicatedProducts.length}px` }}
            >
              {duplicatedProducts.map((product, index) => (
                <motion.div
                  key={`${product.id}-${index}`}
                  className="group relative flex-shrink-0"
                  style={{ width: '300px' }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {isFallback ? "Latest" : "Featured"}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="relative h-48 mb-4 overflow-hidden rounded-xl bg-gray-50">
                      <Image
                        src={product.image_url || "/assets/images/placeholder-product.svg"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="300px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          href={`/products/${product.id}`}
                          className="p-2 bg-white rounded-full shadow-lg hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-emerald-600" />
                        </Link>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                        {product.inStock && (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            In Stock
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.reviewCount})</span>
                        </div>

                      </div>

                      {/* CTA Button */}
                      <Link
                        href={`/products/${product.id}`}
                        className="block w-full"
                      >
                        <motion.button
                          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-2 px-4 rounded-lg font-medium text-sm hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link href="/products">
              <motion.button
                className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-semibold border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Products
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 