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
  Settings,
  Shield,
  Clock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { getCurrentUser, getUserProfile, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Fetch user data on mount and when auth state changes
  const fetchUserData = async () => {
    try {
      setLoading(true);
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
      // eslint-disable-next-line no-console
      console.error("Error fetching user data:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
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
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white text-sm py-3 border-b border-white/20 shadow-lg"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-8"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.div 
                className="flex items-center space-x-3 group cursor-pointer"
                whileHover={{ scale: 1.05, x: 3 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Phone className="w-4 h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white hover:text-cyan-200 transition-colors duration-300">+977-1-5555555</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 hidden sm:flex group cursor-pointer"
                whileHover={{ scale: 1.05, x: 3 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Mail className="w-4 h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white hover:text-cyan-200 transition-colors duration-300">info@biomed.com.np</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 hidden md:flex group cursor-pointer"
                whileHover={{ scale: 1.05, x: 3 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <MapPin className="w-4 h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white hover:text-cyan-200 transition-colors duration-300">Maitighar, Kathmandu</span>
              </motion.div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <motion.div 
                className="hidden md:flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-4 h-4 text-cyan-300" />
                </motion.div>
                <span className="font-semibold text-white">24/7 Premium Support</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 bg-emerald-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-400/50"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-emerald-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(74, 222, 128, 0.7)",
                      "0 0 0 6px rgba(74, 222, 128, 0)",
                      "0 0 0 0 rgba(74, 222, 128, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-bold text-emerald-100">LIVE NOW</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ scale: 1.02 }}
            >
              <Link href="/" className="flex items-center space-x-4">
                <motion.div 
                  className="relative w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200/60 flex items-center justify-center p-3 shadow-lg"
                  whileHover={{ 
                    scale: 1.08, 
                    rotate: 3,
                    boxShadow: "0 12px 40px rgba(59, 130, 246, 0.25)" 
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Image
                    src="/assets/images/logo.png"
                    alt="Biomed Solutions Logo"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain filter drop-shadow-md"
                    priority
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-indigo-500/0 rounded-2xl"
                    whileHover={{ 
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(79, 70, 229, 0.15))" 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    Biomed Solutions
                  </motion.h1>
                  <motion.p 
                    className="text-sm text-gray-600 hidden sm:block font-medium"
                    whileHover={{ color: "#4f46e5" }}
                    transition={{ duration: 0.3 }}
                  >
                    Premium Medical Equipment
                  </motion.p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <motion.div
                    key={item.name}
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * (index + 1), ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link
                      href={item.href}
                      className={`relative px-6 py-3 text-lg font-semibold transition-all duration-300 rounded-xl group ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-700 hover:text-blue-600"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200/80 shadow-md"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <motion.span 
                        className="relative z-10"
                        whileHover={{ 
                          y: -2,
                          textShadow: "0 4px 8px rgba(59, 130, 246, 0.3)"
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
                transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
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
                          boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)" 
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
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
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

                          <motion.button
                            onClick={() => {
                              /* Profile settings */
                            }}
                            className="flex items-center w-full px-5 py-4 text-base text-gray-700 transition-colors"
                            whileHover={{ backgroundColor: "#f8fafc", x: 4 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Settings className="w-5 h-5 mr-4 text-gray-400" />
                            Settings
                          </motion.button>

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
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {/* Subtle glow effect */}
                      <motion.div 
                        className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-sm opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                      
                      {/* Main button */}
                      <motion.div className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg border border-blue-500/30 transition-all duration-300">
                        <motion.div
                          className="flex items-center"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <motion.div
                            className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-2"
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <User className="w-3 h-3 text-white" />
                          </motion.div>
                          <span className="text-white font-medium">Login</span>
                          <motion.div
                            className="ml-2 opacity-60 group-hover:opacity-100"
                            animate={{ x: [0, 2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </motion.div>
                        
                        {/* Subtle shimmer on hover */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
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
              className="md:hidden p-3 rounded-2xl bg-gray-50/80 hover:bg-gray-100/90 transition-all duration-300 border-2 border-gray-200/60 shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
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
              className="md:hidden bg-white border-t border-gray-200 shadow-xl"
            >
              <div className="px-6 py-6 space-y-4">
                {navigation.map((item, index) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={item.href}
                          className={`block px-5 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-2 border-blue-200/80 shadow-md"
                              : "text-gray-700 hover:bg-gray-50/90 hover:text-blue-600"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <motion.span
                            whileHover={{ 
                              y: -1,
                              textShadow: "0 2px 4px rgba(59, 130, 246, 0.2)"
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
                  className="border-t border-gray-200/80 pt-5 mt-5"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  {user ? (
                    <div className="space-y-4">
                      <motion.div 
                        className="px-5 py-4 bg-gray-50/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200/60 shadow-sm"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-lg font-semibold text-gray-900">
                          {profile?.full_name || "User"}
                        </p>
                        <p className="text-base text-gray-500">{user?.email}</p>
                      </motion.div>

                      {profile?.role === "admin" && (
                        <motion.div
                          whileHover={{ scale: 1.02, x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            href="/admin"
                            className="flex items-center px-5 py-4 text-lg text-gray-700 hover:bg-gray-50/90 hover:text-blue-600 rounded-2xl transition-all duration-300"
                            onClick={() => setIsOpen(false)}
                          >
                            <Shield className="w-5 h-5 mr-4 text-blue-600" />
                            Admin Dashboard
                          </Link>
                        </motion.div>
                      )}

                      <motion.button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-5 py-4 text-lg text-red-600 hover:bg-red-50/90 rounded-2xl transition-all duration-300"
                        whileHover={{ scale: 1.02, x: 3 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LogOut className="w-5 h-5 mr-4" />
                        Sign Out
                      </motion.button>
                    </div>
                  ) : (
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <motion.div
                        className="relative group"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Subtle glow effect */}
                        <motion.div 
                          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-sm opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                        
                        <Button className="relative w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold shadow-lg border border-blue-500/30 transition-all duration-300">
                          <motion.div
                            className="flex items-center justify-center"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div
                              className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-3"
                              whileHover={{ rotate: 15, scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <User className="w-3 h-3 text-white" />
                            </motion.div>
                            <span className="font-medium">Login</span>
                            <motion.div
                              className="ml-2 opacity-60 group-hover:opacity-100"
                              animate={{ x: [0, 2, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </motion.div>
                          </motion.div>
                          
                          {/* Subtle shimmer on hover */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                          />
                        </Button>
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
