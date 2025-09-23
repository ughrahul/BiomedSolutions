"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import BackToTop from "@/components/back-to-top";
import { Toaster } from "react-hot-toast";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname?.startsWith("/auth");

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white">
        <LoadingSpinner size="lg" text="Loading application..." />
      </div>
    );
  }

  if (isAdminRoute) {
    // Admin layout - no navbar, footer, floating elements
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(255, 255, 255, 0.95)",
              color: "#374151",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "8px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </div>
    );
  }

  if (isAuthRoute) {
    // Auth layout - with navbar and footer
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(255, 255, 255, 0.95)",
              color: "#374151",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "8px",
              backdropFilter: "blur(16px)",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#22c55e",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </div>
    );
  }

  // Public layout - with navbar, footer, floating elements
  return (
    <>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="relative">{children}</main>
        {/* Smooth Section Transition to Footer */}
        <div className="relative h-24 bg-gradient-to-b from-indigo-200 via-cyan-100 to-blue-50"></div>
        <Footer />
        <BackToTop />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            color: "#374151",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "8px",
            backdropFilter: "blur(16px)",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </>
  );
}
