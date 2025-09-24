"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Star,
  Loader2,
  ShoppingCart,
  Eye,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { createClientSupabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { logger } from "@/lib/logger";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [windowWidth, setWindowWidth] = useState(1024);

  // Transform database data to Product type (same as ProductGrid)
  const transformProductData = (item: any): Product => ({
    id: item.id || "unknown",
    name: item.name || "Unknown Product",
    slug: (item.name || "unknown").toLowerCase().replace(/\s+/g, "-"),
    category: item.categories?.name || "Medical Equipment",
    category_id: item.category_id,
    description: item.description || "No description available",
    short_description:
      item.short_description ||
      (item.description
        ? item.description.substring(0, 150) + "..."
        : "No description available"),
    full_description: item.description || "No description available",
    sku: item.sku || "SKU-UNKNOWN",
    image_url: item.images?.[0] || "/assets/images/placeholder-product.svg",
    images: item.images?.map((url: string, index: number) => ({
      id: `${item.id || "unknown"}-${index}`,
      url,
      alt: item.name || "Product",
      isPrimary: index === 0,
      order: index + 1,
    })) || [
      {
        id: `${item.id || "unknown"}-placeholder`,
        url: "/assets/images/placeholder-product.svg",
        alt: item.name || "Product",
        isPrimary: true,
        order: 1,
      },
    ],
    features: item.features || [],
    specifications: Array.isArray(item.specifications)
      ? item.specifications
      : item.specifications
      ? Object.entries(item.specifications).map(([name, value]) => ({
          name,
          value: String(value),
        }))
      : [],
    benefits: [],
    warranty: item.warranty || "1 year manufacturer warranty",
    certifications: ["CE Marked", "FDA Approved"],
    rating: typeof item.rating === "number" ? item.rating : 0,
    review_count: typeof item.review_count === "number" ? item.review_count : 0,
    // Prefer explicit tags if present; otherwise include all features
    tags: Array.isArray(item.tags)
      ? item.tags
      : Array.isArray(item.features)
      ? item.features
      : [],
    is_active: item.is_active ?? true,
    is_featured: item.is_featured ?? false,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
  });

  // Track window width for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Real-time product updates
  const handleRealtimeUpdate = useCallback(
    (payload: any) => {
      if (typeof window !== "undefined") {
        // Real-time featured product update received
      }

      switch (payload.eventType) {
        case "INSERT": {
          if (payload.new.is_featured || isFallback) {
            const newProduct = transformProductData(payload.new);
            setProducts((prev) => [newProduct, ...prev].slice(0, 6));
          }
          break;
        }
        case "UPDATE": {
          const updatedProduct = transformProductData(payload.new);
          if (payload.new.is_featured || isFallback) {
            setProducts((prev) => {
              const updated = prev.map((p) =>
                p.id === updatedProduct.id ? updatedProduct : p
              );
              return updated.some((p) => p.id === updatedProduct.id)
                ? updated
                : [updatedProduct, ...prev].slice(0, 6);
            });
          } else if (!isFallback) {
            // Remove from featured if no longer featured
            setProducts((prev) =>
              prev.filter((p) => p.id !== updatedProduct.id)
            );
          }
          break;
        }
        case "DELETE": {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          break;
        }
      }
    },
    [isFallback]
  );

  // Fetch products from database - first try featured, then fallback to recent
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClientSupabase();
      if (!supabase) {
        // Demo mode: Show demo products when database is not configured
        // Demo mode: Showing demo featured products
        setIsDemoMode(true);
        const demoProducts = [
          {
            id: "demo-1",
            name: "ECG Machine Pro",
            slug: "ecg-machine-pro",
            category: "Cardiology",
            categoryId: "demo-cat-1",
            description:
              "Advanced 12-lead ECG machine with digital recording capabilities.",
            shortDescription:
              "Advanced 12-lead ECG machine with digital recording capabilities.",
            fullDescription:
              "Professional-grade ECG machine featuring 12-lead recording, digital signal processing, and comprehensive analysis software. Ideal for hospitals and cardiac clinics.",
            sku: "ECG-PRO-001",
            inStock: true,
            stockQuantity: 5,
            image_url: "/assets/images/placeholder-product.svg",
            images: [
              {
                id: "demo-1-1",
                url: "/assets/images/placeholder-product.svg",
                alt: "ECG Machine Pro",
                isPrimary: true,
                order: 1,
              },
            ],
            features: [
              "12-lead recording",
              "Digital processing",
              "Analysis software",
            ],
            specifications: [
              { name: "Type", value: "12-lead ECG" },
              { name: "Display", value: '10.1" Touchscreen' },
              { name: "Connectivity", value: "USB, WiFi, Bluetooth" },
            ],
            benefits: ["Accurate diagnosis", "Easy to use", "Portable"],
            warranty: "2 years manufacturer warranty",
            certifications: ["CE Marked", "FDA Approved"],
            rating: 4.8,
            reviewCount: 45,
            tags: ["ECG", "Cardiology", "Digital"],
            isActive: true,
            isFeatured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "demo-2",
            name: "Ultrasound Scanner",
            slug: "ultrasound-scanner",
            category: "Radiology",
            categoryId: "demo-cat-2",
            description:
              "High-resolution ultrasound imaging system for diagnostic applications.",
            shortDescription:
              "High-resolution ultrasound imaging system for diagnostic applications.",
            fullDescription:
              "Advanced ultrasound scanner with high-resolution imaging, multiple probe options, and comprehensive diagnostic capabilities. Perfect for obstetrics, cardiology, and general imaging.",
            sku: "US-SCAN-002",
            inStock: true,
            stockQuantity: 3,
            image_url: "/assets/images/placeholder-product.svg",
            images: [
              {
                id: "demo-2-1",
                url: "/assets/images/placeholder-product.svg",
                alt: "Ultrasound Scanner",
                isPrimary: true,
                order: 1,
              },
            ],
            features: [
              "High-resolution imaging",
              "Multiple probes",
              "3D/4D capability",
            ],
            specifications: [
              { name: "Frequency", value: "2-15 MHz" },
              { name: "Display", value: '15" HD Monitor' },
              { name: "Probes", value: "Convex, Linear, Phased Array" },
            ],
            benefits: ["Clear imaging", "Versatile", "Advanced features"],
            warranty: "3 years manufacturer warranty",
            certifications: ["CE Marked", "FDA Approved"],
            rating: 4.9,
            reviewCount: 32,
            tags: ["Ultrasound", "Radiology", "Imaging"],
            isActive: true,
            isFeatured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "demo-3",
            name: "X-Ray Machine",
            slug: "x-ray-machine",
            category: "Radiology",
            categoryId: "demo-cat-2",
            description:
              "Digital X-ray system with advanced imaging technology.",
            shortDescription:
              "Digital X-ray system with advanced imaging technology.",
            fullDescription:
              "State-of-the-art digital X-ray machine with high-resolution imaging, low radiation dose, and rapid image processing. Suitable for hospitals and diagnostic centers.",
            sku: "XR-DIGI-003",
            inStock: true,
            stockQuantity: 2,
            image_url: "/assets/images/placeholder-product.svg",
            images: [
              {
                id: "demo-3-1",
                url: "/assets/images/placeholder-product.svg",
                alt: "X-Ray Machine",
                isPrimary: true,
                order: 1,
              },
            ],
            features: ["Digital imaging", "Low radiation", "Rapid processing"],
            specifications: [
              { name: "Power", value: "50 kW" },
              { name: "Resolution", value: "Up to 5K" },
              { name: "Exposure Time", value: "0.1-6.0 seconds" },
            ],
            benefits: [
              "High quality images",
              "Patient safety",
              "Efficient workflow",
            ],
            warranty: "2 years manufacturer warranty",
            certifications: ["CE Marked", "FDA Approved"],
            rating: 4.7,
            reviewCount: 28,
            tags: ["X-Ray", "Radiology", "Digital"],
            isActive: true,
            isFeatured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        setProducts(demoProducts);
        setLoading(false);
        return;
      }

      // First, try to get featured products
      let { data, error: fetchError } = await supabase
        .from("products")
        .select(
          `
          *,
          categories (
            id,
            name
          )
        `
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);

      // If no featured products, get recent products
      if (!fetchError && (!data || data.length === 0)) {
        // No featured products found, fetching recent products
        setIsFallback(true);

        const result = await supabase
          .from("products")
          .select(
            `
            *,
            categories (
              id,
              name
            )
          `
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(6);

        data = result.data;
        fetchError = result.error;
      }

      // If still no products, get any active products
      if (!fetchError && (!data || data.length === 0)) {
        // No recent products found, fetching any active products
        const result = await supabase
          .from("products")
          .select(
            `
            *,
            categories (
              id,
              name
            )
          `
          )
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
      logger.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [fetchProducts]);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClientSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("featured-product-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: isFallback ? "is_active=eq.true" : "is_featured=eq.true",
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeUpdate, isFallback]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || products.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  if (!mounted || loading) {
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

  // Create a duplicated array for seamless infinite loop
  const duplicatedProducts = [...products, ...products, ...products]; // Triple for smoother infinite loop

  // Navigation functions
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-100 to-emerald-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {isFallback ? "Our Latest" : "Featured"}
            </span>{" "}
            <motion.span
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              Products
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {isFallback
              ? "Discover our latest medical equipment and healthcare solutions"
              : "Discover our handpicked selection of premium medical equipment"}
          </motion.p>
          {isDemoMode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Demo mode: Showing sample products. In production, these
                would be loaded from the database.
              </p>
            </div>
          )}
        </motion.div>

        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 left-2 sm:left-4 z-20 transform -translate-y-1/2">
            <motion.button
              onClick={goToPrevious}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group border-2 border-white/20"
              whileHover={{ scale: 1.15, x: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white group-hover:text-white transition-colors" />
            </motion.button>
          </div>

          <div className="absolute top-1/2 right-2 sm:right-4 z-20 transform -translate-y-1/2">
            <motion.button
              onClick={goToNext}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group border-2 border-white/20"
              whileHover={{ scale: 1.15, x: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white group-hover:text-white transition-colors" />
            </motion.button>
          </div>

          <div className="overflow-hidden">
            <motion.div
              className="flex gap-4 sm:gap-6 lg:gap-8"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
              animate={{
                x: isAutoPlaying
                  ? [
                      0,
                      -(
                        300 +
                        (windowWidth < 640 ? 16 : windowWidth < 1024 ? 24 : 32)
                      ) * products.length,
                      -(
                        300 +
                        (windowWidth < 640 ? 16 : windowWidth < 1024 ? 24 : 32)
                      ) *
                        products.length *
                        2,
                    ]
                  : -(
                      300 +
                      (windowWidth < 640 ? 16 : windowWidth < 1024 ? 24 : 32)
                    ) * currentIndex,
              }}
              transition={{
                x: {
                  repeat: isAutoPlaying ? Infinity : 0,
                  repeatType: "loop",
                  duration: isAutoPlaying ? products.length * 6 : 0.4,
                  ease: isAutoPlaying ? "linear" : "easeInOut",
                },
              }}
              style={{
                width: `${
                  (300 +
                    (windowWidth < 640 ? 16 : windowWidth < 1024 ? 24 : 32)) *
                  duplicatedProducts.length
                }px`,
                // Dynamic width calculation based on responsive gaps
              }}
            >
              {duplicatedProducts.map((product, index) => (
                <motion.div
                  key={`${product.id}-${index}`}
                  className="group relative flex-shrink-0"
                  style={{ width: windowWidth < 640 ? "250px" : "300px" }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                >
                  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                    {/* Featured Badge */}
                    <div className="absolute top-2 sm:top-3 lg:top-4 left-2 sm:left-3 lg:left-4 z-10">
                      <span className="bg-yellow-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {isFallback ? "Latest" : "Featured"}
                      </span>
                    </div>

                    {/* Product Image */}
                    <div className="relative h-32 sm:h-40 lg:h-48 mb-3 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl bg-gray-50 flex-shrink-0">
                      <Image
                        src={
                          product.image_url ||
                          "/assets/images/placeholder-product.svg"
                        }
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="300px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Quick Actions */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          href={`/products/${product.slug || product.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="p-1.5 sm:p-2 bg-white rounded-full shadow-lg hover:bg-emerald-50 transition-colors"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                        </Link>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          {product.category}
                        </span>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                          Available
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {product.short_description}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            {product.rating}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({product.review_count})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button - Fixed at bottom */}
                    <div className="mt-auto pt-3 sm:pt-4">
                      <Link
                        href={`/products/${product.slug || product.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="block w-full"
                      >
                        <motion.button
                          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          View Details
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dot Indicators - Responsive and Small */}
          {products.length > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 mt-4 sm:mt-5 md:mt-6 lg:mt-8 p-2">
              {products.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full transition-all duration-200 touch-manipulation p-1 ${
                    index === currentIndex
                      ? "bg-emerald-500 shadow-sm border border-emerald-600"
                      : "bg-gray-300 hover:bg-gray-400 border border-gray-400"
                  }`}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  style={{
                    minWidth:
                      windowWidth < 640
                        ? "6px"
                        : windowWidth < 768
                        ? "8px"
                        : windowWidth < 1024
                        ? "10px"
                        : "12px",
                    minHeight:
                      windowWidth < 640
                        ? "6px"
                        : windowWidth < 768
                        ? "8px"
                        : windowWidth < 1024
                        ? "10px"
                        : "12px",
                  }}
                />
              ))}
            </div>
          )}

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
