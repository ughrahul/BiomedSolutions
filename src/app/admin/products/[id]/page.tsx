"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Package,
  DollarSign,
  Calendar,
  Tag,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
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

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
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

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
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
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id);

      if (error) throw error;

      setProduct({ ...product, is_active: !product.is_active });
      toast.success(
        `Product ${!product.is_active ? "activated" : "deactivated"}`
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
    }
  };

  const handleToggleFeatured = async () => {
    if (!product) return;

    try {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !product.is_featured })
        .eq("id", product.id);

      if (error) throw error;

      setProduct({ ...product, is_featured: !product.is_featured });
      toast.success(
        `Product ${!product.is_featured ? "featured" : "unfeatured"}`
      );
    } catch (error) {
      console.error("Error updating product featured status:", error);
      toast.error("Failed to update featured status");
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
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
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
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
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/admin/products">
            <Button>Back to Products</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

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
              {product.name}
            </h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">SKU: {product.sku}</Badge>
              {product.categories && <Badge>{product.categories.name}</Badge>}
              {product.is_featured && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {!product.is_active && (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {product.stock_quantity < 10 && (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Low Stock
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            className={
              product.is_active
                ? "border-red-500 text-red-400"
                : "border-green-500 text-green-400"
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
            onClick={handleToggleFeatured}
            className={
              product.is_featured ? "border-yellow-500 text-yellow-400" : ""
            }
          >
            <Star className="w-4 h-4 mr-2" />
            {product.is_featured ? "Unfeature" : "Feature"}
          </Button>
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteProduct}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative h-96 overflow-hidden rounded-lg">
                    <Image
                      src={product.images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            selectedImageIndex === index
                              ? "border-primary-500"
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
                <div className="h-96 bg-secondary-700 rounded-lg flex items-center justify-center">
                  <Package className="w-24 h-24 text-secondary-500" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Price & Stock */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary-400 mb-1">Price</p>
                  {product.sale_price ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-400">
                        {formatCurrency(product.sale_price)}
                      </span>
                      <span className="text-lg text-secondary-500 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-secondary-400 mb-1">
                    Stock Quantity
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      product.stock_quantity < 10
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {product.stock_quantity} units
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {product.short_description && (
                <p className="text-secondary-300 mb-4 font-medium">
                  {product.short_description}
                </p>
              )}
              <p className="text-secondary-400 whitespace-pre-wrap">
                {product.description}
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-secondary-300"
                    >
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Specifications */}
      {product.specifications &&
        Object.keys(product.specifications).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-secondary-700 last:border-b-0"
                      >
                        <span className="text-secondary-400 capitalize">
                          {key.replace("_", " ")}
                        </span>
                        <span className="text-white font-medium">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

      {/* Meta Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-secondary-400 mb-1">Created</p>
                <p className="text-white">{formatDate(product.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400 mb-1">Last Updated</p>
                <p className="text-white">{formatDate(product.updated_at)}</p>
              </div>
              {product.meta_title && (
                <div className="md:col-span-2">
                  <p className="text-sm text-secondary-400 mb-1">SEO Title</p>
                  <p className="text-white">{product.meta_title}</p>
                </div>
              )}
              {product.meta_description && (
                <div className="md:col-span-2">
                  <p className="text-sm text-secondary-400 mb-1">
                    SEO Description
                  </p>
                  <p className="text-white">{product.meta_description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
