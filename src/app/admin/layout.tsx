"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  MessageSquare,
  Shield,
  Crown,
  Building,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { getCurrentUser, signOut, getUserProfile } from "@/lib/auth";
import toast from "react-hot-toast";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    description: "Manage medical equipment",
  },
  {
    name: "🚀 Fix Featured Products",
    href: "/admin/seed-products",
    icon: Package,
    description: "Seed database with diverse products",
  },
  {
    name: "Inventory History",
    href: "/admin/inventory-history",
    icon: BarChart3,
    description: "Track inventory changes",
  },
  {
    name: "Contact Messages",
    href: "/admin/contact-messages",
    icon: MessageSquare,
    description: "Customer inquiries",
  },
  {
    name: "Website Settings",
    href: "/admin/website-settings",
    icon: Settings,
    description: "Contact info & social media",
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: User,
    description: "Account settings",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // Fetch user profile
      const userProfile = await getUserProfile(currentUser.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      // The signOut function will handle the redirect
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-white/95 backdrop-blur-lg shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        initial={false}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-medical-500 rounded-xl flex items-center justify-center">
                <Image
                  src="/assets/images/logo.png"
                  alt="Biomed Solutions"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Biomed Solutions</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-4 py-3 text-gray-700 rounded-xl hover:bg-primary-50 hover:text-primary-700 transition-all duration-200"
              >
                <item.icon className="w-6 h-6 mr-3 text-gray-400 group-hover:text-primary-600" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500 group-hover:text-primary-600">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-medical-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  {/* Removed role icon */}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {profile?.full_name || user?.email || "Admin User"}
                </p>
                {/* Removed role and access level display */}
                {profile?.employee_id && (
                  <p className="text-xs text-gray-500">
                    ID: {profile.employee_id}
                  </p>
                )}
                {profile?.department && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Building className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">
                      {profile.department}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <EnhancedButton
              variant="outline"
              size="sm"
              fullWidth
              icon={<LogOut className="w-4 h-4" />}
              onClick={handleSignOut}
            >
              Sign Out
            </EnhancedButton>
          </div>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <header className="fixed lg:left-80 right-0 top-0 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 z-30 h-16">
          <div className="flex items-center justify-between px-6 py-2 h-full">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="hidden lg:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="font-medium text-gray-900">
                  {profile?.full_name || user?.email}
                </span>
                {/* Removed role and access level display */}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100/50 transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-main pt-20 p-6 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
