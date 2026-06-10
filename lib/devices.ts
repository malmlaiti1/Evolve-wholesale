import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/types";

// A category with its available units aggregated for the storefront grid.
export type CatalogModel = {
  modelId: string;
  brand: string;
  model: string;
  available: number;
  fromPrice: number;
  grades: Enums<"device_grade">[];
  imageUrl: string | null;
};

export type SortKey = "newest" | "price-asc" | "price-desc";

function sanitize(s: string) {
  return s.replace(/[%,()*:]/g, " ").trim();
}

export async function getCatalogModels(
  filters: { brands?: string[]; search?: string; sort?: SortKey } = {},
): Promise<CatalogModel[]> {
  const supabase = createServerSupabase();
  let q = supabase
    .from("devices_public")
    .select("model_id, brand, model, price, grade, created_at, image_url")
    .eq("status", "available");
  if (filters.brands?.length) q = q.in("brand", filters.brands);
  if (filters.search) {
    const s = sanitize(filters.search);
    if (s) q = q.or(`brand.ilike.%${s}%,model.ilike.%${s}%`);
  }
  const { data, error } = await q;
  if (error) throw error;

  // `topPrice`/`topCreatedAt` track the highest-priced available unit (earliest
  // created on a tie) — its photo is the one shown on the catalog card, matching
  // the unit create_order sells first.
  type Acc = CatalogModel & { newest: string; topPrice: number; topCreatedAt: string };
  const map = new Map<string, Acc>();
  for (const u of data ?? []) {
    if (!u.model_id) continue;
    const price = Number(u.price);
    const createdAt = u.created_at ?? "";
    let m = map.get(u.model_id);
    if (!m) {
      m = {
        modelId: u.model_id,
        brand: u.brand ?? "",
        model: u.model ?? "",
        available: 0,
        fromPrice: price,
        grades: [],
        imageUrl: u.image_url ?? null,
        newest: createdAt,
        topPrice: price,
        topCreatedAt: createdAt,
      };
      map.set(u.model_id, m);
    }
    m.available++;
    m.fromPrice = Math.min(m.fromPrice, price);
    if (price > m.topPrice || (price === m.topPrice && createdAt < m.topCreatedAt)) {
      m.topPrice = price;
      m.topCreatedAt = createdAt;
      m.imageUrl = u.image_url ?? null;
    }
    if (u.grade && !m.grades.includes(u.grade)) m.grades.push(u.grade);
    if (createdAt > m.newest) m.newest = createdAt;
  }

  const models = [...map.values()];
  switch (filters.sort) {
    case "price-asc":
      models.sort((a, b) => a.fromPrice - b.fromPrice);
      break;
    case "price-desc":
      models.sort((a, b) => b.fromPrice - a.fromPrice);
      break;
    default:
      models.sort((a, b) => b.newest.localeCompare(a.newest));
  }
  return models.map((m) => ({
    modelId: m.modelId,
    brand: m.brand,
    model: m.model,
    available: m.available,
    fromPrice: m.fromPrice,
    grades: m.grades,
    imageUrl: m.imageUrl,
  }));
}

// One buyable offer per grade: how many are available and the price charged
// (the highest price among the available units of that grade).
export type GradeOffer = {
  grade: Enums<"device_grade">;
  available: number;
  price: number;
  imageUrl: string | null;
};

export type ModelDetail = {
  modelId: string;
  brand: string;
  model: string;
  available: number;
  grades: GradeOffer[];
};

// Best-first grade ordering for display.
const GRADE_RANK: Record<Enums<"device_grade">, number> = {
  "A+": 0,
  A: 1,
  "B+": 2,
  B: 3,
  C: 4,
};

export async function getModel(modelId: string): Promise<ModelDetail | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("devices_public")
    .select("brand, model, grade, price, created_at, image_url")
    .eq("model_id", modelId)
    .eq("status", "available");
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return null;

  // Per grade, the price + photo come from the highest-priced available unit
  // (earliest created on a tie) — the same unit create_order locks/sells first.
  type Agg = GradeOffer & { topCreatedAt: string };
  const byGrade = new Map<Enums<"device_grade">, Agg>();
  for (const r of rows) {
    if (!r.grade) continue;
    const price = Number(r.price);
    const createdAt = r.created_at ?? "";
    const image = r.image_url ?? null;
    const existing = byGrade.get(r.grade);
    if (!existing) {
      byGrade.set(r.grade, {
        grade: r.grade,
        available: 1,
        price,
        imageUrl: image,
        topCreatedAt: createdAt,
      });
    } else {
      existing.available++;
      if (price > existing.price || (price === existing.price && createdAt < existing.topCreatedAt)) {
        existing.price = price; // highest available = the grade price
        existing.imageUrl = image;
        existing.topCreatedAt = createdAt;
      }
    }
  }

  const grades: GradeOffer[] = [...byGrade.values()]
    .sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade])
    .map((g) => ({ grade: g.grade, available: g.available, price: g.price, imageUrl: g.imageUrl }));
  return {
    modelId,
    brand: rows[0].brand ?? "",
    model: rows[0].model ?? "",
    available: rows.length,
    grades,
  };
}

export async function getRelatedModels(brand: string, excludeModelId: string, limit = 4) {
  const all = await getCatalogModels({ brands: [brand] });
  return all.filter((m) => m.modelId !== excludeModelId).slice(0, limit);
}

export async function getBrandsWithCounts() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("devices_public")
    .select("brand")
    .eq("status", "available");
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const b = (row as { brand: string | null }).brand;
    if (b) counts.set(b, (counts.get(b) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}
