import { describe, it, expect } from "vitest";
import { apiUrl, API_BASE } from "./api";

describe("apiUrl", () => {
  it("prefixes the path with API_BASE", () => {
    expect(apiUrl("/prices")).toBe(`${API_BASE}/prices`);
    expect(apiUrl("/api/feedback")).toBe(`${API_BASE}/api/feedback`);
  });

  it("does not strip or rewrite the path", () => {
    expect(apiUrl("/foo/bar?q=1")).toBe(`${API_BASE}/foo/bar?q=1`);
    expect(apiUrl("")).toBe(API_BASE);
  });
});
