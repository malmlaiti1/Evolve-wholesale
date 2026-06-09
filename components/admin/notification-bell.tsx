"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

// Polls the pending-order count every 30s.
export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch("/api/orders/count?status=pending")
        .then((r) => r.json())
        .then((d) => {
          if (active) setCount(d.count ?? 0);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <Link
      href="/admin/orders?status=pending"
      aria-label={`${count} pending order${count === 1 ? "" : "s"}`}
      className="relative flex size-9 items-center justify-center rounded-full bg-cream-2 text-ink-2 transition hover:bg-cream-deep hover:text-ink"
    >
      <Bell className="size-4" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
