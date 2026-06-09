import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { features } from "@/lib/env";
import { Logo } from "@/components/shared/logo";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-cream px-5">
      <Logo />
      {features.clerk ? (
        <SignUp routing="path" path="/admin/sign-up" signInUrl="/admin/sign-in" forceRedirectUrl="/admin" />
      ) : (
        <div className="max-w-sm rounded-lg border border-line bg-paper p-8 text-center">
          <h1 className="text-lg font-bold">Staff sign-up isn&rsquo;t set up yet</h1>
          <p className="mt-2 text-sm text-ink-2">
            Configure Clerk and restrict sign-up to your staff (allowlist). The admin is currently
            open in development.
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Go to admin
          </Link>
        </div>
      )}
    </div>
  );
}
