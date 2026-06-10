import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionTokenEdge } from "@/lib/admin-auth-edge";

// Admin auth has three modes, in precedence order:
//   1. Clerk (keys set)         → Clerk middleware protects /admin.
//   2. Password login (ADMIN_*) → verify the signed session cookie here.
//   3. Neither                  → pass-through (admin open in dev only; the
//      layout blocks it in production).
const clerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);
const passwordConfigured = Boolean(
  process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET,
);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicAdminRoute = createRouteMatcher([
  "/admin/sign-in(.*)",
  "/admin/sign-up(.*)",
]);

async function passwordMiddleware(req: NextRequest) {
  if (isAdminRoute(req) && !isPublicAdminRoute(req)) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const ok = await verifySessionTokenEdge(token, process.env.ADMIN_SESSION_SECRET);
    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/sign-in";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

const handler = clerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isAdminRoute(req) && !isPublicAdminRoute(req)) {
        await auth.protect();
      }
    })
  : passwordConfigured
    ? passwordMiddleware
    : () => NextResponse.next();

export default handler;

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else + API
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
  ],
};
