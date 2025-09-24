"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Send,
} from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useWebsiteSettings } from "@/hooks/useWebsiteSettings";

export default function ContactHero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const { settings, loading } = useWebsiteSettings();
  const prefersReducedMotion = useReducedMotion();
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const cores = typeof window !== "undefined" ? window.navigator.hardwareConcurrency || 4 : 4;
    const isMobile = typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsLowPerformance(prefersReducedMotion || isMobile || cores <= 4);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion) return;
    let ticking = false;
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (ticking || isLowPerformance) return;
      ticking = true;
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        ticking = false;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion, isLowPerformance]);

  const floatingIcons = useMemo(() => ([
    { icon: Sparkles, delay: 0, position: "top-20 left-20" },
    { icon: Shield, delay: 0.5, position: "top-40 right-32" },
    { icon: Zap, delay: 1, position: "bottom-40 left-32" },
    { icon: Heart, delay: 1.5, position: "bottom-20 right-20" },
    { icon: MessageCircle, delay: 2, position: "top-1/2 left-10" },
    { icon: Send, delay: 2.5, position: "top-1/3 right-10" },
  ]), []);

  // Always render immediately using default settings; avoid any loading gate for instant paint

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      info: settings.contact.phone,
      action: "Call Now",
      iconColor: "text-green-400",
      bgColor: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Mail,
      title: "Email Us",
      info: settings.contact.email,
      action: "Send Email",
      iconColor: "text-blue-400",
      bgColor: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      info: settings.contact.address,
      action: "Get Directions",
      iconColor: "text-purple-400",
      bgColor: "from-purple-500/20 to-indigo-500/20",
    },
    {
      icon: Clock,
      title: "Office Hours",
      info: settings.contact.businessHours,
      action: "Contact Now",
      iconColor: "text-orange-400",
      bgColor: "from-orange-500/20 to-red-500/20",
    },
  ];

  return (
    <section ref={ref} className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Mouse-following gradient (disabled on low perf/reduced motion) */}
        {!isLowPerformance && !prefersReducedMotion && (
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

      {/* Floating Background Elements (skipped on low perf) */}
      {!isLowPerformance && !prefersReducedMotion && (
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
      )}

      {/* Main Content */}
      <div className="relative z-10 container-responsive">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-300/30 rounded-full text-cyan-300 text-sm font-medium backdrop-blur-sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Get in Touch with Our Experts
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-7xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Contact{" "}
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
                Biomed Solution
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Ready to transform your healthcare facility with advanced medical equipment? 
              Our expert team is here to provide personalized solutions and support 24/7.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <EnhancedButton
                  variant="primary"
                  size="default"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25"
                  icon={<Phone className="w-5 h-5" />}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(`tel:${settings.contact.phone}`, "_self");
                    }
                  }}
                >
                  Contact Us
                </EnhancedButton>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <EnhancedButton
                  variant="glass"
                  size="default"
                  className="px-6 py-3 border-2 border-white/30 backdrop-blur-sm"
                  icon={<Mail className="w-5 h-5" />}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(`mailto:${settings.contact.email}`, "_self");
                    }
                  }}
                >
                  Email Us
                </EnhancedButton>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Content - Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="group relative bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-cyan-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-xl"
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className={`w-10 h-10 bg-gradient-to-br ${method.bgColor} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300 border border-white/20`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <method.icon className={`w-5 h-5 ${method.iconColor}`} />
                </motion.div>

                <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>

                <p className="text-cyan-300 font-semibold mb-3 text-sm">{method.info}</p>
                
                <EnhancedButton
                  size="sm"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 text-sm"
                  onClick={() => {
                    if (method.title === "Call Us") {
                      if (typeof window !== 'undefined') {
                        window.open(`tel:${settings.contact.phone}`, "_self");
                      }
                    } else if (method.title === "Email Us") {
                      if (typeof window !== 'undefined') {
                        window.open(`mailto:${settings.contact.email}`, "_self");
                      }
                    } else if (method.title === "Visit Us") {
                      if (typeof window !== 'undefined') {
                        const encodedAddress = encodeURIComponent(settings.contact.address);
                        window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank");
                      }
                    } else if (method.title === "Office Hours") {
                      // Scroll to contact form
                      if (typeof document !== 'undefined') {
                        document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                >
                  {method.action}
                </EnhancedButton>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <ClientOnlyParticles />
      </div>
    </section>
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
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
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
