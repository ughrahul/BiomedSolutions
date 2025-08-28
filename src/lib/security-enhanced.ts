import crypto from "crypto";
import { ratelimit } from "./ratelimit";
import { NextRequest } from "next/server";

// Enhanced Input validation and sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: URLs
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/data:/gi, "") // Remove data URLs
    .replace(/vbscript:/gi, "") // Remove vbscript
    .trim()
    .slice(0, 1000); // Limit length
}

export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email) return { isValid: false, error: "Email is required" };
  if (email.length > 254) return { isValid: false, error: "Email too long" };
  if (!emailRegex.test(email))
    return { isValid: false, error: "Invalid email format" };

  return { isValid: true };
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
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

  // Check for common passwords
  const commonPasswords = ["password", "123456", "admin", "user", "guest"];
  if (
    commonPasswords.some((common) => password.toLowerCase().includes(common))
  ) {
    errors.push("Password contains common words");
  }

  // Determine strength
  let strength: "weak" | "medium" | "strong" = "weak";
  if (password.length >= 12 && errors.length === 0) {
    strength = "strong";
  } else if (password.length >= 8 && errors.length <= 2) {
    strength = "medium";
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// Enhanced request validation
export async function validateApiRequest(request: NextRequest): Promise<{
  isValid: boolean;
  errors: string[];
  clientInfo: any;
}> {
  const errors: string[] = [];
  const userAgent = request.headers.get("user-agent") || "";
  const origin = request.headers.get("origin") || "";
  const referer = request.headers.get("referer") || "";

  // Check for suspicious patterns
  if (
    userAgent.toLowerCase().includes("bot") &&
    !userAgent.includes("googlebot")
  ) {
    errors.push("Suspicious user agent detected");
  }

  // Validate content type for POST requests
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      errors.push("Invalid content type");
    }
  }

  // Rate limiting per IP
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateLimitResult = await checkRateLimit(ip, request.url);

  if (!rateLimitResult.success) {
    errors.push("Rate limit exceeded");
  }

  return {
    isValid: errors.length === 0,
    errors,
    clientInfo: {
      ip,
      userAgent,
      origin,
      referer,
      method: request.method,
      url: request.url,
    },
  };
}

// SQL injection prevention for dynamic queries
export function sanitizeForDatabase(input: any): any {
  if (typeof input === "string") {
    return input.replace(/['";\\]/g, "");
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeForDatabase);
  }
  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeForDatabase(key)] = sanitizeForDatabase(value);
    }
    return sanitized;
  }
  return input;
}

// Enhanced file upload validation
export function validateFileUpload(
  file: File,
  options: {
    allowedTypes?: string[];
    maxSize?: number;
    allowedExtensions?: string[];
  } = {}
): {
  isValid: boolean;
  error?: string;
} {
  const {
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"],
  } = options;

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

  // Check file extension
  const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: `File extension ${fileExtension} is not allowed`,
    };
  }

  // Check for malicious file names
  if (/[<>:"/\\|?*\x00-\x1f]/.test(file.name)) {
    return {
      isValid: false,
      error: "File name contains invalid characters",
    };
  }

  // Check for executable extensions
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".js"];
  if (
    dangerousExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  ) {
    return {
      isValid: false,
      error: "Executable files are not allowed",
    };
  }

  return { isValid: true };
}

// CSRF Protection with session validation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCSRFToken(
  token: string,
  sessionToken: string
): boolean {
  if (
    !token ||
    !sessionToken ||
    token.length !== 64 ||
    sessionToken.length !== 64
  ) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, "hex"),
      Buffer.from(sessionToken, "hex")
    );
  } catch {
    return false;
  }
}

// Enhanced rate limiting
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
    const result = await ratelimit.limit(`${identifier}:${endpoint}`);
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

// Data encryption for sensitive information
export function encryptSensitiveData(data: string, key?: string): string {
  const algorithm = "aes-256-gcm";
  const secretKey =
    key || process.env.ENCRYPTION_KEY || "fallback-key-change-in-production";
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptSensitiveData(
  encryptedData: string,
  key?: string
): string {
  const algorithm = "aes-256-gcm";
  const secretKey =
    key || process.env.ENCRYPTION_KEY || "fallback-key-change-in-production";

  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipher(algorithm, secretKey);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Enhanced security headers
export const enhancedSecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; "),
};

// Audit logging for security events
export interface SecurityAuditLog {
  event:
    | "login"
    | "logout"
    | "failed_login"
    | "password_change"
    | "data_access"
    | "admin_action";
  userId?: string;
  ip: string;
  userAgent: string;
  details?: any;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
}

export function createSecurityAuditLog(
  log: Omit<SecurityAuditLog, "timestamp">
): SecurityAuditLog {
  return {
    ...log,
    timestamp: new Date(),
  };
}

// Input sanitization for different contexts
export const sanitizers = {
  html: (input: string) => input.replace(/[<>]/g, ""),
  sql: (input: string) => input.replace(/['";\\]/g, ""),
  filename: (input: string) => input.replace(/[^a-zA-Z0-9._-]/g, ""),
  alphanumeric: (input: string) => input.replace(/[^a-zA-Z0-9]/g, ""),
  phone: (input: string) => input.replace(/[^0-9+\-() ]/g, ""),
  url: (input: string) => {
    try {
      new URL(input);
      return input;
    } catch {
      return "";
    }
  },
};
