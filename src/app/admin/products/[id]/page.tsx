"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Tag,
  Eye,
  EyeOff,
  Zap,
  Info,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Settings,
  BarChart3,
  Image as ImageIcon,
  Hash,
  Award,
  Clock,
} from "lucide-react";
import { SafeCalendar as Calendar } from "@/components/ui/safe-icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClientSupabase } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { logger } from "@/lib/logger";

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  sku: string;
  category_id: string;
  images: string[];
  specifications: Record<string, any>;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  categories?: {
    name: string;
    slug: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const supabase = createClientSupabase();
  const productId = params.id as string;

  const fetchProduct = useCallback(async () => {
    if (!supabase) {
      toast.error("Database connection not available");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("id", productId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          toast.error("Product not found");
          router.push("/admin/products");
          return;
        }
        throw error;
      }

      setProduct(data);
    } catch (error) {
      logger.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  }, [productId, supabase, router]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const handleToggleStatus = async () => {
    if (!product || !supabase) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id);

      if (error) throw error;

      setProduct({ ...product, is_active: !product.is_active });
      toast.success(
        `Product ${
          !product.is_active ? "activated" : "deactivated"
        } successfully`
      );
    } catch (error) {
      logger.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleToggleFeatured = async () => {
    if (!product || !supabase) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !product.is_featured })
        .eq("id", product.id);

      if (error) throw error;

      setProduct({ ...product, is_featured: !product.is_featured });
      toast.success(
        `Product ${
          !product.is_featured ? "marked as featured" : "removed from featured"
        } successfully`
      );
    } catch (error) {
      logger.error("Error updating product featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !supabase) return;
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Product deleted successfully");
      router.push("/admin/products");
    } catch (error) {
      logger.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success(`${fieldName} copied to clipboard`);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success(`${fieldName} copied to clipboard`);
      }
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary-400">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="glass border-white/10">
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Product not found
          </h3>
          <p className="text-secondary-400 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/admin/products">
            <Button>Back to Products</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 mt-16 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-secondary-800/30 rounded-lg p-6 border border-secondary-700">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div className="h-6 w-px bg-secondary-600"></div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Hash className="w-4 h-4" />
            Product ID:{" "}
            <span className="text-white font-mono font-bold">{product.id}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className={
              product.is_active
                ? "border-red-500 text-red-400 hover:bg-red-500/10"
                : "border-green-500 text-green-400 hover:bg-green-500/10"
            }
          >
            {product.is_active ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {product.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFeatured}
            className={
              product.is_featured
                ? "border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                : ""
            }
          >
            <Zap className="w-4 h-4 mr-2" />
            {product.is_featured ? "Unfeature" : "Feature"}
          </Button>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-400 border-blue-500 hover:bg-blue-500/20 hover:text-blue-300"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDeleteProduct}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Title and Status */}
      <div className="bg-gradient-to-r from-secondary-800/50 to-secondary-900/50 rounded-lg p-8 border border-secondary-700">
        <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="outline"
            className="bg-secondary-700/50 text-white border-secondary-600"
          >
            <Hash className="w-3 h-3 mr-1" />
            SKU: {product.sku}
          </Badge>
          {product.categories && (
            <Badge className="bg-primary-500/20 text-primary-300 border-primary-500/30">
              <Package className="w-3 h-3 mr-1" />
              {product.categories.name}
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
          <Badge
            variant={product.is_active ? "default" : "destructive"}
            className={
              product.is_active
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : ""
            }
          >
            {product.is_active ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {product.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Images and Stats */}
        <div className="xl:col-span-1 space-y-6">
          {/* Product Images */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-black font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Product Images
                <Badge
                  variant="outline"
                  className="ml-auto text-xs bg-secondary-700/50"
                >
                  {product.images?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative h-80 overflow-hidden rounded-lg border border-secondary-600">
                    <Image
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    {product.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 rounded px-2 py-1 text-xs text-white font-medium">
                        {selectedImageIndex + 1} of {product.images.length}
                      </div>
                    )}
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            selectedImageIndex === index
                              ? "border-primary-500 ring-2 ring-primary-500/50"
                              : "border-secondary-600 hover:border-secondary-500"
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 bg-secondary-700 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-secondary-600">
                  <ImageIcon className="w-16 h-16 text-secondary-500 mb-3" />
                  <p className="text-secondary-400 text-center font-medium">
                    No images available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-black font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Product Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-black/50 rounded-lg border border-gray-700">
                  <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-300 font-bold mb-1">
                    Created
                  </p>
                  <p className="text-sm text-white font-bold">
                    {formatDate(product.created_at)}
                  </p>
                </div>
                <div className="text-center p-4 bg-black/50 rounded-lg border border-gray-700">
                  <Calendar className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-300 font-bold mb-1">
                    Updated
                  </p>
                  <p className="text-sm text-white font-bold">
                    {formatDate(product.updated_at)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-black/50 rounded-lg border border-gray-700">
                  <Tag className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-300 font-bold mb-1">
                    Features
                  </p>
                  <p className="text-sm text-white font-bold">
                    {product.features?.length || 0}
                  </p>
                </div>
                <div className="text-center p-4 bg-black/50 rounded-lg border border-gray-700">
                  <Settings className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-300 font-bold mb-1">
                    Specifications
                  </p>
                  <p className="text-sm text-white font-bold">
                    {Object.keys(product.specifications || {}).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="glass border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-black font-bold flex items-center gap-2">
                <Info className="w-5 h-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-blue-400 mb-2 block uppercase tracking-wide">
                    Product Name
                  </label>
                  <p className="text-white font-bold text-lg bg-gray-800/50 px-3 py-2 rounded border border-gray-600">
                    {product.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-bold text-green-400 mb-2 block uppercase tracking-wide">
                    SKU Code
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-lg bg-gray-800/50 px-3 py-2 rounded border border-gray-600">
                      {product.sku}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(product.sku, "SKU")}
                      className="h-8 w-8 p-0 hover:bg-green-500/20 text-green-400"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {product.short_description && (
                <div>
                  <label className="text-sm font-bold text-yellow-400 mb-2 block uppercase tracking-wide">
                    Short Description
                  </label>
                  <p className="text-white bg-gray-800/50 p-4 rounded-lg text-base leading-relaxed border border-gray-600">
                    {product.short_description}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-bold text-purple-400 mb-2 block uppercase tracking-wide">
                  Full Description
                </label>
                <div className="bg-gray-800/50 p-4 rounded-lg max-h-48 overflow-y-auto border border-gray-600">
                  <p className="text-white whitespace-pre-wrap text-base leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <Card className="glass border-white/10">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl text-black font-bold flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Product Features
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs bg-secondary-700/50"
                  >
                    {product.features.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-black/30 rounded-lg border border-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white text-base font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Specifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <Card className="glass border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-black font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Technical Specifications
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs bg-secondary-700/50"
                    >
                      {Object.keys(product.specifications).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-4 px-4 bg-black/30 rounded-lg border border-gray-700"
                        >
                          <span className="text-gray-300 text-sm font-bold capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="text-white font-bold text-sm">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 pt-8 border-t border-secondary-700">
        <Link href={`/admin/products/${product.id}/edit`}>
          <Button
            size="lg"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Product
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            const url = `/products/${product.id}`;
            const link = document.createElement("a");
            link.href = url;
            link.target = "_blank";
            link.click();
          }}
          className="text-green-400 border-green-500 hover:bg-green-500/20 hover:text-green-300 font-bold px-8"
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          View on Website
        </Button>
      </div>
    </div>
  );
}
