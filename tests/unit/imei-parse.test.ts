import { describe, it, expect } from "vitest";
import { pickReportObject, pickOrderId, toFields } from "@/lib/imei/parse";

describe("pickReportObject", () => {
  it("reads the documented response.services[0] shape", () => {
    const payload = {
      status: 1,
      response: { services: [{ Model: "IPHONE X", IMEI: "35487209158", FMI: "ON" }] },
    };
    expect(pickReportObject(payload)).toEqual({
      Model: "IPHONE X",
      IMEI: "35487209158",
      FMI: "ON",
    });
  });

  it("reads a flat report object directly under response", () => {
    const payload = { status: 1, response: { Brand: "Apple", Model: "iPhone 12" } };
    expect(pickReportObject(payload)).toEqual({ Brand: "Apple", Model: "iPhone 12" });
  });

  it("reads a report under response.result", () => {
    const payload = { status: 1, response: { result: { Make: "Samsung", Model: "S21" } } };
    expect(pickReportObject(payload)).toEqual({ Make: "Samsung", Model: "S21" });
  });

  it("reads a report when response is an array", () => {
    const payload = { status: 1, response: [{ Carrier: "Verizon" }] };
    expect(pickReportObject(payload)).toEqual({ Carrier: "Verizon" });
  });

  it("returns null for an orderId-only async ack", () => {
    expect(pickReportObject({ status: 1, orderId: 123456 })).toBeNull();
  });

  it("returns null for an empty / control-only response", () => {
    expect(pickReportObject({ status: 1, response: {} })).toBeNull();
    expect(pickReportObject({ status: 1, response: { credits: 9.78 } })).toBeNull();
  });
});

describe("pickOrderId", () => {
  it("finds a top-level orderId", () => {
    expect(pickOrderId({ status: 1, orderId: 123456 })).toBe("123456");
  });
  it("finds a nested response.orderId", () => {
    expect(pickOrderId({ status: 1, response: { orderId: 99 } })).toBe("99");
  });
  it("returns null when absent", () => {
    expect(pickOrderId({ status: 1, response: { Model: "x" } })).toBeNull();
  });
});

describe("toFields", () => {
  it("flattens string values and drops empties", () => {
    expect(toFields({ Model: "iPhone X", Serial: "", FMI: "ON" })).toEqual([
      { label: "Model", value: "iPhone X" },
      { label: "FMI", value: "ON" },
    ]);
  });

  it("flattens one level of nesting with a separator", () => {
    expect(toFields({ Warranty: { Status: "Expired", Coverage: "None" } })).toEqual([
      { label: "Warranty · Status", value: "Expired" },
      { label: "Warranty · Coverage", value: "None" },
    ]);
  });

  it("joins array values", () => {
    expect(toFields({ Notes: ["a", "b"] })).toEqual([{ label: "Notes", value: "a, b" }]);
  });
});
