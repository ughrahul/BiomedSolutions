"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ArrowRight, ShoppingCart, Heart, Eye, Zap, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Product } from "@/types/product";
import { createClientSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface ProductGridProps {
  viewMode?: "grid" | "list";
  searchQuery?: string;
  selectedCategory?: string;
  sortBy?: string;
}

export default function ProductGrid({
  viewMode = "grid",
  searchQuery = "",
  selectedCategory = "",
  sortBy: initialSortBy = "featured",
}: ProductGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Real-time product updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    console.log('🔄 Real-time product update:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        // Add new product to the list
        const newProduct = transformProductData(payload.new);
        setProducts(prev => [newProduct, ...prev]);
        break;
      case 'UPDATE':
        // Update existing product
        const updatedProduct = transformProductData(payload.new);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        break;
      case 'DELETE':
        // Remove deleted product
        setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        break;
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClientSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('product-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: 'is_active=eq.true'
        },
        handleRealtimeUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleRealtimeUpdate]);

  // Transform database data to Product type
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClientSupabase();
      if (!supabase) {
        // If no database connection, show sample products instead of empty state
        const sampleProducts: Product[] = [
          {
            id: 'sample-1',
            name: 'Digital ECG Machine',
            description: 'Advanced 12-lead ECG machine with high-resolution display and automatic interpretation.',
            shortDescription: 'Advanced 12-lead ECG machine with automatic interpretation',
            category: 'Diagnostic Equipment',

            sku: 'ECG-DIG-001',
            inStock: true,
            stockQuantity: 5,
            image_url: '/assets/images/placeholder-product.svg',
            images: [{ id: 'sample-1-img', url: '/assets/images/placeholder-product.svg', alt: 'Digital ECG Machine', isPrimary: true, order: 1 }],
            features: ['12-lead ECG recording', 'Automatic interpretation', 'Wireless connectivity'],
            specifications: [
              { name: 'Display', value: '10.1 inch touchscreen' },
              { name: 'Connectivity', value: 'WiFi, Bluetooth' },
              { name: 'Power', value: 'Battery + AC' }
            ],
            isActive: true,
            isFeatured: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setProducts(sampleProducts);
        setLoading(false);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from("products")
        .select(`
          *,
          categories(name, slug)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      // Transform the data to match our Product type
      const transformedProducts: Product[] = (data || []).map((item) => ({
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
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products based on props
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };



  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </motion.div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to load products
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <EnhancedButton onClick={fetchProducts}>
              Try Again
            </EnhancedButton>
          </motion.div>
        </div>
      </section>
    );
  }

  if (viewMode === "list") {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <EnhancedCard
                  variant="medical"
                  hover="lift"
                  padding="lg"
                  className="flex flex-col lg:flex-row gap-6"
                >
                  <div className="lg:w-1/3">
                    <div className="relative h-64 lg:h-48 rounded-xl overflow-hidden">
                      <Image
                        src={product.image_url || "/assets/images/placeholder-product.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.has(product.id)
                                ? "text-red-500 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-2/3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full mb-2">
                            {product.category}
                          </span>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {product.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-sm text-gray-600 ml-1">
                              {product.inStock ? "Available" : "Contact"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {product.description}
                      </p>

                      {product.features && product.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {product.features.slice(0, 4).map((feature, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.inStock 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {product.inStock ? "Available" : "Contact"}
                        </span>
                        <span className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/products/${product.id}`}>
                          <EnhancedButton
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                          >
                            View Details
                          </EnhancedButton>
                        </Link>
                        <EnhancedButton
                          variant="primary"
                          size="sm"
                          icon={<ShoppingCart className="w-4 h-4" />}
                          onClick={() => {
                            window.open("mailto:info@annapurnahospitals.com?subject=Inquiry about " + product.name, "_self");
                          }}
                        >
                          Contact Us
                        </EnhancedButton>
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-gradient-to-br from-white via-cyan-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
                              <EnhancedCard
                variant="medical"
                hover="both"
                padding="none"
                className="group overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl"
              >
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <Image
                    src={product.image_url || "/assets/images/placeholder-product.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Top badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-full">
                      {product.category}
                    </span>
                    {product.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-colors ${
                        favorites.has(product.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-700 hover:bg-white"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <Link href={`/products/${product.id}`}>
                      <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                      {product.rating && (
                        <div className="flex items-center">
                          {renderStars(product.rating)}
                          <span className="text-sm text-gray-600 ml-1">
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-1">
                      {product.shortDescription || product.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-center mb-2">
                      <div className="text-xs text-gray-500">
                        {product.inStock ? "In Stock" : "Contact"}
                      </div>
                    </div>

                    <Link href={`/products/${product.id}`} className="block">
                      <EnhancedButton
                        variant="primary"
                        size="sm"
                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        View Details
                      </EnhancedButton>
                    </Link>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
                      ))}
        </div>

        {filteredProducts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all categories.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
