import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  ScanLine,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match the pathname exactly (true) or by prefix (false/undefined). */
  exact?: boolean;
};

// Single source of truth for admin navigation — shared by the desktop sidebar
// and the mobile bottom-bar/More-sheet so they never drift.
export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/imei-checker", label: "IMEI Checker", icon: ScanLine },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

// The handful surfaced as bottom tabs on mobile (daily drivers). Everything
// else falls into the "More" sheet. Reorder here to change the phone tab bar.
export const MOBILE_TAB_HREFS = [
  "/admin",
  "/admin/inventory",
  "/admin/orders",
  "/admin/imei-checker",
] as const;

export function isNavActive(pathname: string, item: AdminNavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
