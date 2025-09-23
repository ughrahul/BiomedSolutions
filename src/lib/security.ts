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
    if (process.env.NODE_ENV === "development") {
      console.error("Rate limiting error:", error);
    }
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



// Secure headers for API responses
export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};



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
