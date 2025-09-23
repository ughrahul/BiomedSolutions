"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Shield, 
  Zap, 
  Heart,
  Star,
  Award,
  Users,
  TrendingUp,
  ChevronDown,
  Phone
} from "lucide-react";
import Link from "next/link";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useLazyComponent } from "@/hooks/useIntersectionObserver";

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  // Optimize mouse tracking with throttling
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const mouseTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (mouseTimeoutRef.current) {
      clearTimeout(mouseTimeoutRef.current);
    }
    
    mouseTimeoutRef.current = setTimeout(() => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }, 16); // ~60fps throttling
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, [handleMouseMove]);

  // Memoize static data to prevent re-renders
  const floatingIcons = useMemo(() => [
    { icon: Sparkles, delay: 0, position: "top-20 left-20" },
    { icon: Shield, delay: 0.5, position: "top-40 right-32" },
    { icon: Zap, delay: 1, position: "bottom-40 left-32" },
    { icon: Heart, delay: 1.5, position: "bottom-20 right-20" },
    { icon: Award, delay: 2, position: "top-1/2 left-10" },
    { icon: Star, delay: 2.5, position: "top-1/3 right-10" },
  ], []);

  const stats = useMemo(() => [
    { label: "Years Established", value: "10+", icon: TrendingUp },
    { label: "Hospitals Served", value: "50+", icon: Users },
    { label: "Innovative Technologies", value: "4+", icon: Award },
    { label: "Research & Development", value: "Active", icon: Star },
  ], []);

  const scrollToNextSection = useCallback(() => {
    if (typeof document !== 'undefined') {
      const nextSection = document.querySelector('#services-section');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  // Lazy load floating icons for better performance
  const { ref: floatingIconsRef, isVisible: showFloatingIcons } = useLazyComponent({
    threshold: 0.1,
    rootMargin: '100px',
  });

  return (
    <section ref={ref} className="relative h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Dynamic Background - Optimized with reduced motion */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
        style={{ y, opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Mouse-following gradient - Only on desktop for performance */}
        {typeof window !== 'undefined' && window.innerWidth > 768 && (
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

      {/* Floating Background Elements - Lazy loaded */}
      <div ref={floatingIconsRef} className="absolute inset-0">
        {showFloatingIcons && floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className={`absolute ${item.position} w-16 h-16 opacity-20`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{
              delay: item.delay,
              duration: 0.8,
              ease: "easeOut"
            }}
          >
            <item.icon className="w-full h-full text-white" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Biomed Solution
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Nepal&apos;s Premier Provider of Advanced Medical Equipment & Healthcare Technology Solutions
          </p>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Professional medical devices for hospitals and clinics since 2015. 
            Empowering healthcare with cutting-edge technology.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Link href="/products">
            <EnhancedButton
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Explore Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </EnhancedButton>
          </Link>
          
          <Link href="/contact">
            <EnhancedButton
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Get in Touch
              <Phone className="ml-2 w-5 h-5" />
            </EnhancedButton>
          </Link>
        </motion.div>

        {/* Stats Section - Lazy loaded */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.8 + index * 0.1,
                duration: 0.5,
                ease: "easeOut"
              }}
              className="text-center"
            >
              <div className="flex flex-col items-center">
                <stat.icon className="w-8 h-8 md:w-10 md:h-10 text-blue-400 mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={scrollToNextSection}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-white opacity-70 hover:opacity-100 transition-opacity" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
