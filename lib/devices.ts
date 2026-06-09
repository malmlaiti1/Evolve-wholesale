import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Tables, Enums } from "@/lib/supabase/types";

// A single phone (view row — never includes imei/cost).
export type CatalogUnit = Tables<"devices_public">;

// A category with its available units aggregated for the storefront grid.
export type CatalogModel = {
  modelId: string;
  brand: string;
  model: string;
  available: number;
  fromPrice: number;
  grades: Enums<"device_grade">[];
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
    .select("model_id, brand, model, price, grade, created_at")
    .eq("status", "available");
  if (filters.brands?.length) q = q.in("brand", filters.brands);
  if (filters.search) {
    const s = sanitize(filters.search);
    if (s) q = q.or(`brand.ilike.%${s}%,model.ilike.%${s}%`);
  }
  const { data, error } = await q;
  if (error) throw error;

  type Acc = CatalogModel & { newest: string };
  const map = new Map<string, Acc>();
  for (const u of data ?? []) {
    if (!u.model_id) continue;
    let m = map.get(u.model_id);
    if (!m) {
      m = {
        modelId: u.model_id,
        brand: u.brand ?? "",
        model: u.model ?? "",
        available: 0,
        fromPrice: Number(u.price),
        grades: [],
        newest: u.created_at ?? "",
      };
      map.set(u.model_id, m);
    }
    m.available++;
    m.fromPrice = Math.min(m.fromPrice, Number(u.price));
    if (u.grade && !m.grades.includes(u.grade)) m.grades.push(u.grade);
    if ((u.created_at ?? "") > m.newest) m.newest = u.created_at ?? "";
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
  }));
}

export async function getModel(modelId: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("devices_public")
    .select("*")
    .eq("model_id", modelId)
    .eq("status", "available")
    .order("price", { ascending: true });
  if (error) throw error;
  const units = (data ?? []) as CatalogUnit[];
  if (units.length === 0) return null;
  return {
    modelId,
    brand: units[0].brand ?? "",
    model: units[0].model ?? "",
    units,
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
