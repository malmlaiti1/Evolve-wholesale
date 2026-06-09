import { describe, it, expect } from "vitest";
import { ORDER_TRANSITIONS } from "@/lib/constants";

describe("order status machine", () => {
  it("pending → approved or denied", () => {
    expect(ORDER_TRANSITIONS.pending).toEqual(["approved", "denied"]);
  });
  it("approved → on_the_way only", () => {
    expect(ORDER_TRANSITIONS.approved).toEqual(["on_the_way"]);
  });
  it("on_the_way → delivered only", () => {
    expect(ORDER_TRANSITIONS.on_the_way).toEqual(["delivered"]);
  });
  it("delivered and denied are terminal", () => {
    expect(ORDER_TRANSITIONS.delivered).toEqual([]);
    expect(ORDER_TRANSITIONS.denied).toEqual([]);
  });
  it("forbids skipping straight to delivered", () => {
    expect(ORDER_TRANSITIONS.pending).not.toContain("delivered");
    expect(ORDER_TRANSITIONS.approved).not.toContain("delivered");
  });
});
