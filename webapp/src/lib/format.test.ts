import { describe, it, expect } from "vitest";
import { fmtSmall, gweiLevel } from "./format";

describe("gweiLevel", () => {
  it("classifies sub-10 gwei as low", () => {
    expect(gweiLevel(0)).toBe("low");
    expect(gweiLevel(0.5)).toBe("low");
    expect(gweiLevel(9.99)).toBe("low");
  });

  it("classifies 10-49 gwei as mid", () => {
    expect(gweiLevel(10)).toBe("mid");
    expect(gweiLevel(25)).toBe("mid");
    expect(gweiLevel(49.99)).toBe("mid");
  });

  it("classifies 50+ gwei as high", () => {
    expect(gweiLevel(50)).toBe("high");
    expect(gweiLevel(100)).toBe("high");
    expect(gweiLevel(1000)).toBe("high");
  });
});

describe("fmtSmall", () => {
  it("formats values >= 1 with one decimal", () => {
    expect(fmtSmall(23.5)).toBe("23.5");
    expect(fmtSmall(1.2)).toBe("1.2");
    expect(fmtSmall(1)).toBe("1.0");
    expect(fmtSmall(99.94)).toBe("99.9");
  });

  it("formats values 0.1 - 0.99 with two decimals", () => {
    expect(fmtSmall(0.5)).toBe("0.50");
    expect(fmtSmall(0.99)).toBe("0.99");
    expect(fmtSmall(0.1)).toBe("0.10");
  });

  it("uses subscript notation for any sub-0.1 value (one or more leading zeros)", () => {
    expect(fmtSmall(0.042)).toBe("0.0₁42");
    expect(fmtSmall(0.00031)).toBe("0.0₃31");
    expect(fmtSmall(0.000005)).toBe("0.0₅5");
  });
});
