import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { AlertTriangle, ShieldAlert, UserX } from "lucide-react";
import { getAdminContext } from "@/lib/clerk/auth";
import { features } from "@/lib/env";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAdminContext();

  // Defense-in-depth: don't rely on middleware alone. When auth is configured
  // but the caller isn't an admin, redirect to sign-in here too — except on the
  // sign-in/up routes themselves (which must render to let them authenticate).
  const pathname = (await headers()).get("x-pathname") ?? "";
  const onAuthRoute =
    pathname.startsWith("/admin/sign-in") || pathname.startsWith("/admin/sign-up");
  if (ctx.configured && !ctx.isAdmin && !ctx.userId && !onAuthRoute) {
    redirect("/admin/sign-in");
  }

  // Production with no Clerk → block with a setup notice instead of an open admin.
  if (!ctx.configured && process.env.NODE_ENV === "production") {
    return <Centered>{<SetupCard />}</Centered>;
  }

  let inner: React.ReactNode;
  if (ctx.configured && ctx.userId && !ctx.isAdmin) {
    // Signed in, but the account doesn't have the admin role.
    inner = <Centered>{<NeedsRoleCard />}</Centered>;
  } else {
    // Admins, the dev-bypass, and the (unauthenticated) sign-in/up overlays render here.
    inner = (
      <div className="flex min-h-screen bg-cream">
        <AdminSidebar account={features.password && ctx.isAdmin ? ctx.userId : null} />
        <div className="flex min-w-0 flex-1 flex-col">
          {!ctx.configured && (
            <div className="flex items-center gap-2 bg-warning-soft px-6 py-2 text-xs font-medium text-warning">
              <AlertTriangle className="size-3.5 shrink-0" />
              Admin is unprotected in dev — add Clerk keys to{" "}
              <code className="mono rounded bg-warning/10 px-1">.env.local</code> to require staff
              login before production.
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  // Only Clerk needs its provider; password mode is "configured" without Clerk keys.
  return features.clerk ? <ClerkProvider>{inner}</ClerkProvider> : inner;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">{children}</div>
  );
}

function SetupCard() {
  return (
    <div className="max-w-md rounded-lg border border-line bg-paper p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
        <ShieldAlert className="size-7" />
      </div>
      <h1 className="mt-5 text-xl font-bold">Admin login not configured</h1>
      <p className="mt-2 text-sm text-ink-2">
        This environment has no admin auth set. Add the password-login vars{" "}
        <code className="mono">ADMIN_EMAIL</code>, <code className="mono">ADMIN_PASSWORD_HASH</code>{" "}
        and <code className="mono">ADMIN_SESSION_SECRET</code> (or Clerk keys) to your hosting
        environment, then redeploy.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Back to store
      </Link>
    </div>
  );
}

function NeedsRoleCard() {
  return (
    <div className="max-w-md rounded-lg border border-line bg-paper p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-cream-deep text-ink-2">
        <UserX className="size-7" />
      </div>
      <h1 className="mt-5 text-xl font-bold">Not authorized</h1>
      <p className="mt-2 text-sm text-ink-2">
        Your account isn&rsquo;t a staff admin. Ask an owner to set{" "}
        <code className="mono">publicMetadata.role = &quot;admin&quot;</code> on your Clerk user.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Back to store
      </Link>
    </div>
  );
}
