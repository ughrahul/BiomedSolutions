"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Package, Mail, Settings } from "lucide-react";
import type { Product } from "@/types/product";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import ContactMessages from "@/components/admin/ContactMessages";
import AdminPageWrapper from "@/components/admin/AdminPageWrapper";
import { useRealtime } from "@/contexts/RealtimeContext";
import { useMessages } from "@/contexts/MessageContext";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

interface DashboardStats {
  totalProducts: number;
  totalMessages: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { messages, unreadCount, readCount, markAllAsRead } = useMessages();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const { subscribeToTable, unsubscribeFromTable } = useRealtime();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard-stats", {
        cache: "no-store",
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setStats({
        totalProducts: data.totalProducts || 0,
        totalMessages: data.totalMessages || 0,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development")
        console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch("/api/products", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const sortedProducts = (data.products || []).sort(
          (a: Product, b: Product) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentProducts(sortedProducts.slice(0, 3));
      } else if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch recent products");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development")
        console.error("Error fetching recent products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentProducts();

    const productsChannel = subscribeToTable("products", (payload) => {
      if (payload.eventType === "INSERT") {
        setStats((prev) => ({
          ...prev,
          totalProducts: prev.totalProducts + 1,
        }));
        fetchRecentProducts();
      } else if (payload.eventType === "DELETE") {
        setStats((prev) => ({
          ...prev,
          totalProducts: Math.max(0, prev.totalProducts - 1),
        }));
        fetchRecentProducts();
      }
    });

    return () => {
      if (productsChannel) unsubscribeFromTable(productsChannel);
    };
  }, [subscribeToTable, unsubscribeFromTable]);

  const statsData = [
    {
      title: "Total Products",
      value: loading ? "..." : stats.totalProducts.toString(),
      icon: Package,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Contact Messages",
      value: loading ? "..." : messages.length.toString(),
      icon: Mail,
      color: "from-purple-500 to-purple-600",
      showMessageStats: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <AdminPageWrapper>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-12"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your medical
          equipment business.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statsData.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <EnhancedCard
              variant="medical"
              hover="lift"
              padding="lg"
              className="relative overflow-hidden h-full"
            >
              <div className="flex items-start justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.showMessageStats && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-gray-600">
                              {unreadCount} unread
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">
                              {readCount} read
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={markAllAsRead}
                          disabled={unreadCount === 0}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Mark All Read
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} flex-shrink-0`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </EnhancedCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <EnhancedCard variant="medical" padding="none">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Products
              </h2>
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/products")}
              >
                View All
              </EnhancedButton>
            </div>
            <div className="divide-y divide-gray-200">
              {productsLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">
                    Loading recent products...
                  </p>
                </div>
              ) : recentProducts.length === 0 ? (
                <div className="p-6 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products found</p>
                </div>
              ) : (
                recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={
                            product.images &&
                            Array.isArray(product.images) &&
                            product.images.length > 0
                              ? typeof product.images[0] === "string"
                                ? product.images[0]
                                : (product.images[0] as any)?.url ||
                                  (product.images[0] as any)?.src
                              : "/assets/images/placeholder-product.svg"
                          }
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full flex-shrink-0">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Recent Contact Messages */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <EnhancedCard variant="medical" padding="none">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Contact Messages
              </h2>
              <EnhancedButton
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/contact-messages")}
              >
                View All Messages
              </EnhancedButton>
            </div>
            <div className="max-h-96 overflow-y-auto p-6">
              <ContactMessages limit={3} />
            </div>
          </EnhancedCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <EnhancedCard variant="gradient" padding="lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <EnhancedButton
                variant="primary"
                icon={<Package className="w-5 h-5" />}
                onClick={() => router.push("/admin/products/new")}
              >
                Add New Product
              </EnhancedButton>
              <EnhancedButton
                variant="medical"
                icon={<Mail className="w-5 h-5" />}
                onClick={() => router.push("/admin/contact-messages")}
              >
                Contact Messages
              </EnhancedButton>
              <EnhancedButton
                variant="medical"
                icon={<Settings className="w-5 h-5" />}
                onClick={() => router.push("/admin/website-settings")}
              >
                Website Settings
              </EnhancedButton>
            </div>
          </div>
        </EnhancedCard>
      </motion.div>
    </AdminPageWrapper>
  );
}
