import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Clerk is optional during the build-out. When its keys aren't set, the
// middleware is a pass-through and the public storefront works normally;
// the admin tree shows a "configure Clerk" notice instead of protecting.
const clerkConfigured = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicAdminRoute = createRouteMatcher([
  "/admin/sign-in(.*)",
  "/admin/sign-up(.*)",
]);

const handler = clerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isAdminRoute(req) && !isPublicAdminRoute(req)) {
        await auth.protect();
      }
    })
  : () => NextResponse.next();

export default handler;

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else + API
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
  ],
};
