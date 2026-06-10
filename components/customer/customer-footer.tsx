import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { COMPANY } from "@/lib/constants";

export function CustomerFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-sm text-sm text-ink-2">{COMPANY.tagline}</p>
        </div>
        <div className="flex flex-col gap-5 sm:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/" className="text-ink-2 transition hover:text-primary">Catalog</Link>
            <Link href="/orders" className="text-ink-2 transition hover:text-primary">Track order</Link>
            <Link href="/terms" className="text-ink-2 transition hover:text-primary">Terms</Link>
            <Link href="/privacy" className="text-ink-2 transition hover:text-primary">Privacy</Link>
            <Link href="/admin" className="text-ink-2 transition hover:text-primary">Sign in</Link>
          </nav>
          <div className="text-sm text-ink-3 sm:text-right">
            <p className="mono">{COMPANY.legal}</p>
            <p className="mt-1">
              © {year} {COMPANY.brand}. Local delivery only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
