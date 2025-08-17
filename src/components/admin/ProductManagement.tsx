"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Upload,
  ImageIcon,
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import toast from "react-hot-toast";
import type { Product, CreateProductData } from "@/types/product";

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
        console.error("Failed to fetch products");
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
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      image_url: "",
      category: "imaging",
    });
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setFormData({
      name: product.name,
      description: product.description,
      image_url: product.image_url,
      category: product.category,
    });
  };

  const handleSaveProduct = async () => {
    try {
      console.log("Saving product:", formData);

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
          console.log("Product created successfully:", result);
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
        // For demo purposes, just update locally
        const updatedProducts = products.map((p) =>
          p.id === selectedProduct.id
            ? { ...p, ...formData, updated_at: new Date().toISOString() }
            : p
        );
        setProducts(updatedProducts);
        toast.success("Product updated successfully!");
        setIsEditing(false);
        setSelectedProduct(null);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error saving product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // For demo purposes, just remove from local state
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for the image
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
      toast.success("Image uploaded successfully!");
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
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
                  Category *
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
                Description *
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
                Product Image *
              </label>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
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
              >
                Cancel
              </EnhancedButton>
              <EnhancedButton
                variant="primary"
                onClick={handleSaveProduct}
                icon={<Save className="w-4 h-4" />}
                disabled={
                  !formData.name || !formData.description || !formData.image_url
                }
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Product Management
          </h2>
          <p className="text-gray-600">
            Manage your medical equipment inventory
          </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }, (_, index) => (
            <EnhancedCard key={index} variant="outline" padding="md">
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
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <EnhancedCard variant="outline" padding="md" hover="both">
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/assets/images/placeholder-product.svg";
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">
                        {product.category}
                      </span>
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
                      >
                        Edit
                      </EnhancedButton>
                      <EnhancedButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        icon={<Trash2 className="w-3 h-3" />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </EnhancedButton>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
