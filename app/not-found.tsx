import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-5 text-center">
      <Logo />
      <div>
        <p className="mono text-sm tracking-[0.3em] text-ink-3">404</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Page not found</h1>
        <p className="mt-2 text-ink-2">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
        >
          Browse phones
        </Link>
        <Link
          href="/orders"
          className="rounded-md border border-line-2 bg-paper px-5 py-3 text-sm font-semibold transition hover:bg-cream"
        >
          Track an order
        </Link>
      </div>
    </div>
  );
}
