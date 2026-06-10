"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, MOBILE_TAB_HREFS, isNavActive } from "@/lib/admin-nav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { SignOutButton } from "./sign-out-button";
import { MoreHorizontal, ArrowLeft } from "lucide-react";

// Phone-only admin navigation: a fixed bottom tab bar for the daily-driver
// sections + a "More" sheet for the rest, View store, account, and Sign out.
// Hidden at md+, where the desktop sidebar takes over.
export function AdminMobileNav({ account }: { account?: string | null }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const tabs = MOBILE_TAB_HREFS.map((href) => ADMIN_NAV.find((n) => n.href === href)!);
  const moreItems = ADMIN_NAV.filter((n) => !MOBILE_TAB_HREFS.includes(n.href as never));
  const moreActive = moreItems.some((n) => isNavActive(pathname, n));

  const linkCls =
    "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-ink-2 transition hover:bg-cream-2 hover:text-ink";

  return (
    <>
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-paper/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {tabs.map((item) => {
          const { href, label, icon: Icon } = item;
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition ${
                active ? "text-primary" : "text-ink-3 hover:text-ink"
              }`}
            >
              <Icon className="size-5" />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="More"
          className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition ${
            moreActive ? "text-primary" : "text-ink-3 hover:text-ink"
          }`}
        >
          <MoreHorizontal className="size-5" />
          <span className="leading-none">More</span>
        </button>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Everything else in the admin.</SheetDescription>
          </SheetHeader>

          <div className="space-y-1 px-2 pb-2">
            {moreItems.map((item) => {
              const { href, label, icon: Icon } = item;
              const active = isNavActive(pathname, item);
              return (
                <SheetClose
                  key={href}
                  render={
                    <Link
                      href={href}
                      className={`${linkCls} ${active ? "bg-accent-soft text-primary" : ""}`}
                    />
                  }
                >
                  <Icon className="size-[18px]" />
                  {label}
                </SheetClose>
              );
            })}

            <SheetClose render={<Link href="/" className={linkCls} />}>
              <ArrowLeft className="size-[18px]" />
              View store
            </SheetClose>
          </div>

          {account && (
            <div className="border-t border-line px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
              <SignOutButton />
              <p className="truncate px-3 pt-1 text-[11px] text-ink-3" title={account}>
                {account}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
