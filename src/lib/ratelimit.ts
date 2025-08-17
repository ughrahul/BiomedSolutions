// Simple in-memory rate limiting (for production, use Redis)
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = identifier;
    const existing = this.requests.get(key);

    if (!existing || now > existing.resetTime) {
      // First request or window expired
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });

      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }

    if (existing.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: existing.resetTime,
      };
    }

    // Increment count
    existing.count++;
    this.requests.set(key, existing);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - existing.count,
      reset: existing.resetTime,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.requests.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.requests.delete(key));
  }

  // Get current stats for an identifier
  getStats(identifier: string): {
    count: number;
    remaining: number;
    resetTime: number;
  } | null {
    const existing = this.requests.get(identifier);
    if (!existing) {
      return null;
    }

    return {
      count: existing.count,
      remaining: Math.max(0, this.maxRequests - existing.count),
      resetTime: existing.resetTime,
    };
  }

  // Reset rate limit for an identifier
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Different rate limiters for different endpoints
export const ratelimit = new RateLimiter(60000, 100); // 100 requests per minute
export const authRateLimit = new RateLimiter(60000, 10); // 10 auth attempts per minute
export const uploadRateLimit = new RateLimiter(300000, 20); // 20 uploads per 5 minutes
export const apiRateLimit = new RateLimiter(60000, 1000); // 1000 API calls per minute

// Helper to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

// Rate limit middleware
export async function withRateLimit(
  request: Request,
  rateLimiter: RateLimiter = ratelimit
): Promise<Response | null> {
  const ip = getClientIP(request);
  const result = await rateLimiter.limit(ip);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": Math.ceil(
            (result.reset - Date.now()) / 1000
          ).toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return null; // Continue with request
}
