"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// Browser globals type declarations
declare const window: Window & typeof globalThis;
declare const document: Document;
declare const console: Console;
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Package,
  Settings,
  LogOut,
  Bell,
  User,
  MessageSquare,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser, signOut, getUserProfile } from "@/lib/auth";
import toast from "react-hot-toast";
import RealTimeNotifications from "@/components/admin/RealTimeNotifications";
import { useAdminProfile } from "@/contexts/AdminProfileContext";
import { useMessages } from "@/contexts/MessageContext";

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
  const { profile: adminProfile } = useAdminProfile();
  const { messages, unreadCount, markAsRead, markAllAsRead } = useMessages();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const checkAuth = useCallback(async () => {
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
      } else {
        if (process.env.NODE_ENV === "development") {
          console.error("No profile found for user");
        }
        router.push("/auth/login");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Auth check failed:", error);
      }
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Check authentication properly
    checkAuth();
  }, [adminProfile, checkAuth]);

  // Set sidebar open by default on desktop
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Check initial screen size
    checkScreenSize();

    // Add resize listener
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkScreenSize);

      return () => window.removeEventListener("resize", checkScreenSize);
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      // The signOut function will handle the redirect
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector("[data-sidebar]") as HTMLElement;

      // Only close if sidebar is open and click is outside sidebar
      if (sidebarOpen && sidebar && !sidebar.contains(target)) {
        setSidebarOpen(false);
      }
    };

    // Only add listener on mobile screens
    if (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      window.innerWidth < 1024
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [sidebarOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;

      // Close user dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setUserDropdownOpen(false);
      }

      // Close notification dropdown
      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationDropdownOpen(false);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  // No need for separate notification fetching - using MessageContext

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
      {/* Mobile sidebar overlay - removed for better UX */}

      {/* Sidebar */}
      <motion.div
        data-sidebar
        className={`fixed inset-y-0 left-0 z-40 w-72 sm:w-80 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 mobile-no-scroll ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        initial={false}
      >
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Image
                  src="/assets/images/logo.png"
                  alt="Biomed Solutions"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain filter drop-shadow-md"
                  style={{ height: "auto" }}
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
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500 shadow-sm"
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 hover:shadow-sm"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={`w-6 h-6 mr-3 transition-colors duration-300 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-blue-600"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div
                      className={`text-sm transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-blue-600"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Back to Website Button */}
            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/"
                className="group flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 hover:shadow-sm"
                onClick={() => setSidebarOpen(false)}
              >
                <ExternalLink className="w-6 h-6 mr-3 transition-colors duration-300 text-gray-400 group-hover:text-green-600" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">Back to Website</div>
                  <div className="text-sm transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis text-gray-500 group-hover:text-green-600">
                    View public website
                  </div>
                </div>
              </Link>
            </div>
          </nav>
        </div>
      </motion.div>

      {/* Main content area */}
      <div className="lg:pl-80 pl-0 w-full min-h-screen">
        {/* Top bar - Static Position with Dynamic Content */}
        <header className="fixed left-0 lg:left-80 right-0 top-0 bg-white shadow-sm border-b border-gray-200 z-20 h-16">
          <div className="flex items-center justify-between px-4 sm:px-6 h-full">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="hidden lg:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="font-medium text-gray-900 truncate max-w-48">
                  {adminProfile.full_name ||
                    profile?.full_name ||
                    user?.email ||
                    "Admin User"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() =>
                    setNotificationDropdownOpen(!notificationDropdownOpen)
                  }
                  className={`relative p-2 rounded-lg transition-colors ${
                    unreadCount > 0
                      ? "hover:bg-red-50 text-red-600"
                      : "hover:bg-gray-100/50 text-gray-600"
                  }`}
                >
                  <Bell
                    className={`w-6 h-6 transition-colors ${
                      unreadCount > 0 ? "text-red-600" : "text-gray-600"
                    }`}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notificationDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            Recent Messages
                          </h3>
                          {unreadCount > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              No messages yet
                            </p>
                          </div>
                        ) : (
                          messages.slice(0, 5).map((message) => (
                            <div
                              key={message.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                                message.status === "unread" ? "bg-blue-50" : ""
                              }`}
                              onClick={async () => {
                                // Mark as read if unread
                                if (message.status === "unread") {
                                  await markAsRead(message.id);
                                }

                                setNotificationDropdownOpen(false);
                                router.push("/admin/contact-messages");
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {message.name}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        message.created_at
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate">
                                    {message.message}
                                  </p>
                                  {message.status === "unread" && (
                                    <div className="flex items-center mt-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                      <span className="text-xs text-blue-600">
                                        Unread
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {messages.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 space-y-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={async () => {
                                await markAllAsRead();
                                setNotificationDropdownOpen(false);
                              }}
                              className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setNotificationDropdownOpen(false);
                              router.push("/admin/contact-messages");
                            }}
                            className="w-full text-sm text-gray-600 hover:text-gray-700 font-medium"
                          >
                            View all messages
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {adminProfile.avatar_url ? (
                      <Image
                        src={adminProfile.avatar_url}
                        alt={adminProfile.full_name || "User"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-medical-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {adminProfile.avatar_url ? (
                            <Image
                              src={adminProfile.avatar_url}
                              alt={adminProfile.full_name || "User"}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-medical-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {adminProfile.full_name ||
                                profile?.full_name ||
                                user?.email ||
                                "Admin User"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Administrator
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/admin/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3 text-gray-500" />
                          Profile Settings
                        </Link>
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-main pt-20 p-4 sm:p-6 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>

      {/* Real-time notifications */}
      <RealTimeNotifications />
    </div>
  );
}
