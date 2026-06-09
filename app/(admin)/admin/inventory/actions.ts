"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/clerk/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { modelSchema, unitSchema } from "@/lib/validators/device";

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertAdmin() {
  const ctx = await getAdminContext();
  if (!ctx.isAdmin) throw new Error("Not authorized");
}

// ---------- Categories (device_models) ----------
export async function createModel(
  input: unknown,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await assertAdmin();
  const parsed = modelSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };
  }
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from("device_models")
    .insert({
      brand: parsed.data.brand,
      model: parsed.data.model,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return { ok: false, error: "That category already exists." };
    return { ok: false, error: "Could not create the category." };
  }
  revalidatePath("/admin/inventory");
  return { ok: true, id: data.id };
}

export async function updateModel(id: string, input: unknown): Promise<ActionResult> {
  await assertAdmin();
  const parsed = modelSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };
  }
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("device_models")
    .update({
      brand: parsed.data.brand,
      model: parsed.data.model,
      description: parsed.data.description || null,
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Another category already has that brand + model." };
    return { ok: false, error: "Could not update the category." };
  }
  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteModel(id: string): Promise<ActionResult> {
  await assertAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("device_models").delete().eq("id", id);
  if (error) {
    if (error.code === "23503")
      return { ok: false, error: "This category still has phones — remove them first." };
    return { ok: false, error: "Could not delete the category." };
  }
  revalidatePath("/admin/inventory");
  return { ok: true };
}

// ---------- Units (devices) ----------
function unitRow(d: ReturnType<typeof unitSchema.parse>) {
  return {
    imei: d.imei || null,
    storage: d.storage || null,
    color: d.color || null,
    carrier: d.carrier || null,
    grade: d.grade,
    battery_health: d.battery_health ?? null,
    price: d.price,
    cost: d.cost ?? null,
    is_local: d.is_local,
    condition_notes: d.condition_notes || null,
  };
}

export async function createUnit(modelId: string, input: unknown): Promise<ActionResult> {
  await assertAdmin();
  const parsed = unitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid phone details" };
  }
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("devices").insert({ model_id: modelId, ...unitRow(parsed.data) });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "A phone with that IMEI already exists." };
    return { ok: false, error: "Could not add the phone." };
  }
  revalidatePath(`/admin/inventory/${modelId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { ok: true };
}

export async function updateUnit(id: string, input: unknown): Promise<ActionResult> {
  await assertAdmin();
  const parsed = unitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid phone details" };
  }
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("devices").update(unitRow(parsed.data)).eq("id", id);
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Another phone already has that IMEI." };
    return { ok: false, error: "Could not update the phone." };
  }
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { ok: true };
}

export async function archiveUnit(id: string): Promise<ActionResult> {
  await assertAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase
    .from("devices")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: "Could not archive the phone." };
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteUnit(id: string): Promise<ActionResult> {
  await assertAdmin();
  const supabase = createAdminSupabase();
  const { error } = await supabase.from("devices").delete().eq("id", id);
  if (error) {
    if (error.code === "23503")
      return { ok: false, error: "This phone is part of an order — archive it instead." };
    return { ok: false, error: "Could not delete the phone." };
  }
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  return { ok: true };
}
