"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  ScanLine,
  Settings,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/imei-checker", label: "IMEI Checker", icon: ScanLine },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-paper md:flex">
      <div className="border-b border-line p-5">
        <Logo showTagline={false} />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
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
      <div className="border-t border-line p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-2 transition hover:bg-cream-2 hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          View store
        </Link>
      </div>
    </aside>
  );
}
