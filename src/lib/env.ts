import { serverLogger } from "@/lib/logger";

// Environment configuration with fallbacks

export const env = {
  // App configuration
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Supabase configuration (optional)
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // API configuration (optional)
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",

  // Email configuration (optional)
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",

  // Google Maps (optional)
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",

  // Analytics (optional)
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID || "",

  // Security
  JWT_SECRET: process.env.JWT_SECRET || "fallback-jwt-secret-for-development",
  ENCRYPTION_KEY:
    process.env.ENCRYPTION_KEY || "fallback-encryption-key-32chars!",

  // Feature flags
  ENABLE_SUPABASE: !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  ENABLE_ANALYTICS: !!process.env.GOOGLE_ANALYTICS_ID,
  ENABLE_MAPS: !!process.env.GOOGLE_MAPS_API_KEY,

  // Development flags
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",

  // Demo mode flag (when Supabase is not configured)
  IS_DEMO_MODE: !(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
} as const;

// Type-safe environment variable access
export function getEnvVar(key: keyof typeof env, fallback?: string): string {
  const value = env[key];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value.toString();
  }
  return fallback || "";
}

// Validate required environment variables for production
export function validateEnvironment() {
  if (env.IS_PRODUCTION) {
    const missingVars: string[] = [];

    // Check critical production variables
    if (!env.SUPABASE_URL || env.SUPABASE_URL.includes("placeholder")) {
      missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    }

    if (
      !env.SUPABASE_ANON_KEY ||
      env.SUPABASE_ANON_KEY.includes("placeholder")
    ) {
      missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    if (missingVars.length > 0) {
      serverLogger.warn(
        `⚠️  Missing environment variables in production: ${missingVars.join(
          ", "
        )}`
      );
      serverLogger.warn("The application will run in demo mode.");
    }
  }

  // Log configuration status
  serverLogger.log("🔧 Environment Configuration:");
  serverLogger.log(`   - Demo Mode: ${env.IS_DEMO_MODE ? "✅" : "❌"}`);
  serverLogger.log(`   - Supabase: ${env.ENABLE_SUPABASE ? "✅" : "❌"}`);
  serverLogger.log(`   - Analytics: ${env.ENABLE_ANALYTICS ? "✅" : "❌"}`);
  serverLogger.log(`   - Maps: ${env.ENABLE_MAPS ? "✅" : "❌"}`);
}
