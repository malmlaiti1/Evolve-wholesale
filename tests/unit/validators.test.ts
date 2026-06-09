import { describe, it, expect } from "vitest";
import { checkoutSchema } from "@/lib/validators/checkout";
import { modelSchema, unitSchema } from "@/lib/validators/device";

describe("checkoutSchema", () => {
  const ok = {
    customer: { name: "Jordan Reyes", email: "a@b.com", phone: "5550100", address: "1 Main St, City 00001" },
    items: [{ id: "0b3e3f16-afe9-4a80-bcd5-ccccf0c2ef3b", price: 560 }],
    idempotencyKey: "abcd1234efgh",
  };
  it("accepts a valid checkout", () => {
    expect(checkoutSchema.safeParse(ok).success).toBe(true);
  });
  it("rejects a too-short name", () => {
    expect(checkoutSchema.safeParse({ ...ok, customer: { ...ok.customer, name: "X" } }).success).toBe(false);
  });
  it("rejects a bad email", () => {
    expect(checkoutSchema.safeParse({ ...ok, customer: { ...ok.customer, email: "nope" } }).success).toBe(false);
  });
  it("rejects an empty cart", () => {
    expect(checkoutSchema.safeParse({ ...ok, items: [] }).success).toBe(false);
  });
});

describe("modelSchema (category)", () => {
  it("accepts a valid category", () => {
    expect(modelSchema.safeParse({ brand: "Apple", model: "iPhone 13" }).success).toBe(true);
  });
  it("rejects an empty brand", () => {
    expect(modelSchema.safeParse({ brand: "", model: "iPhone 13" }).success).toBe(false);
  });
});

describe("unitSchema (phone)", () => {
  const ok = { imei: "490154203237518", grade: "A", price: 480, is_local: true, battery_health: 90 };
  it("accepts a valid phone", () => {
    expect(unitSchema.safeParse(ok).success).toBe(true);
  });
  it("accepts a phone with no IMEI yet", () => {
    expect(unitSchema.safeParse({ ...ok, imei: null }).success).toBe(true);
  });
  it("rejects a 14-digit IMEI", () => {
    expect(unitSchema.safeParse({ ...ok, imei: "49015420323751" }).success).toBe(false);
  });
  it("rejects an unknown grade", () => {
    expect(unitSchema.safeParse({ ...ok, grade: "Z" }).success).toBe(false);
  });
  it("rejects a negative price", () => {
    expect(unitSchema.safeParse({ ...ok, price: -5 }).success).toBe(false);
  });
});
