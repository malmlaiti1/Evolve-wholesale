import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getModel, getRelatedModels } from "@/lib/devices";
import { ModelCard } from "@/components/customer/model-card";
import { ModelDetailView } from "@/components/customer/model-detail-view";
import { money } from "@/lib/money";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const m = await getModel(id);
  if (!m) return { title: "Not found" };
  const from = Math.min(...m.grades.map((g) => g.price));
  return {
    title: `${m.brand} ${m.model}`,
    description: `${m.brand} ${m.model} — ${m.available} available, from ${money(from)}.`,
  };
}

export default async function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getModel(id);
  if (!m) notFound();
  const related = await getRelatedModels(m.brand, id);

  return (
    <div className="screen-in mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <nav className="mono flex items-center gap-1.5 text-xs text-ink-3">
        <Link href="/" className="hover:text-ink-2">Catalog</Link>
        <ChevronRight className="size-3" />
        <span className="text-ink-2">{m.brand}</span>
        <ChevronRight className="size-3" />
        <span className="text-ink">{m.model}</span>
      </nav>

      <ModelDetailView m={m} />

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold">More {m.brand}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((rm) => (
              <ModelCard key={rm.modelId} m={rm} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
