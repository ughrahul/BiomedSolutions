import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabase,
  getServerUser,
  getServerUserProfile,
} from "@/lib/supabase-server";
import { withRateLimit, authRateLimit } from "@/lib/ratelimit";
import { securityHeaders } from "@/lib/security";

export async function withAuth(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request, authRateLimit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get the user from the session with proper validation
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please sign in to continue" },
        {
          status: 401,
          headers: securityHeaders,
        }
      );
    }

    // Check if user profile exists and is active
    const profile = await getServerUserProfile(user.id);

    if (!profile || !profile.is_active) {
      return NextResponse.json(
        { error: "Forbidden", message: "Account is not active" },
        {
          status: 403,
          headers: securityHeaders,
        }
      );
    }

    // Create supabase instance for additional operations if needed
    const supabase = await createServerSupabase();

    return { user, profile, supabase };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Auth middleware error:", error);
    }
    return NextResponse.json(
      { error: "Internal Server Error", message: "Authentication failed" },
      {
        status: 500,
        headers: securityHeaders,
      }
    );
  }
}

export function withErrorHandling(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const response = await handler(request, ...args);

      // Add security headers to all responses
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", error);
      }

      const response = NextResponse.json(
        {
          error: "Internal Server Error",
          message:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Something went wrong",
        },
        { status: 500 }
      );

      // Add security headers to error responses too
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }
  };
}

export function validateRequestMethod(
  request: NextRequest,
  allowedMethods: string[]
) {
  if (!allowedMethods.includes(request.method)) {
    return NextResponse.json(
      {
        error: "Method Not Allowed",
        message: `Method ${request.method} not allowed`,
      },
      {
        status: 405,
        headers: {
          ...securityHeaders,
          Allow: allowedMethods.join(", "),
        },
      }
    );
  }
  return null;
}

export async function validateRequestData(request: NextRequest, schema: any) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return {
        error: NextResponse.json(
          {
            error: "Validation Error",
            message: "Invalid request data",
            details: validation.error.issues,
          },
          {
            status: 400,
            headers: securityHeaders,
          }
        ),
        data: null,
      };
    }

    return { error: null, data: validation.data };
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: "Bad Request", message: "Invalid JSON data" },
        {
          status: 400,
          headers: securityHeaders,
        }
      ),
      data: null,
    };
  }
}
