import "server-only";
import { features } from "@/lib/env";

export type AdminContext = {
  configured: boolean;
  isAdmin: boolean;
  userId: string | null;
  devBypass: boolean;
};

/**
 * Resolves admin access. When Clerk is configured, requires a signed-in user
 * whose `publicMetadata.role === "admin"`. When Clerk is NOT configured, the
 * admin is open in development (devBypass) and blocked in production — so the
 * site builds and previews before Clerk is set up, without shipping an open admin.
 */
export async function getAdminContext(): Promise<AdminContext> {
  if (!features.clerk) {
    const dev = process.env.NODE_ENV !== "production";
    return { configured: false, isAdmin: dev, userId: null, devBypass: dev };
  }

  const { auth } = await import("@clerk/nextjs/server");
  const { userId, sessionClaims } = await auth();
  const claims = (sessionClaims ?? {}) as Record<string, unknown>;
  const meta = (claims.metadata ?? claims.publicMetadata ?? {}) as { role?: string };
  const isAdmin = Boolean(userId) && meta.role === "admin";
  return { configured: true, isAdmin, userId: userId ?? null, devBypass: false };
}
