"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Award, Users, Heart, ChevronDown, Sparkles, Shield, Zap } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

export default function AboutHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
  }>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      setMousePosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
    };

    // Generate particles only on client side to avoid hydration issues
    const generateParticles = () => {
      if (typeof window !== 'undefined') {
        const newParticles = Array.from({ length: 15 }, (_, i) => ({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          duration: Math.random() * 3 + 2,
          delay: Math.random() * 5,
        }));
        setParticles(newParticles);
        setIsClient(true);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      generateParticles();
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
  ];

  return (
    <section ref={ref} className="relative h-[60vh] md:h-[70vh] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Enhanced Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/90 to-indigo-900/95"
        style={{ y }}
      />

      {/* Dynamic Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      {/* Enhanced Floating Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          className={`absolute ${item.position} text-white/20`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2], 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 4,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <item.icon className="w-12 h-12" />
        </motion.div>
      ))}

      {/* Interactive Mouse Cursor Effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-500/20 blur-3xl pointer-events-none"
        style={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Main Content */}
      <div className="relative z-10 container-responsive text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-6"
        >
          <motion.span
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-300/30 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm mb-6"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
            transition={{ duration: 0.3 }}
          >
            <Award className="w-4 h-4 mr-2" />
            About Biomed Solutions
          </motion.span>

          <motion.h1
            className="text-4xl md:text-7xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Pioneering
            </span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%", "0%"],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              Healthcare Excellence
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Established in 2015 as a wing of Annapurna Neurological Institute & Allied Sciences, 
            we pioneer advanced healthcare solutions through research, innovation, and international collaborations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/products">
                <EnhancedButton
                  variant="primary"
                  size="default"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
                  icon={<Heart className="w-5 h-5" />}
                >
                  Explore Our Solutions
                </EnhancedButton>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/contact">
                <EnhancedButton
                  variant="glass"
                  size="default"
                  className="px-6 py-3 border-2 border-white/30 backdrop-blur-sm hover:bg-white/10"
                  icon={<Users className="w-5 h-5" />}
                >
                  Get In Touch
                </EnhancedButton>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Scroll Indicator - Centered and More Aesthetic */}
        <motion.div
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-400 cursor-pointer group"
            onClick={() => {
              if (typeof document !== 'undefined') {
                const nextSection = document.querySelector('#company-story');
                nextSection?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <motion.span 
              className="text-lg font-medium mb-4 group-hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              Discover Our Story
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
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Client-side Particles to avoid hydration issues */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none">
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
                y: [particle.y, particle.y - 100],
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
        </div>
      )}
    </section>
  );
}
