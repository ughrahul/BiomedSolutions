// Custom hooks for API integration with FastAPI backend

import { useState, useEffect, useCallback } from "react";
import {
  Product,
  ProductListResponse,
  ProductDetailResponse,
  ProductFilter,
  ProductSort,
} from "@/types/product";

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Generic API hook
export function useApi<T>(endpoint: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Products API hooks
export function useProducts(
  filters?: ProductFilter,
  sort?: ProductSort,
  page = 1,
  limit = 12
) {
  const queryParams = new URLSearchParams();

  if (filters?.search) queryParams.append("search", filters.search);
  if (filters?.categories?.length)
    queryParams.append("categories", filters.categories.join(","));
  if (filters?.priceRange?.min)
    queryParams.append("min_price", filters.priceRange.min.toString());
  if (filters?.priceRange?.max)
    queryParams.append("max_price", filters.priceRange.max.toString());
  if (filters?.inStock !== undefined)
    queryParams.append("in_stock", filters.inStock.toString());
  if (sort?.field) queryParams.append("sort_by", sort.field);
  if (sort?.direction) queryParams.append("sort_order", sort.direction);

  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());

  const endpoint = `/products?${queryParams.toString()}`;

  return useApi<ProductListResponse>(endpoint);
}

export function useProduct(id: string) {
  return useApi<ProductDetailResponse>(`/products/${id}`);
}

export function useFeaturedProducts(limit = 6) {
  return useApi<Product[]>(`/products/featured?limit=${limit}`);
}

// Admin API hooks
export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (productData: FormData) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: productData,
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      const newProduct = await response.json();
      setProducts((prev) => [...prev, newProduct]);
      return { success: true, product: newProduct };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create product",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, productData: FormData) => {
      try {
        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
          body: productData,
        });

        if (!response.ok) {
          throw new Error("Failed to update product");
        }

        const updatedProduct = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updatedProduct : p))
        );
        return { success: true, product: updatedProduct };
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update product"
        );
        return {
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to update product",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete product",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

// Analytics API hooks
export function useAnalytics() {
  return useApi<{
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    revenue: number;
    recentActivity: any[];
    popularProducts: Product[];
  }>("/admin/analytics");
}

// Search API hook
export function useSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setResults(data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs]);

  return { results, loading, error };
}

// Contact form API hook
export function useContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitForm = useCallback(
    async (formData: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      message: string;
      subject?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to submit form");
        }

        return { success: true };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit form";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submitForm, loading, error };
}

// Newsletter subscription hook
export function useNewsletter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to subscribe";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return { subscribe, loading, error };
}
