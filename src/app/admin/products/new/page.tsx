"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase";
import { ArrowLeft, Upload, X, Plus, Save, Package } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { generateSKU } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";

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
  full_description: string;
  sku: string;
  category_id: string;
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  benefits: string[];
  warranty: string;
  certifications: string[];
  rating: number;
  review_count: number;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    short_description: "",
    full_description: "",
    sku: "",
    category_id: "",
    images: [],
    specifications: {},
    features: [],
    benefits: [],
    warranty: "1 year",
    certifications: [],
    rating: 4.5,
    review_count: 0,
    tags: [],
    is_active: true,
    is_featured: false,
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
    if (!supabase) {
      toast.error("Database connection not available");
      return;
    }
    
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

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
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
          : error.toLowerCase().includes("sku")
          ? "sku"
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
      console.log("Submitting form data:", formData);

      // Sanitize string inputs
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name),
        description: sanitizeInput(formData.description),
        short_description: sanitizeInput(formData.short_description),
        full_description: sanitizeInput(formData.full_description),
        sku: sanitizeInput(formData.sku),
        warranty: sanitizeInput(formData.warranty),
      };

      console.log("Sanitized data:", sanitizedData);

      // Submit to API endpoint
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || result.details || 'Failed to create product';
        const errorDetails = result.missingFields ? `Missing fields: ${result.missingFields.join(', ')}` : '';
        const fullError = errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage;
        throw new Error(fullError);
      }

      console.log("Product created successfully:", result);

      toast.success("Product created successfully!");
      router.push(`/admin/products/${result.data.id}`);
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPageWrapper>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mt-4"
      >
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="sm" className="text-yellow-700 hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Add New Product
            </h1>
            <p className="text-gray-600">
              Create a comprehensive medical equipment product listing
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
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Basic Information
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Enter the essential details of your medical equipment product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-lg font-bold text-gray-900">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="product-name"
                    name="product-name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full h-14 rounded-xl border-2 bg-white px-4 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                    }`}
                    required
                    autoComplete="off"
                  />
                  {errors.name && (
                    <p className="text-red-500 font-medium text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-lg font-bold text-gray-900">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="product-category"
                    name="product-category"
                    value={formData.category_id}
                    onChange={(e) =>
                      handleInputChange("category_id", e.target.value)
                    }
                    className={`h-14 w-full rounded-xl border-2 bg-white px-4 text-lg text-gray-900 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      errors.category_id
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                    }`}
                    required
                    autoComplete="off"
                  >
                    <option value="" className="bg-white text-gray-900">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-white text-gray-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 font-medium text-sm">{errors.category_id}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-900">
                  SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="product-sku"
                  name="product-sku"
                  placeholder="Auto-generated SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  className={`w-full h-14 rounded-xl border-2 bg-gray-50 px-4 text-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    errors.sku
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                  }`}
                  required
                  readOnly
                  autoComplete="off"
                />
                <p className="text-sm text-gray-600">SKU is automatically generated based on product name and category</p>
                {errors.sku && (
                  <p className="text-red-500 font-medium text-sm">{errors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-900">
                  Short Description
                </label>
                <textarea
                  id="product-short-description"
                  name="product-short-description"
                  placeholder="Brief product description (max 500 characters)"
                  value={formData.short_description}
                  onChange={(e) =>
                    handleInputChange("short_description", e.target.value)
                  }
                  className="w-full h-24 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-blue-400 focus:ring-blue-500/30 transition-all duration-300 resize-none"
                  maxLength={500}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-900">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="product-description"
                  name="product-description"
                  placeholder="Detailed product description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full h-32 rounded-xl border-2 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 resize-none ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                  }`}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 font-medium text-sm">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                Product Images
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Upload high-quality images of your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  name="image-upload"
                  disabled={imageUploading}
                  autoComplete="off"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 mb-2 font-medium">
                    {imageUploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-sm text-gray-600">
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
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
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
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Features & Specifications
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Add key features and technical specifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Features */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Features
                </h4>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add a feature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                    className="flex-1 h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  />
                  <Button type="button" onClick={addFeature} variant="outline" className="h-12">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-gray-900">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Specifications
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  <input
                    type="text"
                    id="spec-name"
                    name="spec-name"
                    placeholder="Specification name"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                    autoComplete="off"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="spec-value"
                      name="spec-value"
                      placeholder="Specification value"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addSpecification())
                      }
                      className="flex-1 h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                      autoComplete="off"
                    />
                    <Button
                      type="button"
                      onClick={addSpecification}
                      variant="outline"
                      className="h-12"
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
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <span className="text-gray-600 text-sm font-medium">
                            {key}
                          </span>
                          <span className="text-gray-900 ml-4">{value}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecification(key)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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

        {/* Additional Product Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Additional Information
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Add benefits, certifications, and other details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Full Description */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-2">
                  Full Description *
                </label>
                <textarea
                  id="product-full-description"
                  name="product-full-description"
                  placeholder="Comprehensive product description for detail page"
                  value={formData.full_description}
                  onChange={(e) =>
                    handleInputChange("full_description", e.target.value)
                  }
                  className="w-full h-32 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-blue-400 focus:ring-blue-500/30 transition-all duration-300 resize-none"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Benefits */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Product Benefits
                </h4>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    id="product-benefit"
                    name="product-benefit"
                    placeholder="Add a benefit"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addBenefit())
                    }
                    className="flex-1 h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                    autoComplete="off"
                  />
                  <Button type="button" onClick={addBenefit} variant="outline" className="h-12">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-gray-900">{benefit}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Certifications
                </h4>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    id="product-certification"
                    name="product-certification"
                    placeholder="Add certification (e.g., CE Marked, FDA Approved)"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCertification())
                    }
                    className="flex-1 h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                    autoComplete="off"
                  />
                  <Button type="button" onClick={addCertification} variant="outline" className="h-12">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.certifications.map((certification, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-gray-900">{certification}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Product Tags
                </h4>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    className="flex-1 h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  />
                  <Button type="button" onClick={addTag} variant="outline" className="h-12">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
                    >
                      <span className="text-sm font-medium">{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Ratings & Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Ratings & Reviews
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Set initial rating and review count
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                    value={formData.rating || ""}
                    onChange={(e) =>
                      handleInputChange("rating", parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-lg text-gray-900 focus:outline-none focus:ring-4 focus:border-blue-400 focus:ring-blue-500/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    Review Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.review_count || ""}
                    onChange={(e) =>
                      handleInputChange("review_count", parseInt(e.target.value) || 0)
                    }
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-lg text-gray-900 focus:outline-none focus:ring-4 focus:border-blue-400 focus:ring-blue-500/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    Warranty
                  </label>
                  <input
                    type="text"
                    placeholder="1 year"
                    value={formData.warranty}
                    onChange={(e) =>
                      handleInputChange("warranty", e.target.value)
                    }
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-lg text-gray-900 focus:outline-none focus:ring-4 focus:border-blue-400 focus:ring-blue-500/30 transition-all duration-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Status & Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-gray-100">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                Product Status & Settings
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                Configure product visibility and featured status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Status */}
                <div className="space-y-4">
                  <label className="block text-lg font-bold text-gray-900">
                    Product Status
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        value="true"
                        checked={formData.is_active === true}
                        onChange={(e) => handleInputChange("is_active", e.target.value === "true")}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-900 font-medium">Active</span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="is_active"
                        value="false"
                        checked={formData.is_active === false}
                        onChange={(e) => handleInputChange("is_active", e.target.value === "true")}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-900 font-medium">Inactive</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Active products are visible to customers, inactive products are hidden
                  </p>
                </div>

                {/* Featured Status */}
                <div className="space-y-4">
                  <label className="block text-lg font-bold text-gray-900">
                    Featured Product
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => handleInputChange("is_featured", e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span className="text-gray-900 font-medium">Mark as Featured</span>
                      </div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Featured products appear prominently on the homepage and in featured sections
                  </p>
                </div>
              </div>

              {/* Featured Product Benefits */}
              {formData.is_featured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                        Featured Product Benefits
                      </h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Appears on the homepage featured section</li>
                        <li>• Highlighted in product listings</li>
                        <li>• Increased visibility to customers</li>
                        <li>• Priority placement in search results</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center gap-6 pt-8"
        >
          <Link href="/admin/products">
            <button
              type="button"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-lg shadow-sm"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Product...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Save className="w-5 h-5" />
                Create Product
              </div>
            )}
          </button>
        </motion.div>
      </form>
    </AdminPageWrapper>
  );
}
