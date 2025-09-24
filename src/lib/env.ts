/**
 * Environment configuration with safe defaults
 * This prevents crashes when environment variables are missing
 */

export const env = {
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
  
  // App configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Feature flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ENABLE_SPEED_INSIGHTS: process.env.NEXT_PUBLIC_ENABLE_SPEED_INSIGHTS === "true",
  
  // API configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  
  // Demo mode detection
  isDemoMode: () => {
    return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
           !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
           process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co" ||
           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "placeholder-key";
  },
  
  // Development mode detection
  isDevelopment: () => {
    return process.env.NODE_ENV === "development";
  },
  
  // Production mode detection
  isProduction: () => {
    return process.env.NODE_ENV === "production";
  }
};

export default env;
