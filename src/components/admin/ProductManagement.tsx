"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  ImageIcon,
  Package,
  Grid3X3,
  List,
  Search,
  Eye,
  EyeOff,
  Star,
  Settings,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "@/components/ui/safe-icons";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import type { Product, CreateProductData } from "@/types/product";
import { useProductUpdates } from "@/contexts/RealtimeContext";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "@/lib/logger";

interface ProductManagementProps {
  className?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  image_url: string;
  category: string;
}

interface SortConfig {
  field: keyof Product;
  direction: "asc" | "desc";
}

export default function ProductManagement({
  className = "",
}: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [featuredFilter, setFeaturedFilter] = useState<
    "all" | "featured" | "not-featured"
  >("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "created_at",
    direction: "desc",
  });

  // Dropdown states
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".sort-dropdown-container")) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    image_url: "",
    category: "imaging",
  });

  const categories = [
    { value: "imaging", label: "Medical Imaging" },
    { value: "monitoring", label: "Patient Monitoring" },
    { value: "surgery", label: "Surgical Equipment" },
    { value: "diagnostic", label: "Diagnostic Tools" },
    { value: "laboratory", label: "Laboratory Equipment" },
    { value: "emergency", label: "Emergency Care" },
  ];

  const sortOptions = [
    {
      value: "name",
      label: "Name (A-Z)",
      field: "name" as keyof Product,
      direction: "asc" as const,
    },
    {
      value: "name-desc",
      label: "Name (Z-A)",
      field: "name" as keyof Product,
      direction: "desc" as const,
    },
    {
      value: "created_at",
      label: "Date Created (Newest)",
      field: "created_at" as keyof Product,
      direction: "desc" as const,
    },
    {
      value: "created_at-asc",
      label: "Date Created (Oldest)",
      field: "created_at" as keyof Product,
      direction: "asc" as const,
    },
    {
      value: "updated_at",
      label: "Date Updated (Newest)",
      field: "updated_at" as keyof Product,
      direction: "desc" as const,
    },
    {
      value: "updated_at-asc",
      label: "Date Updated (Oldest)",
      field: "updated_at" as keyof Product,
      direction: "asc" as const,
    },
    {
      value: "sku",
      label: "SKU (A-Z)",
      field: "sku" as keyof Product,
      direction: "asc" as const,
    },
    {
      value: "sku-desc",
      label: "SKU (Z-A)",
      field: "sku" as keyof Product,
      direction: "desc" as const,
    },
  ];

  // Real-time subscription for product updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (payload.eventType === "INSERT") {
      setProducts((prev) => [payload.new, ...prev]);
      toast.success("New product added in real-time!");
    } else if (payload.eventType === "UPDATE") {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === payload.new.id ? payload.new : product
        )
      );
      toast.success("Product updated in real-time!");
    } else if (payload.eventType === "DELETE") {
      setProducts((prev) =>
        prev.filter((product) => product.id !== payload.old.id)
      );
      toast.success("Product deleted in real-time!");
    }
  }, []);

  useProductUpdates(handleRealtimeUpdate);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");

      if (response.ok) {
        const data = await response.json();
        logger.info(
          "📦 Products fetched:",
          String(data.products?.length || 0),
          "products"
        );
        setProducts(data.products || []);
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "Failed to fetch products:",
            response.status,
            response.statusText
          );
        }
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching products:", error);
      }
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  // Optimized filtering and sorting with memoization
  const filteredAndSortedProducts = useMemo(() => {
    // Early return if no products
    if (products.length === 0) return [];

    const filtered = products.filter((product) => {
      // Early return for better performance
      if (statusFilter !== "all") {
        const isActive = product.is_active;
        if (statusFilter === "active" && !isActive) return false;
        if (statusFilter === "inactive" && isActive) return false;
      }

      if (featuredFilter !== "all") {
        const isFeatured = product.is_featured;
        if (featuredFilter === "featured" && !isFeatured) return false;
        if (featuredFilter === "not-featured" && isFeatured) return false;
      }

      if (selectedCategory !== "all") {
        const productCategory = product.category || product.categories?.name;
        if (productCategory?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search filter - only apply if search term exists
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    });

    // Optimized sorting
    if (filtered.length > 0) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          const comparison = aValue - bValue;
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }

        // Handle date fields
        if (
          sortConfig.field === "created_at" ||
          sortConfig.field === "updated_at"
        ) {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          const comparison = aDate.getTime() - bDate.getTime();
          return sortConfig.direction === "asc" ? comparison : -comparison;
        }

        return 0;
      });
    }

    return filtered;
  }, [
    products,
    searchTerm,
    selectedCategory,
    statusFilter,
    featuredFilter,
    sortConfig,
  ]);

  // Calculate pagination values
  const totalItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  logger.debug(
    "🔍 Filtering debug:",
    JSON.stringify({
      totalProducts: products.length,
      filteredProducts: filteredAndSortedProducts.length,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
      currentProductsLength: currentProducts.length,
    })
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategory,
    statusFilter,
    featuredFilter,
    itemsPerPage,
    sortConfig,
  ]);

  const handleCreateProduct = () => {
    window.location.href = "/admin/products/new";
  };

  const handleEditProduct = (product: Product) => {
    window.location.href = `/admin/products/${product.id}`;
  };

  const handleDeleteProduct = async (productId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;

    try {
      setDeleting(productId);

      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Product deleted successfully!");
        await fetchProducts();
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to delete product:", result.error);
        }
        toast.error(result.error || "Failed to delete product");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting product:", error);
      }
      toast.error("Error deleting product");
    } finally {
      setDeleting(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (sortValue: string) => {
    const sortOption = sortOptions.find((option) => option.value === sortValue);
    if (sortOption) {
      setSortConfig({
        field: sortOption.field,
        direction: sortOption.direction,
      });
    }
    setSortDropdownOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts();
      toast.success("Products refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh products");
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setStatusFilter("all");
    setFeaturedFilter("all");
    setSortConfig({ field: "created_at", direction: "desc" });
  };

  const getStatusBadge = (product: Product) => {
    if (product.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 shadow-sm">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
  };

  const getFeaturedBadge = (product: Product) => {
    if (product.is_featured) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 shadow-sm">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </span>
      );
    }
    return null;
  };

  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(
      (option) =>
        option.field === sortConfig.field &&
        option.direction === sortConfig.direction
    );
    return currentOption?.label || "Date Created (Newest)";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <EnhancedCard
        variant="gradient"
        padding="lg"
        className="admin-header-section"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 admin-header-title">
              Product Management
            </h1>
            <p className="text-gray-600 text-lg admin-header-description">
              Manage your medical equipment inventory with advanced filtering
              and sorting
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 px-4 py-2 rounded-lg admin-header-stats">
              <Package className="w-4 h-4" />
              <span className="font-semibold">{totalItems} total products</span>
            </div>

            <EnhancedButton
              variant="primary"
              onClick={handleCreateProduct}
              icon={<Plus className="w-4 h-4" />}
              size="lg"
            >
              Add New Product
            </EnhancedButton>
          </div>
        </div>
      </EnhancedCard>

      {/* Search and Filter Section */}
      <EnhancedCard
        variant="outline"
        padding="lg"
        className="admin-filter-section"
      >
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <EnhancedInput
              type="text"
              placeholder="Search products by name, description, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-base admin-filter-input"
              variant="outline"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 admin-filter-grid">
            {/* Category Filter */}
            <div className="admin-filter-item">
              <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-filter-select"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="admin-filter-item">
              <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div className="admin-filter-item">
              <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                Featured
              </label>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-filter-select"
              >
                <option value="all">All Products</option>
                <option value="featured">Featured Only</option>
                <option value="not-featured">Not Featured</option>
              </select>
            </div>

            {/* Items Per Page */}
            <div className="admin-filter-item">
              <label className="block text-sm font-medium text-gray-700 mb-2 admin-filter-label">
                Items Per Page
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 admin-filter-select"
              >
                <option value={6}>6 per page</option>
                <option value={9}>9 per page</option>
                <option value={12}>12 per page</option>
                <option value={18}>18 per page</option>
                <option value={24}>24 per page</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200 admin-filter-actions">
            <div className="flex items-center gap-4">
              <EnhancedButton
                variant="outline"
                onClick={clearFilters}
                icon={<Settings className="w-4 h-4" />}
                size="sm"
              >
                Clear Filters
              </EnhancedButton>

              <div className="text-sm text-gray-600 admin-filter-info">
                Showing{" "}
                <span className="font-semibold">{currentProducts.length}</span>{" "}
                of <span className="font-semibold">{totalItems}</span> products
              </div>
            </div>

            {/* Interactive Sort Dropdown */}
            <div className="flex items-center gap-2 admin-sort-controls">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <div className="relative sort-dropdown-container">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[200px]"
                >
                  <span className="truncate">{getCurrentSortLabel()}</span>
                  {sortDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {sortDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            sortConfig.field === option.field &&
                            sortConfig.direction === option.direction
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </EnhancedCard>

      {/* Refresh Button */}
      <div className="flex items-center justify-end admin-refresh-section">
        <EnhancedButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          icon={
            isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Settings className="w-4 h-4" />
            )
          }
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </EnhancedButton>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px] relative admin-product-grid">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: itemsPerPage }, (_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="h-full"
              >
                <EnhancedCard
                  variant="outline"
                  padding="lg"
                  animated={false}
                  loading={true}
                  className="h-full"
                >
                  <div className="animate-pulse space-y-4 h-full flex flex-col">
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200 flex-shrink-0">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </EnhancedCard>
              </motion.div>
            ))
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full text-center py-12"
            >
              <EnhancedCard variant="outline" padding="xl">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get started by adding your first medical equipment product
                    to the inventory
                  </p>
                  <EnhancedButton
                    variant="primary"
                    onClick={handleCreateProduct}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Add First Product
                  </EnhancedButton>
                </div>
              </EnhancedCard>
            </motion.div>
          ) : currentProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full text-center py-12"
            >
              <EnhancedCard variant="outline" padding="xl">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No products match your filters
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters
                  </p>
                  <EnhancedButton
                    variant="outline"
                    onClick={clearFilters}
                    icon={<Settings className="w-4 h-4" />}
                  >
                    Clear Filters
                  </EnhancedButton>
                </div>
              </EnhancedCard>
            </motion.div>
          ) : (
            currentProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="h-full"
              >
                <div className="admin-product-card group">
                  {/* Image Section with Top Labels */}
                  <div className="admin-product-card-image">
                    <Image
                      src={
                        product.image_url ||
                        (product.images && product.images.length > 0
                          ? typeof product.images[0] === "string"
                            ? product.images[0]
                            : product.images[0]?.url ||
                              "/assets/images/placeholder-product.svg"
                          : "/assets/images/placeholder-product.svg")
                      }
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      priority={index < 4}
                    />

                    {/* Top Labels - Fixed Position */}
                    <div className="admin-product-card-labels">
                      <div className="admin-product-card-labels-left">
                        {getStatusBadge(product)}
                        {getFeaturedBadge(product)}
                      </div>
                      <div className="admin-product-card-labels-right">
                        <span className="admin-product-card-category">
                          {product.category ||
                            product.categories?.name ||
                            "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content Section */}
                  <div className="admin-product-card-content">
                    {/* Title */}
                    <h3 className="admin-product-card-title group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="admin-product-card-description">
                      {product.description}
                    </p>

                    {/* Product Info */}
                    <div className="admin-product-card-info">
                      <div className="admin-product-card-info-item">
                        <Info className="admin-product-card-info-icon" />
                        <span className="font-mono truncate">
                          {product.sku}
                        </span>
                      </div>
                      <div className="admin-product-card-info-item">
                        <TrendingUp className="admin-product-card-info-icon" />
                        <span>
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="admin-product-card-actions">
                      <div className="admin-product-card-actions-grid">
                        <EnhancedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                          icon={<Edit className="w-3 h-3" />}
                          disabled={deleting === product.id}
                          className="admin-product-card-button"
                        >
                          Edit
                        </EnhancedButton>
                        <EnhancedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                          icon={<Trash2 className="w-3 h-3" />}
                          className="admin-product-card-button admin-product-card-button-delete"
                          disabled={deleting === product.id}
                          loading={deleting === product.id}
                        >
                          Delete
                        </EnhancedButton>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && totalPages > 1 && (
        <div className="admin-pagination">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            className="mt-8"
          />
        </div>
      )}
    </div>
  );
}
