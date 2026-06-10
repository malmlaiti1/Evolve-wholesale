"use client";

import { LogOut } from "lucide-react";
import { signOutAction } from "@/app/(admin)/admin/sign-in/actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-2 transition hover:bg-danger-soft hover:text-danger"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </form>
  );
}
