"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Grid, List, ChevronDown, Sparkles, Shield, Zap, Heart, Package, Star, Users, Award } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { EnhancedInput } from "@/components/ui/enhanced-input";

interface ProductHeroProps {
  onSearchChange?: (search: string) => void;
  onViewModeChange?: (mode: "grid" | "list") => void;
  searchValue?: string;
  viewMode?: "grid" | "list";
  totalProducts?: number;
}

export default function ProductHero({
  onSearchChange,
  onViewModeChange,
  searchValue = "",
  viewMode = "grid",
  totalProducts = 0,
}: ProductHeroProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId == null) {
        rafId = requestAnimationFrame(() => {
          setMousePosition({ x: lastX, y: lastY });
          rafId = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, []);

  const floatingIcons = [
    { icon: Sparkles, delay: 0, position: "top-20 left-20" },
    { icon: Shield, delay: 0.5, position: "top-40 right-32" },
    { icon: Zap, delay: 1, position: "bottom-40 left-32" },
    { icon: Heart, delay: 1.5, position: "bottom-20 right-20" },
    { icon: Package, delay: 2, position: "top-1/2 left-10" },
    { icon: Star, delay: 2.5, position: "top-1/3 right-10" },
    { icon: Users, delay: 3, position: "bottom-1/3 left-20" },
    { icon: Award, delay: 3.5, position: "top-2/3 right-32" },
  ];

  const stats = [
    {
      icon: Package,
      value: "500+",
      label: "Medical Devices",
      color: "from-blue-500 to-cyan-500",
      description: "Cutting-edge equipment"
    },
    {
      icon: Shield,
      value: "99.9%",
      label: "Quality Assured",
      color: "from-green-500 to-emerald-500",
      description: "FDA approved products"
    },
    {
      icon: Star,
      value: "24/7",
      label: "Support Available",
      color: "from-purple-500 to-pink-500",
      description: "Expert technical assistance"
    },
    {
      icon: Users,
      value: "150+",
      label: "Hospitals Served",
      color: "from-orange-500 to-red-500",
      description: "Trusted healthcare partners"
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearchChange?.(value);
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
        style={{ y, opacity }}
      >
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
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -60, 0],
            y: [0, 25, 0],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">Premium Medical Equipment</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Our{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Products
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Discover our comprehensive collection of cutting-edge medical equipment designed to enhance patient care and revolutionize healthcare delivery across Nepal.
          </motion.p>

          {totalProducts > 0 && (
            <motion.div
              className="flex items-center justify-center gap-2 text-cyan-400 font-medium mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Package className="w-5 h-5" />
              <span>Showcasing {totalProducts} professional medical devices</span>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <motion.div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-cyan-300 font-medium mb-1">{stat.label}</div>
              <div className="text-xs text-gray-400">{stat.description}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="flex-1 w-full">
                <EnhancedInput
                  type="text"
                  placeholder="Search medical equipment, devices, or categories..."
                  value={localSearch}
                  onChange={handleSearchChange}
                  icon={<Search className="w-5 h-5" />}
                  variant="ghost"
                  inputSize="lg"
                  className="bg-white/20 border-white/30 text-white placeholder:text-gray-300 text-lg"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white/20 rounded-xl border border-white/30 overflow-hidden">
                <motion.button
                  onClick={() => onViewModeChange?.("grid")}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white/30 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => onViewModeChange?.("list")}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white/30 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-white transition-colors"
            onClick={() => {
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }}
          >
            <span className="text-sm mb-2 font-medium">Browse Equipment</span>
            <motion.div
              className="p-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
