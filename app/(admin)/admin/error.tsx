"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({
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
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-line bg-paper p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle className="size-7" />
        </div>
        <h1 className="mt-5 text-xl font-bold">This admin page errored</h1>
        <p className="mt-2 text-sm text-ink-2">
          Something failed while loading. Retry, or check the server logs for details.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
