"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { LogIn, Lock, AlertCircle } from "lucide-react";
import { signInAction, type SignInState } from "@/app/(admin)/admin/sign-in/actions";

const initial: SignInState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep disabled:opacity-60"
    >
      <LogIn className="size-4" />
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useActionState(signInAction, initial);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-xl border border-line bg-paper p-8 shadow-soft"
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-primary">
        <Lock className="size-6" />
      </div>
      <h1 className="mt-4 text-center text-xl font-bold">Sign in</h1>
      <p className="mt-1 text-center text-sm text-ink-2">
        Evolve Wholesale admin — authorized accounts only.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-2">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-md border border-line bg-cream px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-2">Password</span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="mt-1.5 w-full rounded-md border border-line bg-cream px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-accent-soft"
          />
        </label>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
