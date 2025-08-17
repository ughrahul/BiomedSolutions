"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface InteractiveCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "lift" | "tilt" | "scale" | "glow";
  icon?: LucideIcon;
  iconColor?: string;
  backgroundPattern?: boolean;
}

export default function InteractiveCard({
  children,
  className = "",
  hoverEffect = "lift",
  icon: Icon,
  iconColor = "text-blue-500",
  backgroundPattern = true,
}: InteractiveCardProps) {
  const getHoverAnimation = () => {
    switch (hoverEffect) {
      case "lift":
        return { y: -10, scale: 1.02, rotateY: 5 };
      case "tilt":
        return { rotateX: 5, rotateY: 10, scale: 1.05 };
      case "scale":
        return { scale: 1.08 };
      case "glow":
        return {
          boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
          scale: 1.02,
        };
      default:
        return { y: -10, scale: 1.02 };
    }
  };

  return (
    <motion.div
      className={`relative group perspective-1000 ${className}`}
      whileHover={getHoverAnimation()}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="relative h-full bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-lg border border-cyan-200/40 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
        {/* Background Pattern */}
        {backgroundPattern && (
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)]"></div>
          </div>
        )}

        {/* Animated Gradient Overlay */}
        <motion.div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Icon Background */}
        {Icon && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-200 flex items-center justify-center ${iconColor}`}
              whileHover={{
                rotate: 360,
                scale: 1.1,
              }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="w-6 h-6" />
            </motion.div>
          </motion.div>
        )}

        {/* Corner Accent */}
        <motion.div
          className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-transparent rounded-br-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Content */}
        <div className="relative z-10 h-full">{children}</div>

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
}
