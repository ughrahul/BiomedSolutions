"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Shield,
  Truck,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle,
  Zap,
  Phone,
} from "lucide-react";
import Image from "next/image";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Product } from "@/types/product";

interface ProductDetailHeroProps {
  product: Product;
}

export default function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  // Safely get images array
  const images = product.images || [];
  const hasImages = images.length > 0;
  
  // Helper function to get image URL
  const getImageUrl = (index: number) => {
    if (!hasImages) return product.image_url || "/assets/images/placeholder-product.svg";
    const image = images[index];
    if (typeof image === 'string') return image;
    return image?.url || "/assets/images/placeholder-product.svg";
  };

  const nextImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };



  return (
    <section className="py-8 sm:py-12 bg-gradient-to-br from-cyan-50 via-blue-50 to-white">
      <div className="container-responsive">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-2xl border border-cyan-200">
              <Image
                src={getImageUrl(selectedImageIndex)}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Image Navigation */}
              {hasImages && images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3" />
                    Featured
                  </span>
                )}
                {product.is_active && (
                  <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Available
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-2 rounded-full backdrop-blur-sm shadow-lg transition-colors ${
                    isFavorited
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {hasImages && images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((image, index) => {
                  const imageUrl = typeof image === 'string' ? image : image?.url;
                  const imageId = typeof image === 'string' ? `img-${index}` : image?.id || `img-${index}`;
                  
                  return (
                    <button
                      key={imageId}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-primary-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={imageUrl || "/assets/images/placeholder-product.svg"}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                  {product.category}
                </span>
                {product.is_featured && (
                  <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3" />
                    Featured
                  </span>
                )}
                {product.sku && (
                  <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.review_count || 0} reviews)
                  </span>
                </div>
              )}

              <p className="text-lg text-gray-600 leading-relaxed">
                {product.full_description || product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Feature Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Contact for Information
                  </div>
                  <div className="text-sm text-gray-600">
                    Available for inquiry
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    Available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link href="/contact#contact-form" className="flex-1 w-full">
                  <EnhancedButton
                    variant="primary"
                    size="default"
                    className="w-full h-12 sm:h-auto text-sm sm:text-base font-semibold"
                    icon={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
                  >
                    Request Quote
                  </EnhancedButton>
                </Link>
                <a href="tel:+1234567890" className="flex-1 w-full">
                  <EnhancedButton
                    variant="outline"
                    size="default"
                    className="w-full h-12 sm:h-auto text-sm sm:text-base font-semibold"
                    icon={<Phone className="w-4 h-4 sm:w-5 sm:h-5" />}
                  >
                    Contact Now
                  </EnhancedButton>
                </a>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">
                  {product.warranty || "2 Year"} Warranty
                </div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">Free Delivery</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">24/7 Support</div>
              </div>
            </div>

            {/* Certifications */}
            {product.certifications && product.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}


