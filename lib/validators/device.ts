import { z } from "zod";

// A category (brand + model). Storage and everything else live on the units.
export const modelSchema = z.object({
  brand: z.string().trim().min(1, "Brand is required").max(60),
  model: z.string().trim().min(1, "Model is required").max(80),
  description: z.string().trim().max(500).nullish(),
});
export type ModelInput = z.infer<typeof modelSchema>;

// A single phone under a category.
export const unitSchema = z.object({
  imei: z.string().trim().regex(/^\d{15}$/, "IMEI must be exactly 15 digits").nullish(),
  storage: z.string().trim().max(20).nullish(),
  color: z.string().trim().max(40).nullish(),
  carrier: z.string().trim().max(40).nullish(),
  grade: z.enum(["A+", "A", "B+", "B", "C"]),
  battery_health: z.number().int().min(0).max(100).nullish(),
  price: z.number().nonnegative("Price can't be negative").max(100000),
  cost: z.number().nonnegative().max(100000).nullish(),
  is_local: z.boolean(),
  condition_notes: z.string().trim().max(500).nullish(),
});
export type UnitInput = z.infer<typeof unitSchema>;
