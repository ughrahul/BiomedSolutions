"use client";

import { useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Building2,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Users,
  Award,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { signInWithEmail } from "@/lib/auth";
import toast from "react-hot-toast";
import styles from "./login.module.css";
import { useEffect, useRef } from "react";
import ClientOnly from "@/components/ClientOnly";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const router = useRouter();
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const floatingIcons = [
    { icon: Sparkles, delay: 0, position: "top-20 left-20" },
    { icon: Shield, delay: 0.5, position: "top-40 right-32" },
    { icon: Zap, delay: 1, position: "bottom-40 left-32" },
    { icon: Heart, delay: 1.5, position: "bottom-20 right-20" },
    { icon: Users, delay: 2, position: "top-1/2 left-10" },
    { icon: Award, delay: 2.5, position: "top-1/3 right-10" },
  ];

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInWithEmail(email, password);

      if (result.success) {
        toast.success(
          `Welcome back, ${
            result.profile?.full_name || "Admin"
          }! Redirecting to dashboard...`,
          {
            style: {
              marginTop: "60px",
            },
            duration: 4000,
          }
        );
        router.push("/admin");
      } else {
        toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <LoadingSpinner size="lg" text="Loading login..." />
        </div>
      }
    >
      <div
        ref={ref}
        className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-start justify-center p-4 pt-8 lg:pt-16 relative overflow-hidden"
      >
        {/* Enhanced Background Effects */}
        <motion.div className="absolute inset-0" style={{ y, opacity }}>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

          {/* Mouse-following gradient */}
          <motion.div
            className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 rounded-full blur-3xl pointer-events-none"
            animate={{
              x: mousePosition.x - 192,
              y: mousePosition.y - 192,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          />
        </motion.div>

        {/* Floating Background Elements */}
        <div className="absolute inset-0">
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              className={`absolute ${item.position} w-16 h-16 opacity-20`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.2, scale: 1 }}
              transition={{ delay: item.delay, duration: 1 }}
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <item.icon className="w-16 h-16 text-white" />
              </motion.div>
            </motion.div>
          ))}

          <motion.div
            className="absolute top-10 left-4 lg:top-20 lg:left-20 w-32 h-32 lg:w-72 lg:h-72 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-10 right-4 lg:bottom-20 lg:right-20 w-32 h-32 lg:w-64 lg:h-64 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 30, 0],
              scale: [1.2, 0.8, 1.2],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Simple Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white space-y-8 hidden lg:block"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Building2 className="w-10 h-10 text-white" />
                </motion.div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent mb-2">
                Biomed Solution
              </h1>
              <p className="text-cyan-300 text-xl font-medium mb-8">
                Admin Portal
              </p>

              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Secure{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Access
                </span>
              </motion.h2>
            </motion.div>
          </motion.div>

          {/* Right Side - Enhanced Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:max-w-none"
          >
            <EnhancedCard
              variant="glass"
              padding="xl"
              className="backdrop-blur-xl border-white/20 shadow-2xl"
            >
              {/* Mobile Header */}
              <motion.div
                className="flex lg:hidden items-center justify-center gap-3 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </motion.div>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-white">
                    Biomed Solution
                  </h1>
                  <p className="text-cyan-300 text-sm">Admin Access</p>
                </div>
              </motion.div>

              {/* Form Header */}
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.h3
                  className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  Sign In
                </motion.h3>
                <motion.p
                  className="text-slate-600 text-base font-medium tracking-wide"
                  whileHover={{ color: "#374151" }}
                  transition={{ duration: 0.2 }}
                >
                  Access your admin dashboard
                </motion.p>
              </motion.div>

              {/* Enhanced Form */}
              <motion.form
                onSubmit={handleSubmit}
                className={`space-y-6 ${styles.loginForm}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  <EnhancedInput
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail className="w-5 h-5" />}
                    error={errors.email}
                    variant="ghost"
                    inputSize="lg"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  <EnhancedInput
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock className="w-5 h-5" />}
                    error={errors.password}
                    variant="ghost"
                    inputSize="lg"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    showPasswordToggle
                    required
                  />
                </motion.div>

                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowForgotPassword(true);
                    }}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  <EnhancedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={isLoading}
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </EnhancedButton>
                </motion.div>
              </motion.form>
            </EnhancedCard>
          </motion.div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowForgotPassword(false)}
            />
            <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-6 shadow-2xl border border-white/20">
              {/* Close Button */}
              <button
                onClick={() => setShowForgotPassword(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Forgot Password?
                </h3>
                <p className="text-gray-300">
                  Contact our administrator to reset your password
                </p>
              </div>

              {/* Contact Options */}
              <div className="space-y-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          Call Administrator
                        </p>
                        <p className="text-gray-300 text-sm">+977 9808418877</p>
                      </div>
                    </div>
                    <a
                      href="tel:+9779808418877"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                    >
                      Call Now
                    </a>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">WhatsApp</p>
                        <p className="text-gray-300 text-sm">Send a message</p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/9779808418877"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <p className="text-cyan-300 font-medium text-sm mb-1">
                      Password Reset Process
                    </p>
                    <p className="text-gray-300 text-sm">
                      Our administrator will verify your identity and reset your
                      password securely. Please have your account details ready
                      when contacting us.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
