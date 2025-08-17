import crypto from "crypto";
import { ratelimit } from "./ratelimit";

// Input validation and sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateProductData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Product name is required");
  } else if (data.name.length > 255) {
    errors.push("Product name must be less than 255 characters");
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    data.description.trim().length === 0
  ) {
    errors.push("Product description is required");
  } else if (data.description.length > 5000) {
    errors.push("Product description must be less than 5000 characters");
  }

  if (!data.price || typeof data.price !== "number" || data.price <= 0) {
    errors.push("Product price must be a positive number");
  } else if (data.price > 1000000) {
    errors.push("Product price cannot exceed $1,000,000");
  }

  if (
    !data.sku ||
    typeof data.sku !== "string" ||
    data.sku.trim().length === 0
  ) {
    errors.push("Product SKU is required");
  } else if (!/^[A-Z0-9-_]+$/i.test(data.sku)) {
    errors.push(
      "Product SKU can only contain letters, numbers, hyphens, and underscores"
    );
  }

  if (typeof data.stock_quantity !== "number" || data.stock_quantity < 0) {
    errors.push("Stock quantity must be a non-negative number");
  }

  if (!data.category_id || typeof data.category_id !== "string") {
    errors.push("Product category is required");
  }

  // Optional fields validation
  if (data.sale_price !== null && data.sale_price !== undefined) {
    if (typeof data.sale_price !== "number" || data.sale_price <= 0) {
      errors.push("Sale price must be a positive number");
    } else if (data.sale_price >= data.price) {
      errors.push("Sale price must be less than regular price");
    }
  }

  if (data.short_description && data.short_description.length > 500) {
    errors.push("Short description must be less than 500 characters");
  }

  if (data.features && Array.isArray(data.features)) {
    if (data.features.length > 20) {
      errors.push("Maximum 20 features allowed");
    }
    for (const feature of data.features) {
      if (typeof feature !== "string" || feature.length > 255) {
        errors.push("Each feature must be a string less than 255 characters");
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// CSRF Protection
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCSRFToken(
  token: string,
  sessionToken: string
): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token, "hex"),
    Buffer.from(sessionToken, "hex")
  );
}

// Rate limiting helper
export async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<{
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
}> {
  try {
    const result = await ratelimit.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    return { success: true }; // Allow request if rate limiting fails
  }
}

// File upload validation
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSize: number
): {
  isValid: boolean;
  error?: string;
} {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${
        file.type
      } is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(
        2
      )}MB`,
    };
  }

  // Check for malicious file names
  if (/[<>:"/\\|?*\x00-\x1f]/.test(file.name)) {
    return {
      isValid: false,
      error: "File name contains invalid characters",
    };
  }

  return { isValid: true };
}

// SQL injection prevention helpers
export function escapeString(str: string): string {
  return str.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

// XSS prevention
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Secure headers for API responses
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Hash sensitive data
export function hashSensitiveData(data: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, "sha512");
  return `${actualSalt}:${hash.toString("hex")}`;
}

export function verifySensitiveData(data: string, hashedData: string): boolean {
  const [salt, hash] = hashedData.split(":");
  const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, "sha512");
  return hash === verifyHash.toString("hex");
}

// Generate secure random strings
export function generateSecureRandomString(length: number = 32): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

// Validate UUIDs
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Audit logging
export interface AuditLog {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export function createAuditLog(log: Omit<AuditLog, "timestamp">): AuditLog {
  return {
    ...log,
    timestamp: new Date(),
  };
}

// Content Security Policy
export const contentSecurityPolicy = {
  "default-src": "'self'",
  "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src": "'self' data: https: blob:",
  "font-src": "'self' https://fonts.gstatic.com",
  "connect-src": "'self' https://*.supabase.co wss://*.supabase.co",
  "media-src": "'self'",
  "object-src": "'none'",
  "base-uri": "'self'",
  "form-action": "'self'",
  "frame-ancestors": "'none'",
  "upgrade-insecure-requests": "",
};
