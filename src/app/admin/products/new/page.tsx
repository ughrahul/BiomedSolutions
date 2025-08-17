"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, Plus, Trash2, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { generateSKU } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Simple input sanitization function
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Product validation function
const validateProductData = (data: ProductFormData) => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("Product name is required");
  }
  if (!data.description.trim()) {
    errors.push("Product description is required");
  }
  if (!data.price || data.price <= 0) {
    errors.push("Valid price is required");
  }
  if (!data.sku.trim()) {
    errors.push("SKU is required");
  }
  if (!data.category_id.trim()) {
    errors.push("Category is required");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  category_id: string;
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    short_description: "",
    price: 0,
    sale_price: undefined,
    sku: "",
    stock_quantity: 0,
    category_id: "",
    images: [],
    specifications: {},
    features: [],
    is_active: true,
    is_featured: false,
    meta_title: "",
    meta_description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createClientSupabase();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [supabase]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-generate SKU when name or category changes
    if (field === "name" || field === "category_id") {
      const category = categories.find(
        (c) => c.id === (field === "category_id" ? value : formData.category_id)
      );
      if (formData.name && category) {
        const autoSKU = generateSKU(
          field === "name" ? value : formData.name,
          category.slug
        );
        setFormData((prev) => ({ ...prev, sku: autoSKU }));
      }
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImageUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.type}`);
        }

        if (file.size > maxSize) {
          throw new Error(
            `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`
          );
        }

        const fileName = `products/${Date.now()}-${file.name}`;

        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName);

        return publicUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));

      toast.success(`${imageUrls.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error("Error uploading images:", error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, sanitizeInput(newFeature.trim())],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [sanitizeInput(newSpecKey.trim())]: sanitizeInput(
            newSpecValue.trim()
          ),
        },
      }));
      setNewSpecKey("");
      setNewSpecValue("");
    }
  };

  const removeSpecification = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([k]) => k !== key)
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = validateProductData(formData);
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((error) => {
        const field = error.toLowerCase().includes("name")
          ? "name"
          : error.toLowerCase().includes("description")
          ? "description"
          : error.toLowerCase().includes("price")
          ? "price"
          : error.toLowerCase().includes("sku")
          ? "sku"
          : error.toLowerCase().includes("stock")
          ? "stock_quantity"
          : error.toLowerCase().includes("category")
          ? "category_id"
          : "general";
        newErrors[field] = error;
      });
      setErrors(newErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize string inputs
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name),
        description: sanitizeInput(formData.description),
        short_description: sanitizeInput(formData.short_description),
        sku: sanitizeInput(formData.sku),
        meta_title: formData.meta_title
          ? sanitizeInput(formData.meta_title)
          : null,
        meta_description: formData.meta_description
          ? sanitizeInput(formData.meta_description)
          : null,
      };

      const { data, error } = await supabase
        .from("products")
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;

      toast.success("Product created successfully!");
      router.push(`/admin/products/${data.id}`);
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Add New Product
            </h1>
            <p className="text-secondary-400">
              Create a new medical equipment product
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Product Name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={errors.name}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      handleInputChange("category_id", e.target.value)
                    }
                    className={`h-14 w-full rounded-lg border bg-secondary-800/50 backdrop-blur-sm px-4 text-sm text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
                      errors.category_id
                        ? "border-red-500 focus:ring-red-500"
                        : "border-secondary-600 focus:ring-primary-500"
                    }`}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-sm text-red-500 font-medium mt-2">
                      {errors.category_id}
                    </p>
                  )}
                </div>
              </div>

              <Input
                label="SKU (Stock Keeping Unit)"
                placeholder="Auto-generated or enter custom SKU"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                error={errors.sku}
                required
              />

              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-2">
                  Short Description
                </label>
                <textarea
                  placeholder="Brief product description (max 500 characters)"
                  value={formData.short_description}
                  onChange={(e) =>
                    handleInputChange("short_description", e.target.value)
                  }
                  className="w-full h-24 rounded-lg border border-secondary-600 bg-secondary-800/50 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 resize-none"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-400 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Detailed product description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full h-32 rounded-lg border bg-secondary-800/50 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500"
                      : "border-secondary-600 focus:ring-primary-500"
                  }`}
                  required
                />
                {errors.description && (
                  <p className="text-sm text-red-500 font-medium mt-2">
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing & Inventory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Pricing & Inventory</CardTitle>
              <CardDescription>
                Set pricing and stock information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Regular Price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price || ""}
                  onChange={(e) =>
                    handleInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  error={errors.price}
                  required
                />
                <Input
                  label="Sale Price (Optional)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.sale_price || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "sale_price",
                      parseFloat(e.target.value) || undefined
                    )
                  }
                />
                <Input
                  label="Stock Quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock_quantity || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "stock_quantity",
                      parseInt(e.target.value) || 0
                    )
                  }
                  error={errors.stock_quantity}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Product Images</CardTitle>
              <CardDescription>
                Upload high-quality images of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-secondary-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={imageUploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-white mb-2">
                    {imageUploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-sm text-secondary-400">
                    Supports JPEG, PNG, WebP. Max 5MB each.
                  </p>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features & Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                Features & Specifications
              </CardTitle>
              <CardDescription>
                Add key features and technical specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">
                  Features
                </h4>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add a feature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                    className="flex-1"
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary-800/30 rounded-lg"
                    >
                      <span className="text-white">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">
                  Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  <Input
                    placeholder="Specification name"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Specification value"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addSpecification())
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addSpecification}
                      variant="outline"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 bg-secondary-800/30 rounded-lg"
                      >
                        <div>
                          <span className="text-secondary-400 text-sm">
                            {key}
                          </span>
                          <span className="text-white ml-4">{value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Product Settings</CardTitle>
              <CardDescription>
                Configure product visibility and SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Active Product</h4>
                  <p className="text-sm text-secondary-400">
                    Product will be visible to customers
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleInputChange("is_active", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Featured Product</h4>
                  <p className="text-sm text-secondary-400">
                    Product will appear in featured sections
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      handleInputChange("is_featured", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="SEO Title (Optional)"
                  placeholder="Custom page title for SEO"
                  value={formData.meta_title || ""}
                  onChange={(e) =>
                    handleInputChange("meta_title", e.target.value)
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-secondary-400 mb-2">
                    SEO Description (Optional)
                  </label>
                  <textarea
                    placeholder="Meta description for search engines"
                    value={formData.meta_description || ""}
                    onChange={(e) =>
                      handleInputChange("meta_description", e.target.value)
                    }
                    className="w-full h-24 rounded-lg border border-secondary-600 bg-secondary-800/50 backdrop-blur-sm px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300 resize-none"
                    maxLength={160}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-end gap-4"
        >
          <Link href="/admin/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            loading={isLoading}
            icon={<Save className="w-4 h-4" />}
            iconPosition="left"
          >
            {isLoading ? "Creating Product..." : "Create Product"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
