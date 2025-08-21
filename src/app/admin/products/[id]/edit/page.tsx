"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase";
import { ArrowLeft, Upload, X, Plus, Save, Package } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  // Fetch product data and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;

      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch product data
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*, categories(name, slug)")
          .eq("id", productId)
          .single();

        if (productError) {
          if (productError.code === "PGRST116") {
            toast.error("Product not found");
            router.push("/admin/products");
            return;
          }
          throw productError;
        }

        // Populate form with existing product data
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          short_description: productData.short_description || "",
          full_description: productData.full_description || productData.description || "",
          sku: productData.sku || "",
          category_id: productData.category_id || "",
          images: Array.isArray(productData.images) ? productData.images : [],
          specifications: productData.specifications || {},
          features: Array.isArray(productData.features) ? productData.features : [],
          benefits: Array.isArray(productData.benefits) ? productData.benefits : [],
          warranty: productData.warranty || "1 year",
          certifications: Array.isArray(productData.certifications) ? productData.certifications : [],
          rating: productData.rating || 4.5,
          review_count: productData.review_count || 0,
          tags: Array.isArray(productData.tags) ? productData.tags : [],
          is_active: productData.is_active !== undefined ? productData.is_active : true,
          is_featured: productData.is_featured !== undefined ? productData.is_featured : false,
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load product data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, productId, router]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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

    setIsSaving(true);

    try {
      console.log("Updating product data:", formData);

      // Sanitize string inputs
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name),
        description: sanitizeInput(formData.description),
        short_description: sanitizeInput(formData.short_description),
        full_description: sanitizeInput(formData.full_description),
        sku: sanitizeInput(formData.sku),
        warranty: sanitizeInput(formData.warranty),
        updated_at: new Date().toISOString(),
      };

      console.log("Sanitized data:", sanitizedData);

      // Update product via API endpoint
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || result.details || 'Failed to update product';
        const errorDetails = result.missingFields ? `Missing fields: ${result.missingFields.join(', ')}` : '';
        const fullError = errorDetails ? `${errorMessage}. ${errorDetails}` : errorMessage;
        throw new Error(fullError);
      }

      console.log("Product updated successfully:", result);

      toast.success("Product updated successfully!");
      router.push(`/admin/products/${productId}`);
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPageWrapper>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </AdminPageWrapper>
    );
  }

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
          <Link href={`/admin/products/${productId}`}>
            <Button variant="ghost" size="sm" className="text-yellow-700 hover:bg-yellow-50 border border-yellow-200 hover:border-yellow-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Product
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Edit Product
            </h1>
            <p className="text-gray-600">
              Update product information and details
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
                Update the essential details of your medical equipment product
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
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full h-14 rounded-xl border-2 bg-white px-4 text-lg text-black placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                    }`}
                    style={{ color: 'black', backgroundColor: 'white' }}
                    required
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
                    value={formData.category_id}
                    onChange={(e) =>
                      handleInputChange("category_id", e.target.value)
                    }
                    className={`h-14 w-full rounded-xl border-2 bg-white px-4 text-lg text-black focus:outline-none focus:ring-4 transition-all duration-300 ${
                      errors.category_id
                        ? "border-red-500 focus:ring-red-500/30"
                        : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                    }`}
                    style={{ color: 'black', backgroundColor: 'white' }}
                    required
                  >
                    <option value="" className="bg-white text-black">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} className="bg-white text-black">
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
                  placeholder="Product SKU"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  className={`w-full h-14 rounded-xl border-2 bg-white px-4 text-lg text-black placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 ${
                    errors.sku
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                  }`}
                  style={{ color: 'black', backgroundColor: 'white' }}
                  required
                />
                {errors.sku && (
                  <p className="text-red-500 font-medium text-sm">{errors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-900">
                  Short Description
                </label>
                <textarea
                  placeholder="Brief product description (max 500 characters)"
                  value={formData.short_description}
                  onChange={(e) =>
                    handleInputChange("short_description", e.target.value)
                  }
                  className="w-full h-24 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-lg text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:border-blue-400 focus:ring-blue-500/30 transition-all duration-300 resize-none"
                  style={{ color: 'black', backgroundColor: 'white' }}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-bold text-gray-900">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Detailed product description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full h-32 rounded-xl border-2 bg-white px-4 py-3 text-lg text-black placeholder-gray-500 focus:outline-none focus:ring-4 transition-all duration-300 resize-none ${
                    errors.description
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-gray-200 focus:border-blue-400 focus:ring-blue-500/30"
                  }`}
                  style={{ color: 'black', backgroundColor: 'white' }}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 font-medium text-sm">{errors.description}</p>
                )}
              </div>
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
                    style={{ color: 'black', backgroundColor: 'white' }}
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
                    placeholder="Specification name"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    className="h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                    style={{ color: 'black', backgroundColor: 'white' }}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Specification value"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addSpecification())
                      }
                      className="flex-1 h-12 rounded-lg border border-gray-200 bg-white px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                      style={{ color: 'black', backgroundColor: 'white' }}
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
          <Link href={`/admin/products/${productId}`}>
            <button
              type="button"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 text-lg shadow-sm"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating Product...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Save className="w-5 h-5" />
                Update Product
              </div>
            )}
          </button>
        </motion.div>
      </form>
    </AdminPageWrapper>
  );
}
