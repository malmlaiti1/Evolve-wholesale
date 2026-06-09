import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { SearchBar } from "./search-bar";
import { CartButton } from "./cart-button";
import { PackageSearch } from "lucide-react";

export function CustomerHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-5">
        <Link href="/" aria-label="Evolve Wholesale home" className="shrink-0">
          <Logo />
        </Link>
        <div className="ml-2 hidden flex-1 md:flex">
          <Suspense fallback={<div className="h-10 flex-1" />}>
            <SearchBar />
          </Suspense>
        </div>
        <nav className="ml-auto flex items-center gap-1.5">
          <Link
            href="/orders"
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-2 transition hover:bg-cream-2 hover:text-ink sm:inline-flex"
          >
            <PackageSearch className="size-4" />
            Track order
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
