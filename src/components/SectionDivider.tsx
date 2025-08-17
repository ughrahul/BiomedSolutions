"use client";

import { motion } from "framer-motion";

interface SectionDividerProps {
  fromColor?: string;
  toColor?: string;
  height?: string;
  pattern?: "wave" | "curve" | "straight";
}

export default function SectionDivider({
  fromColor = "from-blue-100",
  toColor = "to-cyan-50",
  height = "h-24",
  pattern = "wave",
}: SectionDividerProps) {
  const renderPattern = () => {
    switch (pattern) {
      case "wave":
        return (
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="currentColor"
              className="text-white/20"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              fill="currentColor"
              className="text-white/40"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
            />
          </svg>
        );
      case "curve":
        return (
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z"
              fill="currentColor"
              className="text-white/30"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative ${height} bg-gradient-to-b ${fromColor} via-white ${toColor} overflow-hidden`}
    >
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 rounded-full blur-xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-lg"
        animate={{
          x: [0, -30, 0],
          y: [0, 15, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Pattern Overlay */}
      {renderPattern()}

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
}
