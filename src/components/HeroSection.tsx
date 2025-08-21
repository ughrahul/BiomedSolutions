"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { EnhancedButton } from "@/components/ui/enhanced-button";

export default function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const floatingIcons = [
    { icon: Sparkles, delay: 0, position: "top-20 left-20" },
    { icon: Shield, delay: 0.5, position: "top-40 right-32" },
    { icon: Zap, delay: 1, position: "bottom-40 left-32" },
    { icon: Heart, delay: 1.5, position: "bottom-20 right-20" },
    { icon: Award, delay: 2, position: "top-1/2 left-10" },
    { icon: Star, delay: 2.5, position: "top-1/3 right-10" },
  ];

  const stats = [
    { label: "Years Established", value: "10+", icon: TrendingUp },
    { label: "Hospitals Served", value: "50+", icon: Users },
    { label: "Innovative Technologies", value: "4+", icon: Award },
    { label: "Research & Development", value: "Active", icon: Star },
  ];

  const scrollToNextSection = () => {
    if (typeof document !== 'undefined') {
      const nextSection = document.querySelector('#services-section');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section ref={ref} className="relative h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
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
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6"
          >
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-300/30 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              A Wing of Annapurna Neurological Institute & Allied Sciences
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Pioneering{" "}
            <motion.span 
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
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
              Healthcare
            </motion.span>
            <br className="hidden sm:block" />
            <span className="block sm:inline">Innovation in Nepal</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8 sm:mb-10 px-4 sm:px-0 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Established in 2015 as a healthcare provider specializing in advanced medical technology. 
            From Deep Brain Stimulation to 3D printed implants, we're revolutionizing 
            healthcare delivery across Nepal with cutting-edge solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-8 sm:mb-12 px-4 sm:px-0"
          >
            <Link href="/products">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <EnhancedButton
                  variant="primary"
                  size="default"
                  className="text-lg px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Explore Products
                </EnhancedButton>
              </motion.div>
            </Link>
            <Link href="/about">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <EnhancedButton
                  variant="glass"
                  size="default"
                  className="text-lg px-10 py-4 border-2 border-white/30 backdrop-blur-sm"
                  icon={<Play className="w-5 h-5" />}
                >
                  Our Story
                </EnhancedButton>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                transition: { duration: 0.2 }
              }}
              className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-cyan-300/50 transition-all duration-300"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <motion.div 
                className="text-3xl font-bold text-white mb-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll to Explore - Functional */}
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-400 cursor-pointer group"
            onClick={scrollToNextSection}
          >
            <motion.span 
              className="text-lg font-medium mb-4 group-hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Explore Our Services
            </motion.span>
            <motion.div
              className="w-12 h-12 rounded-full border-2 border-gray-400 flex items-center justify-center group-hover:border-white group-hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255,255,255,0.1)",
                  "0 0 40px rgba(255,255,255,0.2)",
                  "0 0 20px rgba(255,255,255,0.1)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <ClientOnlyParticles />
      </div>
    </section>
  );
}

// Client-only component to avoid hydration mismatch
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
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
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
