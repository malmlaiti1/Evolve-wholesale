import "server-only";
import { features } from "@/lib/env";

export type AdminContext = {
  configured: boolean;
  isAdmin: boolean;
  userId: string | null;
  devBypass: boolean;
};

/**
 * Resolves admin access. Precedence:
 *   1. Clerk (when configured): signed-in user with `publicMetadata.role === "admin"`.
 *   2. Built-in password login (when configured): a valid signed session cookie.
 *   3. Neither: open in development (devBypass), blocked in production — so the
 *      site builds and previews before any auth is set up, without an open admin.
 */
export async function getAdminContext(): Promise<AdminContext> {
  if (!features.clerk) {
    if (features.password) {
      const { cookies } = await import("next/headers");
      const { verifySessionToken, ADMIN_COOKIE } = await import("@/lib/admin-auth");
      const token = (await cookies()).get(ADMIN_COOKIE)?.value;
      const email = verifySessionToken(token);
      return { configured: true, isAdmin: Boolean(email), userId: email, devBypass: false };
    }
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
