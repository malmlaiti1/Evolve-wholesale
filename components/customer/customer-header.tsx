import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { PackageSearch, Lock } from "lucide-react";

export function CustomerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-5 sm:px-5">
        <Link href="/" aria-label="Evolve Wholesale home" className="shrink-0">
          <Logo />
        </Link>
        <div className="ml-2 hidden flex-1 md:flex">
          <Suspense fallback={<div className="h-10 flex-1" />}>
            <SearchBar />
          </Suspense>
        </div>
        <nav className="ml-auto flex items-center gap-1 sm:gap-1.5">
          {/* Track order — icon-only on phones, labelled from sm up. */}
          <Link
            href="/orders"
            title="Track order"
            aria-label="Track order"
            className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-ink-2 transition hover:bg-cream-2 hover:text-ink sm:px-3"
          >
            <PackageSearch className="size-5 sm:size-4" />
            <span className="hidden sm:inline">Track order</span>
          </Link>
          {/* Sign in — icon-only on phones, labelled from sm up. */}
          <Link
            href="/admin"
            title="Sign in"
            aria-label="Sign in"
            className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-ink-2 transition hover:bg-cream-2 hover:text-ink sm:px-3"
          >
            <Lock className="size-5 sm:size-4" />
            <span className="hidden sm:inline">Sign in</span>
          </Link>
          <CartButton />
        </nav>
      </div>
      {/* Mobile search row — the inline search above is desktop-only (md:flex). */}
      <div className="border-t border-line px-4 py-2 md:hidden">
        <Suspense fallback={<div className="h-10" />}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}
