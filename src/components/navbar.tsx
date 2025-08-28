"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  Mail,
  User,
  LogOut,
  Shield,
  Clock,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { getCurrentUser, getUserProfile, signOut } from "@/lib/auth";
// Button import removed - no longer needed for login functionality
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";
import toast from "react-hot-toast";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { settings } = useWebsiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    role?: string;
  } | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const pathname = usePathname();

  // Track window width for responsive text
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data on mount and when auth state changes
  const fetchUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const userProfile = await getUserProfile(currentUser.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user data:", error);
      }
      setUser(null);
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Listen for authentication state changes
    const handleAuthChange = () => {
      fetchUserData();
    };

    // Listen for storage changes (for demo user)
    // eslint-disable-next-line no-undef
    window.addEventListener("storage", handleAuthChange);

    // Listen for custom auth change events
    // eslint-disable-next-line no-undef
    window.addEventListener("auth-state-changed", handleAuthChange);

    return () => {
      // eslint-disable-next-line no-undef
      window.removeEventListener("storage", handleAuthChange);
      // eslint-disable-next-line no-undef
      window.removeEventListener("auth-state-changed", handleAuthChange);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setProfile(null);
      setShowUserMenu(false);
      toast.success("Signed out successfully");
      // eslint-disable-next-line no-undef
      window.location.href = "/";
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  if (pathname.includes("/admin")) {
    return null;
  }

  return (
    <>
      {/* Top Info Bar */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white text-xs sm:text-sm py-2 sm:py-3 border-b border-white/20 shadow-lg"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Contact Info - Left Side */}
            <motion.div
              className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {/* Phone - Always visible */}
              <motion.a
                href={`tel:${settings.contact.phone}`}
                className="flex items-center space-x-1 sm:space-x-2 group cursor-pointer"
                whileHover={{ scale: 1.05, x: 2 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white hover:text-cyan-200 transition-colors duration-300 text-xs sm:text-sm">
                  {windowWidth < 640
                    ? settings.contact.phone.replace(/\s+/g, "")
                    : settings.contact.phone}
                </span>
                <span className="text-cyan-300 font-bold text-xs sm:text-sm ml-1">
                  |
                </span>
              </motion.a>

              {/* Email - Hidden on very small screens */}
              <motion.a
                href={`mailto:${settings.contact.email}`}
                className="hidden sm:flex items-center space-x-2 group cursor-pointer"
                whileHover={{ scale: 1.05, x: 2 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Mail className="w-4 h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white hover:text-cyan-200 transition-colors duration-300 text-sm">
                  {windowWidth < 768
                    ? settings.contact.email.split("@")[0] + "@..."
                    : settings.contact.email}
                </span>
                <span className="text-cyan-300 font-bold text-xs sm:text-sm ml-1">
                  |
                </span>
              </motion.a>

              {/* Address - Show on all screens */}
              <motion.a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  settings.contact.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 sm:space-x-2 group cursor-pointer"
                whileHover={{ scale: 1.05, x: 2 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white hover:text-cyan-200 transition-colors duration-300 text-xs sm:text-sm max-w-20 sm:max-w-xs truncate">
                  {windowWidth < 640 ? "Maitighar" : settings.contact.address}
                </span>
              </motion.a>
            </motion.div>

            {/* Status Info - Right Side */}
            <motion.div
              className="flex items-center space-x-2 sm:space-x-4"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              {/* 24/7 Support - Show on all screens */}
              <motion.div
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-white/30"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white text-xs sm:text-sm">
                  {windowWidth < 768 ? "24/7" : "24/7 Premium Support"}
                </span>
              </motion.div>

              {/* Live Status - Always visible but compact */}
              <motion.div
                className="flex items-center space-x-1 sm:space-x-2 bg-emerald-500/30 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full border border-emerald-400/50"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(74, 222, 128, 0.7)",
                      "0 0 0 4px rgba(74, 222, 128, 0)",
                      "0 0 0 0 rgba(74, 222, 128, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs sm:text-sm font-bold text-emerald-100">
                  {windowWidth < 640 ? "LIVE" : "LIVE NOW"}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Navbar */}
      <motion.nav
        className="bg-white shadow-xl shadow-gray-900/10 border-b border-gray-200 sticky top-0 z-40"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
      >
        <div className="container-responsive">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.4,
                ease: [0.23, 1, 0.32, 1],
              }}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                href="/"
                className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0"
              >
                <motion.div
                  className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 flex items-center justify-center flex-shrink-0"
                  whileHover={{
                    scale: 1.08,
                    rotate: 2,
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Image
                    src="/assets/images/logo.png"
                    alt="Biomed Solutions Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain filter drop-shadow-lg"
                    priority
                  />
                </motion.div>
                <div className="flex-shrink-0 min-w-0">
                  <motion.h1
                    className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    Biomed Solutions
                  </motion.h1>
                  <motion.p
                    className="text-xs sm:text-sm md:text-base text-gray-600 hidden sm:block font-medium"
                    whileHover={{ color: "#4f46e5" }}
                    transition={{ duration: 0.3 }}
                  >
                    For You, We Innovate
                  </motion.p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navigation.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <motion.div
                    key={item.name}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.1 * (index + 1),
                      ease: [0.23, 1, 0.32, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      className={`relative px-3 sm:px-4 lg:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold transition-all duration-300 rounded-xl group ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200/80 shadow-md"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <motion.span
                        className="relative z-10"
                        whileHover={{
                          y: -2,
                          textShadow: "0 4px 8px rgba(59, 130, 246, 0.3)",
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {item.name}
                      </motion.span>
                      {!isActive && (
                        <motion.div
                          className="absolute inset-0 bg-gray-50/80 rounded-xl opacity-0"
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Auth Section */}
              <motion.div
                className="ml-8"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.6,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {user ? (
                  <div className="relative">
                    <motion.button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-4 px-5 py-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/90 transition-all duration-300 border-2 border-gray-200/60 shadow-sm"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{
                          scale: 1.1,
                          boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <User className="w-4 h-4 text-white" />
                      </motion.div>
                      <motion.span
                        className="text-base font-semibold text-gray-700"
                        whileHover={{ color: "#4f46e5" }}
                        transition={{ duration: 0.3 }}
                      >
                        {profile?.full_name || "User"}
                      </motion.span>
                    </motion.button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.23, 1, 0.32, 1],
                          }}
                          className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-gray-900/15 border border-gray-200 py-3 z-50"
                        >
                          <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-base font-semibold text-gray-900">
                              {profile?.full_name || "User"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user?.email}
                            </p>
                          </div>

                          {profile?.role === "admin" && (
                            <motion.div
                              whileHover={{ backgroundColor: "#f8fafc", x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link
                                href="/admin"
                                className="flex items-center px-5 py-4 text-base text-gray-700 transition-colors"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <Shield className="w-5 h-5 mr-4 text-blue-600" />
                                Admin Dashboard
                              </Link>
                            </motion.div>
                          )}

                          <hr className="my-2" />

                          <motion.button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-5 py-4 text-base text-red-600 transition-colors"
                            whileHover={{ backgroundColor: "#fef2f2", x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <LogOut className="w-5 h-5 mr-4" />
                            Sign Out
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/auth/login">
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {/* Enhanced glow effect */}
                      <motion.div
                        className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 blur-md opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />

                      {/* Compact icon button */}
                      <motion.div
                        className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl flex items-center justify-center shadow-lg border border-blue-500/40 transition-all duration-300"
                        whileHover={{
                          boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
                          rotate: 5,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {/* Animated icon */}
                        <motion.div
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <User className="w-5 h-5 text-white" />
                        </motion.div>

                        {/* Subtle pulse animation */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl bg-white/10"
                          animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />

                        {/* Shimmer effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </motion.div>
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/90 transition-all duration-300 border-2 border-gray-200/60 shadow-sm touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: [0.23, 1, 0.32, 1],
              }}
            >
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {isOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -30 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -30 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="lg:hidden bg-white border-t border-gray-200 shadow-xl"
            >
              <div className="px-4 sm:px-6 py-4 space-y-3 mobile-spacing">
                {navigation.map((item, index) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.08,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={item.href}
                          className={`block px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-2 border-blue-200/80 shadow-md"
                              : "text-gray-700 hover:bg-gray-50/90 hover:text-blue-600"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <motion.span
                            whileHover={{
                              y: -1,
                              textShadow: "0 2px 4px rgba(59, 130, 246, 0.2)",
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.name}
                          </motion.span>
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}

                {/* Mobile Auth Section */}
                <motion.div
                  className="border-t border-gray-200/80 pt-4 mt-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  {user ? (
                    <div className="space-y-4">
                      <motion.div
                        className="px-4 py-3 bg-gray-50/90 backdrop-blur-sm rounded-xl border-2 border-gray-200/60 shadow-sm"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-base font-semibold text-gray-900">
                          {profile?.full_name || "User"}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </motion.div>

                      {profile?.role === "admin" && (
                        <motion.div
                          whileHover={{ scale: 1.02, x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50/90 hover:text-blue-600 rounded-xl transition-all duration-300"
                            onClick={() => setIsOpen(false)}
                          >
                            <Shield className="w-4 h-4 mr-3 text-blue-600" />
                            Admin Dashboard
                          </Link>
                        </motion.div>
                      )}

                      <motion.button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-3 text-base text-red-600 hover:bg-red-50/90 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.02, x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </motion.button>
                    </div>
                  ) : (
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <motion.div
                        className="relative group"
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        {/* Enhanced glow effect */}
                        <motion.div
                          className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 blur-md opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />

                        {/* Compact mobile icon button */}
                        <motion.div
                          className="relative w-14 h-14 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl flex items-center justify-center shadow-lg border border-blue-500/40 transition-all duration-300"
                          whileHover={{
                            boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
                            rotate: 5,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Animated icon */}
                          <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <User className="w-6 h-6 text-white" />
                          </motion.div>

                          {/* Subtle pulse animation */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl bg-white/10"
                            animate={{
                              scale: [1, 1.05, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />

                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                          />
                        </motion.div>
                      </motion.div>
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
