"use client";

import { motion } from "framer-motion";
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  Star,
  ArrowUpRight,
  Activity,
  Mail,
  User,
  Settings,
} from "lucide-react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import ContactMessages from "@/components/admin/ContactMessages";
import FeaturedProductsFixer from "@/components/FeaturedProductsFixer";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Products",
      value: "48",
      change: "+12%",
      changeType: "positive" as const,
      icon: Package,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Contact Messages",
      value: "156",
      change: "+8%",
      changeType: "positive" as const,
      icon: Mail,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const recentProducts = [
    {
      id: 1,
      name: "Advanced Patient Monitor",
      category: "Monitoring",
      price: "$45,999",
      status: "Active",
      views: 1247,
      favorites: 89,
      rating: 4.9,
    },
    {
      id: 2,
      name: "Surgical Robot System",
      category: "Surgery",
      price: "$2,850,000",
      status: "Active",
      views: 892,
      favorites: 156,
      rating: 4.8,
    },
    {
      id: 3,
      name: "Portable Ultrasound",
      category: "Imaging",
      price: "$89,999",
      status: "Active",
      views: 2103,
      favorites: 234,
      rating: 4.7,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: "New product added",
      item: "Ventilator System Pro",
      time: "2 hours ago",
      type: "product",
    },
    {
      id: 2,
      action: "Order received",
      item: "Advanced Patient Monitor",
      time: "4 hours ago",
      type: "order",
    },
    {
      id: 3,
      action: "User registered",
      item: "Dr. Sarah Johnson",
      time: "6 hours ago",
      type: "user",
    },
    {
      id: 4,
      action: "Product updated",
      item: "Surgical Robot System",
      time: "1 day ago",
      type: "product",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-xl text-gray-600">
          Welcome back! Here's what's happening with your medical equipment
          business.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <EnhancedCard
              variant="medical"
              hover="lift"
              padding="lg"
              className="relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm flex items-center mt-2 ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {stat.change} from last month
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </EnhancedCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Products */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <EnhancedCard variant="medical" padding="none">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Products
                </h2>
                <EnhancedButton variant="outline" size="sm">
                  View All
                </EnhancedButton>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="font-semibold text-lg text-primary-600">
                          {product.price}
                        </span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {product.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {product.favorites} favorites
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {product.rating}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <EnhancedCard variant="medical" padding="none">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === "product"
                        ? "bg-blue-100"
                        : activity.type === "order"
                        ? "bg-green-100"
                        : "bg-purple-100"
                    }`}
                  >
                    <Activity
                      className={`w-4 h-4 ${
                        activity.type === "product"
                          ? "text-blue-600"
                          : activity.type === "order"
                          ? "text-green-600"
                          : "text-purple-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                      <br />
                      <span className="text-gray-600">{activity.item}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </EnhancedCard>
        </motion.div>
      </div>

      {/* Featured Products Issue Fixer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <EnhancedCard variant="medical" padding="lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🚀 Featured Products Status
            </h2>
            <p className="text-gray-600">
              Monitor and fix your homepage featured products carousel
            </p>
          </div>
          <FeaturedProductsFixer />
        </EnhancedCard>
      </motion.div>

      {/* Recent Contact Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <EnhancedCard variant="medical" padding="none">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Contact Messages
              </h2>
              <EnhancedButton 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/admin/contact-messages'}
              >
                View All Messages
              </EnhancedButton>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-6">
            <ContactMessages />
          </div>
        </EnhancedCard>
      </motion.div>

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
              >
                Add New Product
              </EnhancedButton>
              <EnhancedButton
                variant="medical"
                icon={<Users className="w-5 h-5" />}
              >
                Manage Users
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                icon={<TrendingUp className="w-5 h-5" />}
              >
                View Analytics
              </EnhancedButton>
              <EnhancedButton
                variant="medical"
                icon={<Mail className="w-5 h-5" />}
                onClick={() => window.location.href = '/admin/contact-messages'}
              >
                Contact Messages
              </EnhancedButton>
              <EnhancedButton
                variant="outline"
                icon={<Settings className="w-5 h-5" />}
                onClick={() => window.location.href = '/admin/website-settings'}
              >
                Website Settings
              </EnhancedButton>
              <EnhancedButton
                variant="accent"
                icon={<Package className="w-5 h-5" />}
                onClick={async () => {
                  try {
                    const response = await fetch('/api/seed-products', { method: 'POST' });
                    const result = await response.json();
                    if (response.ok) {
                      alert(`Success: ${result.message}\nAdded: ${result.added} products\nExisting: ${result.existing} products`);
                      window.location.reload();
                    } else {
                      alert(`Error: ${result.error}`);
                    }
                  } catch (error) {
                    alert('Failed to seed products');
                  }
                }}
              >
                Seed Featured Products
              </EnhancedButton>
            </div>
          </div>
        </EnhancedCard>
      </motion.div>

      {/* Quick Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EnhancedCard variant="medical" padding="lg" hover="lift">
            <div className="text-center">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Product Management
              </h3>
              <p className="text-gray-600 mb-4">
                Full CRUD operations for your medical equipment inventory
              </p>
              <EnhancedButton
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/admin/products'}
              >
                Manage Products
              </EnhancedButton>
            </div>
          </EnhancedCard>
          
          <EnhancedCard variant="medical" padding="lg" hover="lift">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Inventory Tracking
              </h3>
              <p className="text-gray-600 mb-4">
                Complete history of all inventory changes and updates
              </p>
              <EnhancedButton
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/admin/inventory-history'}
              >
                View History
              </EnhancedButton>
            </div>
          </EnhancedCard>
          
          <EnhancedCard variant="medical" padding="lg" hover="lift">
            <div className="text-center">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Contact Management
              </h3>
              <p className="text-gray-600 mb-4">
                Manage customer inquiries and contact form submissions
              </p>
              <EnhancedButton
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/admin/contact-messages'}
              >
                View Messages
              </EnhancedButton>
            </div>
          </EnhancedCard>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <EnhancedCard variant="medical" padding="lg" hover="lift">
            <div className="text-center">
              <Settings className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Website Settings
              </h3>
              <p className="text-gray-600 mb-4">
                Manage contact info, social media links, and company details
              </p>
              <EnhancedButton
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/admin/website-settings'}
              >
                Manage Settings
              </EnhancedButton>
            </div>
          </EnhancedCard>
          
          <EnhancedCard variant="medical" padding="lg" hover="lift">
            <div className="text-center">
              <User className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Admin Profile
              </h3>
              <p className="text-gray-600 mb-4">
                Update your account settings and preferences
              </p>
              <EnhancedButton
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/admin/profile'}
              >
                Edit Profile
              </EnhancedButton>
            </div>
          </EnhancedCard>
        </div>
      </motion.div>
    </div>
  );
}
