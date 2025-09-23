"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ProductGrid from "@/components/ProductGrid";
import { Search, Sparkles, Shield, Zap, Heart, Award, ChevronDown } from "lucide-react";
import { EnhancedInput } from "@/components/ui/enhanced-input";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const floatingIcons = [
    { icon: Sparkles, delay: 0, position: "top-20 left-20" },
    { icon: Shield, delay: 0.5, position: "top-40 right-32" },
    { icon: Zap, delay: 1, position: "bottom-40 left-32" },
    { icon: Heart, delay: 1.5, position: "bottom-20 right-20" },
    { icon: Award, delay: 2, position: "top-1/2 left-10" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Similar to About Page */}
      <section ref={ref} className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        {/* Dynamic Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
          style={{ y }}
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

          {/* Mouse-following gradient - disabled on mobile for performance */}
          {!isMobile && (
            <motion.div
              className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-purple-600/30 rounded-full blur-3xl pointer-events-none"
              animate={{
                x: mousePosition.x - 192,
                y: mousePosition.y - 192,
              }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            />
          )}
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-4 sm:-mt-8 md:-mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-300/30 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Advanced Medical Equipment Collection
              </span>
            </motion.div>

            <motion.h1
              className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 text-white leading-[1.1] sm:leading-tight tracking-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Medical{" "}
              <motion.span
                className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent block sm:inline"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Products
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Discover our comprehensive range of cutting-edge medical equipment designed to enhance patient care and clinical outcomes.
            </motion.p>

            {/* Enhanced Search and View Controls */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0 w-full"
            >
              <div className="relative w-full max-w-2xl mx-auto">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
                <EnhancedInput
                  type="text"
                  placeholder="Search medical equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-cyan-300/30 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-gray-300 text-sm sm:text-base min-h-[48px] touch-manipulation"
                />
              </div>
            </motion.div>

            {/* Explore Buttons - Similar to About page "Discover Our Story" */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0 w-full"
            >
              <motion.button
                onClick={() => {
                  setSearchQuery("ECG");
                  if (typeof document !== 'undefined') {
                    const nextSection = document.querySelector('#products-grid');
                    nextSection?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base min-h-[48px] w-full sm:w-auto touch-manipulation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore ECG Machines
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setSearchQuery("ultrasound");
                  if (typeof document !== 'undefined') {
                    const nextSection = document.querySelector('#products-grid');
                    nextSection?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base min-h-[48px] w-full sm:w-auto touch-manipulation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Ultrasound
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setSearchQuery("monitor");
                  if (typeof document !== 'undefined') {
                    const nextSection = document.querySelector('#products-grid');
                    nextSection?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base min-h-[48px] w-full sm:w-auto touch-manipulation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Monitors
              </motion.button>
              
              <motion.button
                onClick={() => {
                  setSearchQuery("");
                  if (typeof document !== 'undefined') {
                    const nextSection = document.querySelector('#products-grid');
                    nextSection?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-cyan-300/30 hover:bg-white/20 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base min-h-[48px] w-full sm:w-auto touch-manipulation"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Products
              </motion.button>
            </motion.div>

            {/* Explore Categories - Similar to About page "Discover Our Story" */}
            <motion.div
              className="flex flex-col items-center justify-center px-4 sm:px-0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center text-gray-400 cursor-pointer group"
                onClick={() => {
                  if (typeof document !== 'undefined') {
                    const nextSection = document.querySelector('#products-grid');
                    nextSection?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <motion.span
                  className="text-base sm:text-lg font-medium mb-3 sm:mb-4 group-hover:text-white transition-colors duration-300 text-center leading-tight"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Our Products
                </motion.span>
                <motion.div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-400 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all duration-300 backdrop-blur-sm touch-manipulation"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    boxShadow: [
                      "0 0 15px rgba(255,255,255,0.1)",
                      "0 0 25px rgba(255,255,255,0.2)",
                      "0 0 15px rgba(255,255,255,0.1)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ y: [0, 2, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <ClientOnlyParticles />
        </div>
      </section>
      
      {/* Smooth Section Transition */}
      <div className="relative h-6 bg-gradient-to-b from-indigo-900 via-slate-800 to-white"></div>
      
      {/* Products Grid with Compact Spacing */}
      <div id="products-grid">
        <ProductGrid
          searchQuery={searchQuery}
          selectedCategory=""
        />
      </div>
    </div>
  );
}

// Client-only particles component to avoid hydration mismatch
function ClientOnlyParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 1000,
        y: Math.random() * 800,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      }));
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0,
          }}
          animate={{
            y: [null, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}
