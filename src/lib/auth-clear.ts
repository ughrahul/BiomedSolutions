import { createClientSupabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

/**
 * Clear all authentication state and resolve refresh token issues
 */
export async function clearAuthState() {
  const supabase = createClientSupabase();

  if (!supabase) {
    logger.error("Supabase client not available");
    return;
  }

  try {
    // Clear all local storage and session storage
    if (typeof window !== "undefined") {
      // Clear all Supabase-related storage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth') || key.includes('session'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear session storage
      sessionStorage.clear();

      // Clear any cached data
      if (window.location.pathname.includes('/admin')) {
        window.location.href = "/auth/login";
      }
    }

    // Sign out from Supabase (this will clear the refresh token)
    try {
      await supabase.auth.signOut();
      logger.log("Successfully signed out from Supabase");
    } catch (signOutError) {
      logger.warn("Sign out error (this is normal if no session exists):", signOutError);
    }

    // Dispatch custom event for auth state change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth-state-changed"));
    }

    logger.log("✅ Authentication state cleared successfully");
  } catch (error) {
    logger.error("Error clearing auth state:", error);
  }
}

/**
 * Handle refresh token errors by clearing auth state
 */
export async function handleRefreshTokenError() {
  logger.warn("🔄 Refresh token error detected, clearing auth state...");
  await clearAuthState();
}
