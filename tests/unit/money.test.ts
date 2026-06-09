import { describe, it, expect } from "vitest";
import { money, money0 } from "@/lib/money";

describe("money", () => {
  it("shows whole dollars with no decimals", () => {
    expect(money(560)).toBe("$560");
  });
  it("shows two decimals for cents", () => {
    expect(money(11.5)).toBe("$11.50");
  });
  it("adds a thousands separator", () => {
    expect(money(3184)).toBe("$3,184");
  });
});

describe("money0", () => {
  it("rounds to whole dollars", () => {
    expect(money0(4269.7)).toBe("$4,270");
  });
});
