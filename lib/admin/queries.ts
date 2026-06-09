import "server-only";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import type { Tables, Enums } from "@/lib/supabase/types";

export type AdminDevice = Tables<"devices">;
export type AdminOrder = Tables<"orders">;
export type AdminModel = {
  id: string;
  brand: string;
  model: string;
  description: string | null;
  total: number;
  available: number;
  sold: number;
  minPrice: number | null;
  maxPrice: number | null;
  grades: Enums<"device_grade">[];
};

// Categories with their (non-archived) unit aggregates.
export async function getModels(): Promise<AdminModel[]> {
  const supabase = createAdminSupabase();
  const [modelsRes, devicesRes] = await Promise.all([
    supabase.from("device_models").select("id, brand, model, description").order("brand").order("model"),
    supabase.from("devices").select("model_id, status, price, grade").is("archived_at", null),
  ]);
  if (modelsRes.error) throw modelsRes.error;
  if (devicesRes.error) throw devicesRes.error;

  const byModel = new Map<
    string,
    { total: number; available: number; sold: number; prices: number[]; grades: Set<string> }
  >();
  for (const d of devicesRes.data ?? []) {
    let g = byModel.get(d.model_id);
    if (!g) {
      g = { total: 0, available: 0, sold: 0, prices: [], grades: new Set() };
      byModel.set(d.model_id, g);
    }
    g.total++;
    if (d.status === "available") g.available++;
    if (d.status === "sold") g.sold++;
    g.prices.push(Number(d.price));
    g.grades.add(d.grade);
  }

  return (modelsRes.data ?? []).map((m) => {
    const g = byModel.get(m.id);
    return {
      id: m.id,
      brand: m.brand,
      model: m.model,
      description: m.description,
      total: g?.total ?? 0,
      available: g?.available ?? 0,
      sold: g?.sold ?? 0,
      minPrice: g && g.prices.length ? Math.min(...g.prices) : null,
      maxPrice: g && g.prices.length ? Math.max(...g.prices) : null,
      grades: g ? ([...g.grades] as Enums<"device_grade">[]) : [],
    };
  });
}

export async function getModelDetail(modelId: string) {
  const supabase = createAdminSupabase();
  const [modelRes, unitsRes] = await Promise.all([
    supabase.from("device_models").select("*").eq("id", modelId).maybeSingle(),
    supabase
      .from("devices")
      .select("*")
      .eq("model_id", modelId)
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
  ]);
  if (modelRes.error) throw modelRes.error;
  if (unitsRes.error) throw unitsRes.error;
  if (!modelRes.data) return null;
  return {
    model: modelRes.data as Tables<"device_models">,
    units: (unitsRes.data ?? []) as AdminDevice[],
  };
}

export async function getInventoryStats() {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("devices")
    .select("price, cost, status, is_local")
    .is("archived_at", null);
  if (error) throw error;
  const rows = (data ?? []) as Pick<AdminDevice, "price" | "cost" | "status" | "is_local">[];
  const avail = rows.filter((r) => r.status === "available");
  const value = avail.reduce((s, r) => s + Number(r.price), 0);
  const cost = avail.reduce((s, r) => s + Number(r.cost ?? 0), 0);
  return {
    total: rows.length,
    available: avail.length,
    sold: rows.filter((r) => r.status === "sold").length,
    listed: avail.filter((r) => r.is_local).length,
    value,
    cost,
    margin: value - cost,
  };
}

export async function getDashboard() {
  const supabase = createAdminSupabase();
  const [devRes, recentRes, ordersCount, pendingCount, revenueRes] = await Promise.all([
    supabase
      .from("devices")
      .select("status, price, is_local, device_models(brand, model)")
      .is("archived_at", null),
    supabase
      .from("orders")
      .select("order_number, customer_name, status, total, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("total, status, created_at"),
  ]);
  if (devRes.error) throw devRes.error;

  type DevRow = {
    status: string;
    price: number;
    is_local: boolean;
    device_models: { brand: string; model: string } | null;
  };
  const devices = (devRes.data ?? []) as unknown as DevRow[];
  const available = devices.filter((d) => d.status === "available");
  const localCount = available.filter((d) => d.is_local).length;

  const byModel = new Map<string, number>();
  for (const d of available) {
    const name = d.device_models ? `${d.device_models.brand} ${d.device_models.model}` : "Unknown";
    byModel.set(name, (byModel.get(name) ?? 0) + 1);
  }
  const lowStock = [...byModel.entries()]
    .filter(([, n]) => n <= LOW_STOCK_THRESHOLD)
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 8);

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString("en-US", { month: "short" }),
      value: 0,
    };
  });
  const monthIdx = new Map(months.map((m, i) => [m.key, i]));
  for (const o of (revenueRes.data ?? []) as { total: number; status: string; created_at: string }[]) {
    if (o.status === "denied") continue;
    const d = new Date(o.created_at);
    const i = monthIdx.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i != null) months[i].value += Number(o.total);
  }

  return {
    value: available.reduce((s, d) => s + Number(d.price), 0),
    availableCount: available.length,
    localCount,
    totalOrders: ordersCount.count ?? 0,
    pendingOrders: pendingCount.count ?? 0,
    recentOrders: (recentRes.data ?? []) as Pick<
      AdminOrder,
      "order_number" | "customer_name" | "status" | "total" | "created_at"
    >[],
    lowStock,
    revenue: months,
  };
}
