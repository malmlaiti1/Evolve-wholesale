"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-7" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-ink-2">
        We hit a snag loading this page. Please try again in a moment.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-line-2 bg-paper px-5 py-3 text-sm font-semibold transition hover:bg-cream"
        >
          Back to catalog
        </Link>
      </div>
    </div>
  );
}
