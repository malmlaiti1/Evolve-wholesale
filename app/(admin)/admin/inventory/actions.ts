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

  // Archived units are hidden from the admin UI (both inventory queries filter
  // `archived_at is null`) but still hold a foreign key to the category — which
  // would block deletion forever with no way to see or remove them. So first
  // purge this category's archived units that aren't tied to any order
  // (order-linked units are kept for records and intentionally still block).
  const { data: archived } = await supabase
    .from("devices")
    .select("id")
    .eq("model_id", id)
    .not("archived_at", "is", null);

  if (archived && archived.length > 0) {
    const ids = archived.map((d) => d.id);
    const { data: ordered } = await supabase
      .from("order_items")
      .select("device_id")
      .in("device_id", ids);
    const keep = new Set((ordered ?? []).map((o) => o.device_id));
    const purge = ids.filter((i) => !keep.has(i));
    if (purge.length > 0) await supabase.from("devices").delete().in("id", purge);
  }

  const { error } = await supabase.from("device_models").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      // Still blocked: distinguish visible (live) units from units kept for
      // order history so the message is actionable.
      const { data: live } = await supabase
        .from("devices")
        .select("id")
        .eq("model_id", id)
        .is("archived_at", null)
        .limit(1);
      return {
        ok: false,
        error:
          live && live.length > 0
            ? "This category still has phones — remove them first."
            : "This category has phones tied to past orders, so it can’t be deleted (they’re kept for your records).",
      };
    }
    return { ok: false, error: "Could not delete the category." };
  }
  revalidatePath("/admin/inventory");
  return { ok: true };
}

// ---------- Product images ----------
const IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// Uploads a product photo to the public `product-images` bucket and returns its
// public URL. Called from the admin unit drawer when a file is selected.
export async function uploadProductImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await assertAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No image was provided." };
  }
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { ok: false, error: "Use a PNG, JPG, or WebP image." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Image must be 5 MB or smaller." };

  const supabase = createAdminSupabase();
  const path = `devices/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: "Could not upload the image." };

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
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
    image_url: d.image_url,
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
