import { describe, it, expect } from "vitest";
import { isValidImei } from "@/lib/imei";

describe("isValidImei", () => {
  it("accepts a valid 15-digit Luhn IMEI", () => {
    expect(isValidImei("490154203237518")).toBe(true);
  });

  it("rejects a wrong checksum", () => {
    expect(isValidImei("490154203237519")).toBe(false);
  });

  it("rejects non-15-digit input", () => {
    expect(isValidImei("12345")).toBe(false);
    expect(isValidImei("4901542032375180")).toBe(false);
  });

  it("rejects non-numeric input", () => {
    expect(isValidImei("49015420323751a")).toBe(false);
  });
});
