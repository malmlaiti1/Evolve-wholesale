import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="screen-in mx-auto max-w-xl px-5 py-16">
      <div className="rounded-lg border border-line bg-paper p-12 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="size-9" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Order placed</h1>
        <p className="mt-3 leading-relaxed text-ink-2">
          Thanks! We&rsquo;re preparing your order for local delivery. You&rsquo;ll pay cash when it
          arrives.
        </p>
        {order && (
          <div className="mono mt-6 inline-block rounded-md bg-cream-2 px-6 py-3">
            <div className="text-xs uppercase tracking-wide text-ink-3">Order number</div>
            <div className="mt-0.5 text-xl font-bold text-primary">{order}</div>
          </div>
        )}
        <p className="mt-6 text-sm text-ink-2">Save your order number to track status anytime.</p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/orders${order ? `?order=${encodeURIComponent(order)}` : ""}`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-deep"
          >
            Track this order <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-line-2 bg-paper px-5 py-3 text-sm font-semibold transition hover:bg-cream"
          >
            Keep browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
