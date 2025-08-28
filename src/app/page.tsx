"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { logger } from "@/lib/logger";

// Performance optimization: Detect mobile devices and reduce animations
const useDevicePerformance = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const mobileCheck =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    setIsMobile(mobileCheck);

    // Detect low performance (mobile + other indicators)
    const performanceCheck =
      mobileCheck || window.navigator.hardwareConcurrency <= 4;
    setIsLowPerformance(performanceCheck);

    // Add CSS class for performance optimizations
    if (performanceCheck) {
      document.documentElement.classList.add("low-performance");
    }
  }, []);

  return { isMobile, isLowPerformance };
};

// Performance context for mobile optimization
const PerformanceContext = React.createContext({ isLowPerformance: false });

// Performance-optimized Motion wrapper that uses context
const OptimizedMotion = ({ children, ...props }: any) => {
  const { isLowPerformance } = React.useContext(PerformanceContext);

  if (isLowPerformance) {
    // On mobile, use static div instead of motion.div for better performance
    return <div {...props}>{children}</div>;
  }

  return <motion.div {...props}>{children}</motion.div>;
};
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Shield,
  Star,
  Zap,
  Heart,
  TrendingUp,
  ChevronDown,
  Truck,
  Wrench,
  Lightbulb,
  Building2,
  Settings,
  Smile,
  Mail,
  MapPin,
  ExternalLink,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Badge } from "@/components/ui/badge";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";
import ClientOnly from "@/components/ClientOnly";
import VideoBackground from "@/components/VideoBackground";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import StatsSection from "@/components/StatsSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import SectionDivider from "@/components/SectionDivider";
import CompanyStory from "@/components/CompanyStory";
import ValuesSection from "@/components/ValuesSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import TeamSection from "@/components/TeamSection";

import DemoModeBanner from "@/components/DemoModeBanner";
import Image from "next/image";
import React from "react";

// Floating animation variants
const floatingAnimation = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Enhanced stagger animation for cards
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

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
    rotateX: 45,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
    },
  },
};

// Stats data based on reference (Biomed Solutions)
const stats = [
  {
    label: "Hospitals Served",
    value: "15",
    icon: Building2,
    color: "from-sky-400 to-sky-600",
    suffix: "+",
  },
  {
    label: "Equipment Installed",
    value: "200",
    icon: Settings,
    color: "from-teal-400 to-teal-600",
    suffix: "+",
  },
  {
    label: "Client Satisfaction",
    value: "99",
    icon: Smile,
    color: "from-emerald-400 to-emerald-600",
    suffix: "%",
  },
  {
    label: "Years Experience",
    value: "10",
    icon: TrendingUp,
    color: "from-cyan-400 to-cyan-600",
    suffix: "+",
  },
];

// Services based on reference
const services = [
  {
    title: "Sales & Distribution",
    description: "Premium medical equipment from leading global brands.",
    icon: Truck,
    color: "from-sky-400 to-sky-600",
  },
  {
    title: "Maintenance & Support",
    description:
      "24/7 technical support and comprehensive after-sales service.",
    icon: Wrench,
    color: "from-teal-400 to-teal-600",
  },
  {
    title: "Healthcare Solutions",
    description:
      "Custom technology solutions for modern healthcare facilities.",
    icon: Lightbulb,
    color: "from-emerald-400 to-emerald-600",
  },
];

// Featured products are now dynamically loaded from FeaturedProducts component

// Testimonials based on reference
const testimonials = [
  {
    name: "Dr. A. Sharma",
    role: "Chief Cardiologist, National Hospital",
    content:
      "The reliability and precision of Biomed Solutions' equipment have significantly improved our diagnostic capabilities.",
    avatar: "/assets/images/logo.png",
    rating: 5,
  },
  {
    name: "Mr. B. Adhikari",
    role: "Hospital Manager, Valley Healthcare",
    content:
      "Their after-sales support is unmatched - knowledgeable, responsive, and always available when we need them.",
    avatar: "/assets/images/logo.png",
    rating: 5,
  },
  {
    name: "Dr. S. K.C.",
    role: "Head of Surgery, City Medical Center",
    content:
      "Biomed Solutions is more than a supplier; they are a partner in our mission to provide the best healthcare.",
    avatar: "/assets/images/logo.png",
    rating: 5,
  },
];

export default function HomePage() {
  const { settings, mounted } = useWebsiteSettings();
  const { isMobile, isLowPerformance } = useDevicePerformance();

  // Performance context value
  const performanceValue = { isLowPerformance };

  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const mapRef = useRef(null);

  // Performance-optimized intersection observers
  const heroInView = useInView(heroRef, {
    once: true,
    margin: isLowPerformance ? "-30px" : "-100px",
    amount: isLowPerformance ? 0.1 : 0.3,
  });
  const servicesInView = useInView(servicesRef, {
    once: true,
    margin: isLowPerformance ? "-20px" : "-100px",
    amount: isLowPerformance ? 0.1 : 0.3,
  });
  const statsInView = useInView(statsRef, {
    once: true,
    margin: isLowPerformance ? "-20px" : "-100px",
    amount: isLowPerformance ? 0.1 : 0.3,
  });
  const testimonialsInView = useInView(testimonialsRef, {
    once: true,
    margin: isLowPerformance ? "-20px" : "-100px",
    amount: isLowPerformance ? 0.1 : 0.3,
  });
  const mapInView = useInView(mapRef, {
    once: true,
    margin: isLowPerformance ? "-20px" : "-100px",
    amount: isLowPerformance ? 0.1 : 0.3,
  });

  // Scroll-based animations - always call hooks in same order
  const { scrollY } = useScroll();
  const heroY = useTransform(
    scrollY,
    [0, isLowPerformance ? 300 : 600],
    [0, isLowPerformance ? 30 : 80]
  );

  // Scroll speed detection for responsive animations
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  useEffect(() => {
    // Initialize the time on client side
    setLastScrollTime(Date.now());

    // Suppress Google Maps API console errors
    // suppressMapsErrors(); // This function is no longer imported
  }, []);

  useEffect(() => {
    // Skip scroll speed detection on mobile/low performance devices for better performance
    if (isLowPerformance) {
      setScrollSpeed(0);
      return;
    }

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentTime = Date.now();
      const currentScrollY = window.scrollY;
      const timeDiff = currentTime - lastScrollTime;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY);

      if (timeDiff > 0) {
        const speed = scrollDiff / timeDiff;
        setScrollSpeed(speed);
        setLastScrollY(currentScrollY);
        setLastScrollTime(currentTime);
      }

      // Debounce scroll speed reset for better performance
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollSpeed(0);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, lastScrollTime, isLowPerformance]);

  // Dynamic animation duration - optimized for mobile performance
  const getAnimationDuration = () => {
    if (isLowPerformance) return 0.3; // Faster animations on mobile
    return scrollSpeed > 2 ? 0.4 : 0.8;
  };

  // Animated counter state for each stat
  const [counters, setCounters] = useState<number[]>(stats.map(() => 0));

  // Animate counters when in view - Ultra-mobile optimized
  useEffect(() => {
    if (!statsInView) return;

    const targets = stats.map((stat) => parseInt(stat.value));
    const startTime = performance.now();
    const duration = isLowPerformance ? 1500 : 2000; // Faster on mobile

    let animationId: number;
    let lastUpdate = 0;
    let lastCounters = [...counters];
    // Even lower frame rate on mobile for maximum performance
    const updateInterval = isLowPerformance ? 1000 / 15 : 1000 / 24;

    const animate = (currentTime: number) => {
      // Throttle updates for maximum performance
      if (currentTime - lastUpdate < updateInterval) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newCounters = targets.map((target) => {
        const currentValue = Math.floor(target * progress);
        return Math.min(currentValue, target);
      });

      // Only update state if values actually changed
      const hasChanged = newCounters.some(
        (value, index) => value !== lastCounters[index]
      );
      if (hasChanged) {
        setCounters(newCounters);
        lastCounters = [...newCounters];
      }

      lastUpdate = currentTime;

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [statsInView, stats, isLowPerformance]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side component for floating particles to avoid hydration mismatch
  const FloatingParticles = () => {
    const [particles, setParticles] = useState<
      Array<{
        id: number;
        left: number;
        top: number;
        duration: number;
        delay: number;
      }>
    >([]);

    useEffect(() => {
      const generateParticles = () => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          duration: Math.random() * 15 + 10,
          delay: Math.random() * 5,
        }));
        setParticles(newParticles);
      };

      generateParticles();
    }, []);

    return (
      <div className="absolute inset-0 overflow-hidden z-5">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    );
  };

  // Enhanced Video Background Component
  const EnhancedVideoBackground = () => {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleLoadedData = () => {
        setVideoLoaded(true);
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          video.style.opacity = "1";
        }, 100);
      };

      const handleError = () => {
        setVideoError(true);
        if (process.env.NODE_ENV === "development") {
          console.warn("Video failed to load, using poster image");
        }
      };

      const handleCanPlay = () => {
        // Video is ready to play
        setVideoLoaded(true);
      };

      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("error", handleError);
      video.addEventListener("canplay", handleCanPlay);

      return () => {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("error", handleError);
        video.removeEventListener("canplay", handleCanPlay);
      };
    }, []);

    return (
      <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
        {/* Poster Image - Always visible first */}
        <div
          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-1000"
          style={{
            backgroundImage: "url(/assets/images/wall3_poster.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter:
              "contrast(1.3) brightness(0.7) saturate(1.4) hue-rotate(5deg)",
            opacity: videoLoaded ? 0 : 1,
          }}
        />

        {/* Video - Fades in when loaded */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-1000"
          poster="/assets/images/wall3_poster.jpg"
          style={{
            filter:
              "contrast(1.3) brightness(0.7) saturate(1.4) hue-rotate(5deg)",
            opacity: videoLoaded ? 1 : 0,
          }}
        >
          <source src="/assets/images/wall3.mp4" type="video/mp4" />
          {/* Fallback text if video fails completely */}
          <p className="sr-only">Video not supported</p>
        </video>

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-blue-900/30 to-purple-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-transparent to-blue-500/20" />
      </motion.div>
    );
  };

  return (
    <PerformanceContext.Provider value={performanceValue}>
      <div className="min-h-screen overflow-hidden">
        {/* Hero Section with Enhanced Video Background */}
        <section
          ref={heroRef}
          className="relative h-[92vh] sm:h-[90vh] md:h-[95vh] flex items-center justify-center pt-16 sm:pt-20 pb-8 sm:pb-0 bg-gradient-to-br from-white via-cyan-50 to-blue-100"
        >
          {/* Enhanced Video Background */}
          <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
            <VideoBackground
              videoSrc="/assets/images/wall3.mp4"
              posterSrc="/assets/images/wall3_poster.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              showLoadingIndicator={true}
              onVideoLoad={() => {
                logger.log("Video loaded successfully");
              }}
              onVideoError={() => {
                logger.warn("Video failed to load, using poster");
              }}
            />
          </motion.div>

          {/* Floating Orbs Animation */}
          <ClientOnly>
            <FloatingParticles />
          </ClientOnly>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-4 sm:-mt-10 md:-mt-20">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Main Heading with Glassy Effect */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 flex justify-center"
              >
                <motion.div
                  className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl px-10 py-8 shadow-2xl"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-3xl blur-xl"
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 1, -1, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.h1
                    className="relative text-3xl xs:text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent leading-[1.1] sm:leading-tight tracking-tight"
                    animate={{
                      backgroundPosition: ["0%", "100%", "0%"],
                      textShadow: [
                        "0 0 20px rgba(255, 255, 255, 0.4)",
                        "0 0 40px rgba(6, 182, 212, 0.6)",
                        "0 0 20px rgba(255, 255, 255, 0.4)",
                      ],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                  >
                    Biomed Solutions
                  </motion.h1>
                </motion.div>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm xs:text-base sm:text-lg md:text-xl text-white font-medium mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed drop-shadow-lg px-2 sm:px-0"
              >
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent block sm:inline">
                  Revolutionizing Healthcare
                </span>
                <br className="sm:hidden" />
                <span className="text-white block sm:inline sm:ml-2">
                  with Advanced Medical Technology
                </span>
              </motion.p>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center px-4 sm:px-0 w-full max-w-md sm:max-w-none mx-auto"
              >
                <Link href="/products">
                  <motion.div
                    className="group relative"
                    whileHover={{ scale: 1.08, y: -6, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-3xl blur-lg opacity-70 group-hover:opacity-100 transition duration-500"></div>
                    <Button
                      size="lg"
                      className="relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl shadow-2xl border border-cyan-400/50 overflow-hidden w-full sm:w-auto min-h-[48px] touch-manipulation"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <motion.div
                        className="flex items-center relative z-10"
                        whileHover={{ x: 3 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Globe className="w-6 h-6 mr-3" />
                        </motion.div>
                        <span>Explore Products</span>
                        <motion.div
                          className="ml-3"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-6 h-6" />
                        </motion.div>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Button>
                  </motion.div>
                </Link>

                <Link href="/contact">
                  <motion.div
                    className="group relative"
                    whileHover={{ scale: 1.08, y: -6, rotate: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-white/30 to-cyan-200/30 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition duration-500"></div>
                    <Button
                      size="lg"
                      variant="outline"
                      className="relative bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold rounded-xl sm:rounded-2xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 overflow-hidden shadow-xl w-full sm:w-auto min-h-[48px] touch-manipulation"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-cyan-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <motion.div
                        className="flex items-center relative z-10"
                        whileHover={{ x: 3 }}
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Heart className="w-6 h-6 mr-3 text-red-300" />
                        </motion.div>
                        <span>Get Consultation</span>
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Additional Interactive Elements */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 1.2 }}
                className="mt-16 flex flex-col items-center"
              >
                <motion.div
                  className="flex flex-wrap justify-center items-center gap-8 text-white/80"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                    <span className="text-sm font-medium">
                      Certified Equipment
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Shield className="w-5 h-5 text-green-400" />
                    </motion.div>
                    <span className="text-sm font-medium">
                      Warranty Included
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </motion.div>
                    <span className="text-sm font-medium">24/7 Support</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center text-white/70"
            >
              <span className="text-sm font-medium mb-2">
                Scroll to explore
              </span>
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </section>

        {/* Seamless Section Transition - Hidden */}
        <div className="relative h-0"></div>

        {/* Revolutionary Healthcare Solutions */}
        <section
          ref={servicesRef}
          className="relative py-12 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100 overflow-hidden"
        >
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"
              animate={{
                x: [0, 200, 0],
                y: [0, -100, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl"
              animate={{
                x: [0, -150, 0],
                y: [0, 100, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 drop-shadow-lg"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                  textShadow: [
                    "0 0 20px rgba(6, 182, 212, 0.3)",
                    "0 0 40px rgba(6, 182, 212, 0.6)",
                    "0 0 20px rgba(6, 182, 212, 0.3)",
                  ],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                Healthcare Solutions
              </motion.h2>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={servicesInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            >
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={cardVariants}
                  whileHover={{
                    y: -20,
                    scale: 1.02,
                    rotateY: 5,
                    transition: { duration: 0.3 },
                  }}
                  className="group perspective-1000"
                >
                  <Card className="h-full p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-lg border border-cyan-300/30 rounded-xl sm:rounded-2xl md:rounded-3xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative group touch-manipulation">
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                    />

                    <div className="relative z-10 text-center">
                      <motion.div
                        className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br ${service.color} rounded-xl sm:rounded-2xl md:rounded-3xl mb-3 sm:mb-4 md:mb-6 shadow-xl mx-auto border border-cyan-400/30 touch-manipulation`}
                        whileHover={{
                          rotate: 360,
                          scale: 1.15,
                          y: -5,
                          transition: { duration: 0.6 },
                        }}
                        whileTap={{ scale: 0.95 }}
                        animate={{
                          boxShadow: [
                            "0 8px 20px rgba(6, 182, 212, 0.2)",
                            "0 12px 30px rgba(6, 182, 212, 0.4)",
                            "0 8px 20px rgba(6, 182, 212, 0.2)",
                          ],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <service.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                      </motion.div>

                      <motion.h3
                        className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4 group-hover:from-gray-700 group-hover:to-blue-500 transition-all leading-tight"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {service.title}
                      </motion.h3>

                      <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors line-clamp-3 sm:line-clamp-none">
                        {service.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Smooth Section Transition */}
        <div className="relative h-2 bg-gradient-to-b from-cyan-50 to-white"></div>

        {/* Enhanced Stats Section with Animated Counters */}
        <section
          ref={statsRef}
          className="relative py-12 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-6"
            >
              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 drop-shadow-lg"
                whileInView={{ scale: [0.9, 1] }}
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                  textShadow: [
                    "0 0 20px rgba(147, 51, 234, 0.3)",
                    "0 0 40px rgba(147, 51, 234, 0.6)",
                    "0 0 20px rgba(147, 51, 234, 0.3)",
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                Our Impact in Numbers
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-3xl mx-auto mb-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Leading the revolution in medical technology across Nepal
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
            >
              {stats.map((stat, index) => {
                const count = counters[index] || 0;

                return (
                  <motion.div
                    key={stat.label}
                    variants={cardVariants}
                    whileHover={{
                      scale: 1.1,
                      y: -10,
                      rotateY: 10,
                      transition: { duration: 0.3 },
                    }}
                    className="text-center group perspective-1000"
                  >
                    <Card className="p-4 sm:p-6 md:p-8 bg-white/70 backdrop-blur-lg border border-sky-200/50 rounded-xl sm:rounded-2xl md:rounded-3xl hover:bg-white/90 hover:shadow-xl transition-all duration-500 shadow-lg touch-manipulation">
                      <motion.div
                        className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl mb-3 sm:mb-4 md:mb-6 shadow-lg touch-manipulation`}
                        whileHover={{
                          rotate: 360,
                          scale: 1.2,
                          transition: { duration: 0.6 },
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {React.createElement(stat.icon, {
                          className:
                            "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white",
                        })}
                      </motion.div>

                      <motion.h3
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-1 sm:mb-2 md:mb-3 leading-tight"
                        animate={statsInView ? { scale: [0, 1.1, 1] } : {}}
                        transition={{
                          duration: 0.8,
                          delay: 0.2 + index * 0.1,
                        }}
                      >
                        {count}
                        {stat.suffix}
                      </motion.h3>

                      <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 font-medium leading-tight">
                        {stat.label}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Featured Products Section */}
        <ClientOnly>
          <FeaturedProducts />
        </ClientOnly>

        {/* Diagnostic Panel - Temporary for debugging */}

        {/* Seamless Section Transition - Hidden */}
        <div className="relative h-0"></div>

        {/* Voices of Trust & Excellence */}
        <section
          ref={testimonialsRef}
          className="relative py-16 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100 overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-cyan-300/20 to-blue-400/20 rounded-full blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-400/20 rounded-full blur-3xl"
              animate={{
                x: [0, -50, 0],
                y: [0, 30, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 drop-shadow-lg"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                  textShadow: [
                    "0 0 20px rgba(5, 150, 105, 0.3)",
                    "0 0 40px rgba(5, 150, 105, 0.6)",
                    "0 0 20px rgba(5, 150, 105, 0.3)",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity }}
              >
                Voices of Trust
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  & Excellence
                </span>
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Healthcare professionals worldwide share their success stories
                with our innovative solutions
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={testimonialsInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  variants={cardVariants}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    rotateY: 5,
                    transition: { duration: 0.3 },
                  }}
                  className="group perspective-1000"
                >
                  <Card className="h-full p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white/90 to-cyan-50/90 backdrop-blur-lg border border-cyan-200/50 rounded-xl sm:rounded-2xl md:rounded-3xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden group touch-manipulation">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <motion.div
                      className="absolute top-4 right-4 text-cyan-300"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Quote className="w-12 h-12" />
                    </motion.div>

                    <div className="relative z-10">
                      <motion.div
                        className="flex items-center mb-6"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="relative"
                        >
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={50}
                            height={50}
                            className="rounded-full mr-3 sm:mr-4 border-2 sm:border-3 border-cyan-400/30 shadow-lg"
                            style={{ width: "40px", height: "40px" }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0, 0.5, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>
                        <div>
                          <motion.h3
                            className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {testimonial.name}
                          </motion.h3>
                          <p className="text-xs sm:text-sm md:text-base text-cyan-600 font-semibold">
                            {testimonial.role}
                          </p>
                        </div>
                      </motion.div>

                      <motion.p
                        className="text-gray-700 italic leading-relaxed mb-3 sm:mb-4 md:mb-6 text-sm sm:text-base md:text-lg line-clamp-4 sm:line-clamp-none"
                        whileHover={{ color: "#374151" }}
                      >
                        &quot;{testimonial.content}&quot;
                      </motion.p>

                      <div className="flex text-yellow-500 space-x-0.5 sm:space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                              delay: i * 0.1,
                              type: "spring",
                              stiffness: 200,
                            }}
                            whileHover={{
                              scale: 1.3,
                              rotate: 360,
                              transition: { duration: 0.3 },
                            }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-current touch-manipulation" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Map Section - Maitighar, Kathmandu */}
        <section
          ref={mapRef}
          className="relative py-16 bg-gradient-to-br from-white via-blue-50 to-cyan-100 overflow-hidden"
        >
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-full blur-3xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/15 to-pink-600/15 rounded-full blur-3xl"
              animate={{
                x: [0, -80, 0],
                y: [0, 30, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative z-10 container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={mapInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-6 sm:mb-8 md:mb-12"
            >
              <motion.h2
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4 leading-tight"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                📍 Find Us at Annapurna Neuro Hospital, Maitighar
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={mapInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0"
              >
                Visit our advanced medical facility at Annapurna Neurological
                Institute & Allied Sciences
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={mapInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden mx-4 sm:mx-0"
            >
              <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5440193842667!2d85.31673821504788!3d27.703030282849743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb199a07a31fc5%3A0x984031b6bb9f6b5a!2sAnnapurna%20Neurological%20Institute%20%26%20Allied%20Sciences!5e0!3m2!1sen!2snp!4v1734518769875!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Annapurna Neuro Hospital Location in Maitighar, Kathmandu"
                  className="w-full rounded-xl"
                  sandbox="allow-scripts allow-same-origin"
                />
                {/* Fallback content in case iframe fails to load */}
                <div
                  className="absolute inset-0 bg-gray-100 flex items-center justify-center opacity-0 pointer-events-none"
                  id="maps-fallback"
                >
                  <div className="text-center p-4">
                    <p className="font-semibold text-gray-700 mb-2">
                      Map temporarily unavailable
                    </p>
                    <a
                      href="https://maps.google.com/?q=Annapurna+Neurological+Institute+Maitighar+Kathmandu+Nepal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={mapInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-4 sm:mt-6"
            >
              <Card className="p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-lg border border-blue-200 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl mx-4 sm:mx-0 touch-manipulation">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-600 mb-2 sm:mb-3 md:mb-4 leading-tight">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 inline mr-1 sm:mr-2" />
                    Annapurna Neurological Institute & Allied Sciences
                  </h3>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
                    <p className="text-gray-700">
                      <strong>Address:</strong>{" "}
                      {mounted
                        ? settings.contact.address
                        : "Annapurna Neurological Institute & Allied Sciences, Maitighar Mandala-10, Kathmandu 44600, Nepal"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Contact:</strong> 24/7 Support -{" "}
                      {mounted ? settings.contact.supportPhone : "980120335/61"}
                    </p>
                    <p className="text-gray-700">
                      <strong>Hospital:</strong>{" "}
                      {mounted ? settings.contact.hospitalPhone : "01-5356568"}
                    </p>
                    <p className="text-gray-700 mb-4 sm:mb-6">
                      <strong>Email:</strong>{" "}
                      {mounted
                        ? settings.contact.email
                        : "hingmang75@gmail.com"}
                    </p>
                  </div>
                  <motion.a
                    href="https://maps.google.com/?q=Annapurna+Neurological+Institute+Maitighar+Kathmandu+Nepal"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="touch-manipulation"
                  >
                    <Button className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm md:text-base min-h-[44px] w-full sm:w-auto">
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-2" />
                      Open in Google Maps
                    </Button>
                  </motion.a>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </PerformanceContext.Provider>
  );
}
