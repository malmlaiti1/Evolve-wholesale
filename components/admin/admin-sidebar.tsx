"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { SignOutButton } from "./sign-out-button";
import { ADMIN_NAV, isNavActive } from "@/lib/admin-nav";
import { ArrowLeft } from "lucide-react";

export function AdminSidebar({ account }: { account?: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-paper md:flex">
      <div className="border-b border-line p-5">
        <Logo showTagline={false} />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {ADMIN_NAV.map((item) => {
          const { href, label, icon: Icon } = item;
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-accent-soft text-primary"
                  : "text-ink-2 hover:bg-cream-2 hover:text-ink"
              }`}
            >
              <Icon className="size-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-line p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-2 transition hover:bg-cream-2 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          View store
        </Link>
        {account && (
          <>
            <SignOutButton />
            <p className="truncate px-3 pt-1 text-[11px] text-ink-3" title={account}>
              {account}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
