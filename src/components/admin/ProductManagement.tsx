"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Upload,
  ImageIcon,
  Package,
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import toast from "react-hot-toast";
import type { Product, CreateProductData } from "@/types/product";
import { useProductUpdates } from "@/contexts/RealtimeContext";

interface ProductManagementProps {
  className?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  image_url: string;
  category: string;
}

export default function ProductManagement({
  className = "",
}: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  // Real-time subscription for product updates
  const handleRealtimeUpdate = useCallback((payload: any) => {
            // Real-time product update received
    
    if (payload.eventType === 'INSERT') {
      // New product added
      setProducts(prev => [payload.new, ...prev]);
      toast.success("New product added in real-time!");
    } else if (payload.eventType === 'UPDATE') {
      // Product updated
      setProducts(prev => 
        prev.map(product => 
          product.id === payload.new.id ? payload.new : product
        )
      );
      toast.success("Product updated in real-time!");
    } else if (payload.eventType === 'DELETE') {
      // Product deleted
      setProducts(prev => 
        prev.filter(product => product.id !== payload.old.id)
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
        setProducts(data.products || []);
      } else {
        console.error("Failed to fetch products:", response.status, response.statusText);
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    // Navigate to the dedicated new product page
    window.location.href = '/admin/products/new';
  };

  const handleEditProduct = (product: Product) => {
    // Navigate to the dedicated edit product page
    window.location.href = `/admin/products/${product.id}`;
  };

  const handleSaveProduct = async () => {
    try {
      setSaving(true);

      if (isCreating) {
        // Create new product via API
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success("Product created successfully!");
          // Refresh products list
          await fetchProducts();
          setIsCreating(false);
          setFormData({
            name: "",
            description: "",
            image_url: "",
            category: "imaging",
          });
        } else {
          console.error("Failed to create product:", result.error);
          toast.error(result.error || "Failed to create product");
        }
      } else if (selectedProduct) {
        // Update existing product via API
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            category: formData.category,
            updated_at: new Date().toISOString(),
          }),
        });

        const result = await response.json();

        if (response.ok) {
          toast.success("Product updated successfully!");
          // Refresh products list
          await fetchProducts();
          setIsEditing(false);
          setSelectedProduct(null);
        } else {
          console.error("Failed to update product:", result.error);
          toast.error(result.error || "Failed to update product");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      setDeleting(productId);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Product deleted successfully!");
        // Refresh products list
        await fetchProducts();
      } else {
        console.error("Failed to delete product:", result.error);
        toast.error(result.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    } finally {
      setDeleting(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show loading state
        toast.loading("Uploading image...");
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'products');
        
        // Upload to Supabase storage via API
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (response.ok && result.url) {
          setFormData((prev) => ({ ...prev, image_url: result.url }));
          toast.success("Image uploaded successfully!");
        } else {
          throw new Error(result.error || "Upload failed");
        }
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error("Failed to upload image. Please try again.");
      }
    }
  };

  if (isCreating || isEditing) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isCreating ? "Add New Product" : "Edit Product"}
            </h2>
            <p className="text-gray-600">
              {isCreating
                ? "Create a new medical equipment entry"
                : "Update product information"}
            </p>
          </div>
          <EnhancedButton
            variant="outline"
            onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              setSelectedProduct(null);
            }}
            icon={<X className="w-4 h-4" />}
          >
            Cancel
          </EnhancedButton>
        </div>

        {/* Product Form */}
        <EnhancedCard variant="outline" padding="lg">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <EnhancedInput
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter product name"
                  variant="outline"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter detailed product description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Product Image */}
            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image <span className="text-red-500">*</span>
                </label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    name="image-upload"
                    autoComplete="off"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload image</p>
                    <p className="text-sm text-gray-400">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </label>
                </div>

                {formData.image_url && (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image_url: "" }))
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter image URL
                  </label>
                  <EnhancedInput
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                    variant="outline"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <EnhancedButton
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedProduct(null);
                }}
                disabled={saving}
              >
                Cancel
              </EnhancedButton>
              <EnhancedButton
                variant="primary"
                onClick={handleSaveProduct}
                icon={<Save className="w-4 h-4" />}
                disabled={
                  !formData.name || !formData.description || !formData.image_url || saving
                }
                loading={saving}
              >
                {isCreating ? "Create Product" : "Update Product"}
              </EnhancedButton>
            </div>
          </div>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-gray-600">
              Manage your medical equipment inventory
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <span>{products.length} total products</span>
          </div>
        </div>
        <EnhancedButton
          variant="primary"
          onClick={handleCreateProduct}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </EnhancedButton>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-h-[400px] relative">
        {loading ? (
          Array.from({ length: 6 }, (_, index) => (
            <EnhancedCard key={index} variant="outline" padding="lg" animated={false}>
              <div className="animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </EnhancedCard>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first product
            </p>
            <EnhancedButton
              variant="primary"
              onClick={handleCreateProduct}
              icon={<Plus className="w-4 h-4" />}
            >
              Add First Product
            </EnhancedButton>
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product.id}
              className="block"
              style={{ 
                opacity: 1,
                visibility: 'visible',
                display: 'block'
              }}
            >
                <EnhancedCard variant="outline" padding="lg" hover="both" animated={false}>
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={product.image_url || (product.images && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || "/assets/images/placeholder-product.svg") : "/assets/images/placeholder-product.svg")}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/assets/images/placeholder-product.svg";
                      }}
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                        {product.category || (product.categories?.name || 'Unknown')}
                      </span>
                      {product.is_featured && (
                        <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <EnhancedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProduct(product)}
                        icon={<Edit className="w-3 h-3" />}
                        disabled={deleting === product.id}
                      >
                        Edit
                      </EnhancedButton>
                      <EnhancedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        icon={<Trash2 className="w-3 h-3" />}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleting === product.id}
                        loading={deleting === product.id}
                      >
                        Delete
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
