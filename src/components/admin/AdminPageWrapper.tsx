"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminPageWrapper({ children, title }: AdminPageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Reset loading state on route change
    setIsLoading(true);
    
    // Simulate a brief loading state to ensure proper re-rendering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50); // Reduced from 100ms to 50ms

    return () => clearTimeout(timer);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 mt-12"
    >
      {title && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      )}
      {children}
    </motion.div>
  );
}
