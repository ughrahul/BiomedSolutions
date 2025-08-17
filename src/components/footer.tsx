"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  Code,
  Palette,
} from "lucide-react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2024);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    setIsClient(true);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-undef
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate consistent star data on client side only
  const [starData, setStarData] = useState<Array<{
    id: number;
    size: number;
    isLargeStar: boolean;
    baseX: number;
    baseY: number;
  }>>([]);

  useEffect(() => {
    const generateStarData = () => {
      const stars = Array.from({ length: 60 }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        return {
          id: i,
          size,
          isLargeStar: size > 2.5,
          baseX: Math.random() * 1400,
          baseY: Math.random() * 800,
        };
      });
      setStarData(stars);
    };

    generateStarData();
  }, []);

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Enhanced Animated Stars Background - Only render on client */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Regular Stars */}
          {starData.map((star) => (
            <motion.div
              key={star.id}
              className={`absolute bg-white rounded-full ${star.isLargeStar ? 'shadow-lg' : ''}`}
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                filter: star.isLargeStar 
                  ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 12px rgba(147, 197, 253, 0.6))' 
                  : 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))',
              }}
              initial={{
                x: star.baseX,
                y: star.baseY,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                opacity: star.isLargeStar ? [0, 1, 0.7, 1, 0.5, 1] : [0, 0.3, 0.6, 0.3],
                scale: star.isLargeStar ? [0, 1.5, 1, 1.3, 1, 1.2] : [0, 1, 0.8, 1],
                rotate: [0, 360, 720],
                x: [star.baseX, star.baseX + (Math.random() - 0.5) * 40, star.baseX],
                y: [star.baseY, star.baseY + (Math.random() - 0.5) * 30, star.baseY],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Shooting Stars */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`shooting-${i}`}
              className="absolute"
              initial={{
                x: -30,
                y: 100 + i * 120,
                opacity: 0,
              }}
              animate={{
                x: [null, 1200],
                y: [null, 180 + i * 120],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 6 + 3, // Use consistent delay instead of random
                ease: "easeOut",
              }}
            >
              {/* Shooting star trail */}
              <motion.div
                className="w-1 h-1 bg-white rounded-full"
                style={{
                  boxShadow: '-20px 0 15px 5px rgba(255, 255, 255, 0.6), -40px 0 20px 8px rgba(147, 197, 253, 0.4), -60px 0 25px 10px rgba(99, 102, 241, 0.2)',
                }}
              />
            </motion.div>
          ))}

          {/* Twinkling Effects */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={`twinkle-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full"
              style={{
                left: `${(i * 5) % 100}%`, // Use deterministic positioning
                top: `${(i * 7) % 100}%`,
                filter: 'blur(0.5px)',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 3 + (i % 3), // Use deterministic duration
                repeat: Infinity,
                delay: i * 0.2, // Use deterministic delay
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Comet-like Objects */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`comet-${i}`}
              className="absolute w-3 h-3 bg-gradient-to-r from-white via-blue-200 to-transparent rounded-full"
              style={{
                filter: 'blur(1px)',
              }}
              initial={{
                x: -50,
                y: 200 + i * 200,
                opacity: 0,
              }}
              animate={{
                x: [null, 1300],
                y: [null, 280 + i * 200],
                opacity: [0, 0.8, 0.8, 0],
                rotate: [0, 180],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 10 + 5,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-orange-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => {
          const colors = ['#00bcd4', '#3b82f6', '#8b5cf6', '#ec4899'];
          const size = 120 + i * 30;
          return (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full blur-xl opacity-15"
              style={{
                background: `linear-gradient(45deg, ${colors[i]}, transparent)`,
                width: `${size}px`,
                height: `${size}px`,
              }}
              animate={{
                x: [100 + i * 200, 200 + i * 200, 100 + i * 200],
                y: [50 + i * 100, 150 + i * 100, 50 + i * 100],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 25 + i * 5,
                repeat: Infinity,
                delay: i * 3,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
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
                  <h3 className="text-2xl font-bold text-white">
                    Biomed Solutions
                  </h3>
                  <p className="text-cyan-300 text-sm">
                    Advanced Medical Technology
                  </p>
                </div>
              </div>
            </Link>

            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              Cutting-edge medical equipment at{" "}
              <span className="text-cyan-400 font-medium">
                Annapurna Neuro Hospital
              </span>
              , Maitighar.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">
                  info@annapurnahospitals.com
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">980120335/61</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span className="text-gray-300">
                  Maitighar Mandala-10, Kathmandu
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { name: "About Us", href: "/about" },
                { name: "Products", href: "/products" },
                { name: "Contact", href: "/contact" },
                { name: "Support", href: "/support" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group text-gray-400 hover:text-cyan-400 transition-all duration-300 text-sm block py-1"
                  >
                    <motion.span
                      className="relative"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                      <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">
              Our Services
            </h4>
            <ul className="space-y-3">
              {[
                "Medical Equipment",
                "Healthcare Solutions",
                "24/7 Support"
              ].map((service, index) => (
                <motion.li 
                  key={service}
                  className="text-gray-400 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    />
                    <span>{service}</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear}{" "}
                <span className="text-cyan-400 font-medium">
                  Biomed Solutions
                </span>
                . All rights reserved.
              </p>
            </div>

            {/* Enhanced Developer Info */}
            <div className="flex items-center space-x-8 text-sm">
              <div className="text-center">
                <motion.div 
                  className="text-cyan-400 font-semibold"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(6, 182, 212, 0.3)",
                      "0 0 20px rgba(6, 182, 212, 0.6)",
                      "0 0 10px rgba(6, 182, 212, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Leading Healthcare Technology Provider
                </motion.div>
                <div className="text-xs text-gray-400 mt-1">
                  Advancing Medical Excellence Since 2009
                </div>
              </div>
              
              {/* Enhanced Developer Contact */}
              <motion.div 
                className="hidden md:flex items-center space-x-4 px-5 py-3 bg-gradient-to-r from-white/5 to-cyan-500/5 rounded-xl border border-cyan-400/20 backdrop-blur-sm shadow-lg"
                whileHover={{ 
                  scale: 1.02,
                  borderColor: "rgba(6, 182, 212, 0.4)",
                  boxShadow: "0 8px 25px rgba(6, 182, 212, 0.15)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Code className="w-5 h-5 text-purple-400" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Palette className="w-5 h-5 text-pink-400" />
                  </motion.div>
                </div>
                <div className="text-sm">
                  <div className="text-white font-semibold mb-1 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                    Crafted with Excellence
                  </div>
                  <div className="text-xs text-gray-300 mb-2">Full-Stack Developer & UI/UX Designer</div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <motion.a 
                      href="mailto:hingmang75@gmail.com" 
                      className="hover:text-cyan-400 transition-colors flex items-center space-x-1 group"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Mail className="w-3 h-3 group-hover:text-cyan-400" />
                      </motion.div>
                      <span className="font-medium">hingmang75@gmail.com</span>
                    </motion.a>
                    <span className="text-cyan-400/50">•</span>
                    <motion.a 
                      href="tel:+9779808418877" 
                      className="hover:text-green-400 transition-colors flex items-center space-x-1 group"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Phone className="w-3 h-3 group-hover:text-green-400" />
                      </motion.div>
                      <span className="font-medium">+977 9808418877</span>
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Back to Top */}
            <motion.button
              onClick={scrollToTop}
              className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Enhanced Mobile Developer Info */}
          <motion.div 
            className="md:hidden mt-6 pt-4 border-t border-cyan-400/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-3 text-gray-300">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Code className="w-5 h-5 text-purple-400" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Palette className="w-5 h-5 text-pink-400" />
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  Crafted with Excellence
                </span>
              </div>
              <div className="text-xs text-gray-400 mb-2">Full-Stack Developer & UI/UX Designer</div>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <motion.a 
                  href="mailto:hingmang75@gmail.com" 
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1 group"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mail className="w-3 h-3 group-hover:text-cyan-400" />
                  </motion.div>
                  <span className="font-medium">hingmang75@gmail.com</span>
                </motion.a>
                <motion.a 
                  href="tel:+9779808418877" 
                  className="hover:text-green-400 transition-colors flex items-center space-x-1 group"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Phone className="w-3 h-3 group-hover:text-green-400" />
                  </motion.div>
                  <span className="font-medium">+977 9808418877</span>
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
