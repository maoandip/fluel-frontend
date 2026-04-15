import { describe, it, expect } from "vitest";
import { txStatusClass, giftStatusClass } from "./status";

describe("txStatusClass", () => {
  it("maps known statuses to their class", () => {
    expect(txStatusClass("DONE")).toBe("statusDone");
    expect(txStatusClass("PENDING")).toBe("statusPending");
    expect(txStatusClass("FAILED")).toBe("statusFailed");
    expect(txStatusClass("NOT_FOUND")).toBe("statusFailed");
  });

  it("falls back to unknown for unrecognized statuses", () => {
    expect(txStatusClass("")).toBe("statusUnknown");
    expect(txStatusClass("UNKNOWN")).toBe("statusUnknown");
    expect(txStatusClass("done")).toBe("statusUnknown"); // case-sensitive
  });
});

describe("giftStatusClass", () => {
  it("maps known statuses to their class", () => {
    expect(giftStatusClass("claimed")).toBe("statusClaimed");
    expect(giftStatusClass("pending")).toBe("statusPending");
    expect(giftStatusClass("expired")).toBe("statusExpired");
  });

  it("falls back to default for unrecognized statuses", () => {
    expect(giftStatusClass("")).toBe("statusDefault");
    expect(giftStatusClass("foo")).toBe("statusDefault");
  });
});
