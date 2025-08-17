import { getServerUser, getServerUserProfile } from "./supabase-server";
import { redirect } from "next/navigation";

// Server-side auth functions (for use in server components and middleware)
export async function getCurrentUserServer() {
  try {
    const user = await getServerUser();
    return user;
  } catch (error) {
    console.error("Server auth error:", error);
    return null;
  }
}

export async function getUserProfileServer(userId: string) {
  try {
    if (!userId) {
      console.error("No userId provided for server profile lookup");
      return null;
    }
    
    const profile = await getServerUserProfile(userId);
    return profile;
  } catch (error) {
    // Don't log empty error objects
    if (error && Object.keys(error).length > 0) {
      console.error("Server profile error:", error);
    }
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getUserProfileServer(user.id);

  if (!profile || !profile.is_active) {
    redirect("/auth/login");
  }

  return { user, profile };
}
