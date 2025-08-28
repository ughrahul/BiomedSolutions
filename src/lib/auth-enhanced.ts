import { createClientSupabase } from "@/lib/supabase";
import { createProfileWithAdmin } from "@/lib/auth-admin";
import { sanitizeInput, createSecurityAuditLog } from "@/lib/security-enhanced";
import { logger } from "@/lib/logger";

// Enhanced authentication with comprehensive security
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: any;
  app_metadata?: any;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: "admin" | "user";
  access_level: string;
  is_active: boolean;
  employee_id?: string;
  department?: string;
  position?: string;
  login_count: number;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: AuthUser;
  profile: UserProfile;
  sessionId: string;
  expiresAt: Date;
  lastActivity: Date;
}

// Session management
const sessions = new Map<string, AuthSession>();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Failed login tracking
const failedAttempts = new Map<
  string,
  { count: number; lastAttempt: Date; lockedUntil?: Date }
>();

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClientSupabase();

    if (!supabase) {
      logger.log("Supabase not configured - no authentication available");
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (error.message.includes("Auth session missing")) {
        logger.log("No active session - user not authenticated");
        return null;
      }
      logger.error("Auth error:", error);
      return null;
    }

    // Validate session is still active
    if (user && typeof window !== "undefined") {
      const sessionId = localStorage.getItem("auth_session_id");
      if (sessionId) {
        const session = sessions.get(sessionId);
        if (session && session.expiresAt > new Date()) {
          // Update last activity
          session.lastActivity = new Date();
          sessions.set(sessionId, session);
          return user;
        } else {
          // Session expired, clean up
          await signOut();
          return null;
        }
      }
    }

    return user;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Auth session missing")
    ) {
      logger.log("No active session - user not authenticated");
      return null;
    }
    logger.error("Auth error:", error);
    return null;
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const supabase = createClientSupabase();

    if (!supabase) {
      logger.log("Supabase not configured - skipping profile fetch");
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      logger.error("Error fetching profile:", error);
      return null;
    }

    // Validate required profile fields
    if (!profile || !profile.is_active) {
      logger.warn("Profile is inactive or missing");
      return null;
    }

    return profile;
  } catch (error) {
    logger.error("Profile error:", error);
    return null;
  }
}

export async function requireAuth(): Promise<{
  user: AuthUser;
  profile: UserProfile;
} | null> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return null;
    }

    const profile = await getUserProfile(user.id);

    if (!profile || !profile.is_active) {
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      return null;
    }

    return { user, profile };
  } catch (error) {
    logger.error("Auth error:", error);
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return null;
  }
}

export async function requireAdminAuth(): Promise<{
  user: AuthUser;
  profile: UserProfile;
} | null> {
  const auth = await requireAuth();

  if (!auth) {
    return null;
  }

  // Check if user has admin role
  if (auth.profile.role !== "admin") {
    logger.warn("Access denied: User does not have admin privileges");
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login?error=insufficient_privileges";
    }
    return null;
  }

  return auth;
}

export async function signOut(): Promise<{ error?: any }> {
  const supabase = createClientSupabase();

  if (!supabase) {
    logger.log("Supabase not configured - cannot sign out");
    return { error: "Authentication not configured" };
  }

  try {
    // Get current session info for audit log
    const user = await getCurrentUser();
    const sessionId =
      typeof window !== "undefined"
        ? localStorage.getItem("auth_session_id")
        : null;

    // Update last login time before signing out
    if (user) {
      await supabase
        .from("profiles")
        .update({
          last_login: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      // Create audit log
      const auditLog = createSecurityAuditLog({
        event: "logout",
        userId: user.id,
        ip: "unknown",
        userAgent:
          typeof window !== "undefined" ? navigator.userAgent : "server",
        severity: "low",
      });
      logger.log("Logout audit log:", auditLog);
    }

    // Clean up session
    if (sessionId) {
      sessions.delete(sessionId);
    }

    const { error } = await supabase.auth.signOut();

    // Clear all local storage and session storage
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();

      // Dispatch custom event for auth state change
      window.dispatchEvent(new CustomEvent("auth-state-changed"));

      // Redirect to login
      window.location.href = "/auth/login";
    }

    return { error };
  } catch (error) {
    logger.error("Signout error:", error);
    return { error };
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
  clientInfo: { ip: string; userAgent: string } = {
    ip: "unknown",
    userAgent: "unknown",
  }
): Promise<{
  user: AuthUser | null;
  profile?: UserProfile;
  error?: string;
  success: boolean;
  sessionId?: string;
}> {
  const supabase = createClientSupabase();

  if (!supabase) {
    return {
      user: null,
      error: "Authentication not configured",
      success: false,
    };
  }

  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    // Check for account lockout
    const attemptKey = `${clientInfo.ip}:${sanitizedEmail}`;
    const attempts = failedAttempts.get(attemptKey);

    if (attempts && attempts.lockedUntil && attempts.lockedUntil > new Date()) {
      const lockoutRemaining = Math.ceil(
        (attempts.lockedUntil.getTime() - Date.now()) / 60000
      );

      // Create audit log for locked account attempt
      const auditLog = createSecurityAuditLog({
        event: "failed_login",
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        details: {
          email: sanitizedEmail,
          reason: "account_locked",
          remaining_minutes: lockoutRemaining,
        },
        severity: "high",
      });
      logger.log("Account locked audit log:", auditLog);

      return {
        user: null,
        error: `Account locked due to multiple failed attempts. Try again in ${lockoutRemaining} minutes.`,
        success: false,
      };
    }

    logger.log(`🔐 Attempting to sign in user: ${sanitizedEmail}`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      logger.error(`❌ Auth error for ${sanitizedEmail}:`, error.message);

      // Track failed attempt
      const currentAttempts = attempts || { count: 0, lastAttempt: new Date() };
      currentAttempts.count += 1;
      currentAttempts.lastAttempt = new Date();

      // Lock account if too many failed attempts
      if (currentAttempts.count >= MAX_FAILED_ATTEMPTS) {
        currentAttempts.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
      }

      failedAttempts.set(attemptKey, currentAttempts);

      // Create audit log for failed login
      const auditLog = createSecurityAuditLog({
        event: "failed_login",
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        details: {
          email: sanitizedEmail,
          attempt_count: currentAttempts.count,
        },
        severity:
          currentAttempts.count >= MAX_FAILED_ATTEMPTS ? "critical" : "medium",
      });
      logger.log("Failed login audit log:", auditLog);

      return { user: null, error: error.message, success: false };
    }

    if (data.user) {
      // Clear failed attempts on successful login
      failedAttempts.delete(attemptKey);

      logger.log(
        `✅ User authenticated: ${data.user.email} (ID: ${data.user.id})`
      );

      // Check if user profile exists
      let profile = null;

      try {
        // Get single profile for user
        const { data: fetchedProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (fetchError) {
          logger.log(
            `🔧 No profile found for ${sanitizedEmail}, creating one...`
          );

          // Create profile with admin client to bypass RLS
          try {
            const adminProfile = await createProfileWithAdmin(
              data.user.id,
              data.user.email || sanitizedEmail,
              data.user.user_metadata
            );

            if (adminProfile) {
              profile = adminProfile;
              logger.log(`✅ Created profile for ${sanitizedEmail}`);
            } else {
              throw new Error("Failed to create profile");
            }
          } catch (adminError) {
            logger.error(
              `❌ Failed to create profile for ${sanitizedEmail}:`,
              adminError
            );
            await supabase.auth.signOut();
            return {
              user: null,
              error:
                "Failed to create user profile. Please contact administrator.",
              success: false,
            };
          }
        } else {
          profile = fetchedProfile;
          logger.log(`✅ Found profile for ${sanitizedEmail}`);
        }
      } catch (e) {
        logger.error(`❌ Profile error for ${sanitizedEmail}:`, e);
        await supabase.auth.signOut();
        return {
          user: null,
          error: "Profile error. Please contact administrator.",
          success: false,
        };
      }

      if (!profile) {
        logger.error(`❌ No profile found for ${sanitizedEmail}`);
        await supabase.auth.signOut();
        return {
          user: null,
          error: "User profile not found. Please contact administrator.",
          success: false,
        };
      }

      if (!profile.is_active) {
        logger.error(`❌ Inactive profile for ${sanitizedEmail}`);
        await supabase.auth.signOut();
        return {
          user: null,
          error: "Account is not active. Please contact administrator.",
          success: false,
        };
      }

      logger.log(`✅ Profile validated for ${sanitizedEmail}:`, {
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
      });

      // Update login count and last login time
      try {
        await supabase
          .from("profiles")
          .update({
            last_login: new Date().toISOString(),
            login_count: (profile.login_count || 0) + 1,
          })
          .eq("user_id", data.user.id);
        logger.log(`✅ Updated login stats for ${sanitizedEmail}`);
      } catch (updateError) {
        logger.warn(
          `⚠️  Failed to update login stats for ${sanitizedEmail}:`,
          updateError
        );
      }

      // Create session
      const sessionId = crypto.randomUUID();
      const session: AuthSession = {
        user: data.user,
        profile,
        sessionId,
        expiresAt: new Date(Date.now() + SESSION_TIMEOUT),
        lastActivity: new Date(),
      };

      sessions.set(sessionId, session);

      // Store session ID in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_session_id", sessionId);
      }

      // Create audit log for successful login
      const auditLog = createSecurityAuditLog({
        event: "login",
        userId: data.user.id,
        ip: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        details: { email: sanitizedEmail, role: profile.role },
        severity: "low",
      });
      logger.log("Successful login audit log:", auditLog);

      // Dispatch custom event for auth state change
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-state-changed"));
      }

      return {
        user: data.user,
        profile: profile,
        error: undefined,
        success: true,
        sessionId,
      };
    }

    logger.error(`❌ No user data returned for ${sanitizedEmail}`);
    return { user: null, error: "Authentication failed", success: false };
  } catch (error) {
    logger.error(`❌ Sign in error for ${email}:`, error);

    // Create audit log for system error
    const auditLog = createSecurityAuditLog({
      event: "failed_login",
      ip: clientInfo.ip,
      userAgent: clientInfo.userAgent,
      details: { email, error: (error as Error).message },
      severity: "high",
    });
    logger.log("System error audit log:", auditLog);

    return { user: null, error: "Authentication failed", success: false };
  }
}

// Session cleanup
export function cleanupExpiredSessions(): void {
  const now = new Date();
  Array.from(sessions.entries()).forEach(([sessionId, session]) => {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  });
}

// Initialize cleanup interval
if (typeof window !== "undefined") {
  setInterval(cleanupExpiredSessions, 60000); // Clean up every minute
}

export async function validateSession(
  sessionId: string
): Promise<AuthSession | null> {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    return null;
  }

  // Update last activity
  session.lastActivity = new Date();
  sessions.set(sessionId, session);

  return session;
}

export function getActiveSessionsCount(): number {
  cleanupExpiredSessions();
  return sessions.size;
}

export function revokeAllSessions(): void {
  sessions.clear();
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_session_id");
  }
}
